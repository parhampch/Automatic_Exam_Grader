from flask import Flask, jsonify, request 
from flask import url_for, redirect
from flask_cors import CORS
import json
from types import SimpleNamespace
import threading
import time
import openai
import Levenshtein
import os
from OMR2 import find as find_omr2
from OMR2_scanned import find as find_omr2_scanned
from number_processing import process_number
from tflite_runtime.interpreter import Interpreter

interpreter = Interpreter(model_path="model-small-pics.tflite")

with open("api_key.txt", "r") as f:
    openai.api_key = f.read().strip()

lock = threading.Lock()

app = Flask(__name__, static_url_path='/static')
CORS(app)

def load_data_from_file(file_name):
    with open(file_name + ".json", "r") as f:
        return json.loads(f.read())

def save_data_to_file(file_name, data):
    with open(file_name + ".json", "w") as f:
        f.write(json.dumps(data, default=lambda o: o.__dict__, indent=4))

def save_error_log(error):
    error_data = load_data_from_file("errors")
    error_data.append({"error": error, "time": int(time.time())})
    save_data_to_file("errors", error_data)

    
def calculate_score_for_submission(submission, questions_data, negative_point):
    try:
        number_of_correct = 0
        number_of_incorrect = 0
        number_of_total = 0
        for i in range(len(questions_data)):
            if submission["answers"][i] == questions_data[i]["correct"]:
                number_of_correct += int(questions_data[i]["weight"])
            elif submission["answers"][i] != 4:
                number_of_incorrect += int(questions_data[i]["weight"])
            number_of_total += int(questions_data[i]["weight"])
        score = 100.0 * (1.0 * negative_point * number_of_correct - 1.0 * number_of_incorrect) / (1.0 * negative_point * number_of_total)
        print("score", number_of_correct, number_of_incorrect, number_of_total, score)
        return score
    except Exception as e:
        print(e)
        save_error_log("calculate_score_for_submission")
        return 0

@app.route('/')
def home():
    return redirect(url_for('static', filename='index.html'))

def find_word_min_levenshtein(classified_word, all_words, threshold):
    min_levenshtein = 1000
    min_levenshtein_word = ""
    for word in all_words:
        levenshtein = Levenshtein.distance(classified_word, word)
        if levenshtein < min_levenshtein:
            min_levenshtein = levenshtein
            min_levenshtein_word = word
    if min_levenshtein_word != "" and min_levenshtein <= threshold:
        return min_levenshtein_word, min_levenshtein
    else:
        return classified_word, min_levenshtein

def find_student_id_of_name(name, studentnames_data):
    name = name.strip()
    for studentname in studentnames_data:
        if studentname["name"].strip() == name:
            return studentname["studentID"]
    return -1

@app.route('/analyzeImage', methods=['POST'])
def analyze_image():
    global interpreter
    try:
        answer_key = get_answer_key()
        all_answers = []
        try:
            all_answers = find_omr2_scanned(answer_key)
        except Exception as e:
            print("Exception in OMR2_scanned:", e)
            print("Trying OMR2 instead")
            all_answers = find_omr2(answer_key)
        print("Answers:", all_answers)
        os.system("tesseract name.png tesseract_output_name -l fas --oem 3 --psm 6")
        os.system("tesseract number.png tesseract_output_number -l fas --oem 3 --psm 6")
        studentnames_data = load_data_from_file("studentnames")
        all_names = []
        for studentname in studentnames_data:
            all_names.append(studentname["name"])
        name = ""
        studentID_from_tensorflow_a, studentID_from_tensorflow_b = process_number(interpreter)
        print("Tf_a:", studentID_from_tensorflow_a)
        print("Tf_b:", studentID_from_tensorflow_b)
        studentID_from_tesseract = ""
        with open("tesseract_output_number.txt", "r") as f:
            studentID_from_tesseract = str(str(f.read()).strip())
        print("Tesseract:", studentID_from_tesseract)
        with open("tesseract_output_name.txt", "r") as f:
            name = f.read().strip()
            print("Tesseract name:", name)
            name, _ = find_word_min_levenshtein(name, all_names, 5)
            saved_studentID = str(find_student_id_of_name(name, studentnames_data))
            if saved_studentID != "-1":
                studentID_from_tesseract_best, studentID_from_tesseract_distance = find_word_min_levenshtein(studentID_from_tesseract, [saved_studentID], 100)
                studentID_from_tensorflow_a_best, studentID_from_tensorflow_a_distance = find_word_min_levenshtein(studentID_from_tensorflow_a, [saved_studentID], 100)
                studentID_from_tensorflow_b_best, studentID_from_tensorflow_b_distance = find_word_min_levenshtein(studentID_from_tensorflow_b, [saved_studentID], 100)
                studentID_dict = {studentID_from_tesseract_distance: studentID_from_tesseract_best, studentID_from_tensorflow_a_distance: studentID_from_tensorflow_a_best, studentID_from_tensorflow_b_distance: studentID_from_tensorflow_b_best}
                studentID = studentID_dict[min(studentID_dict.keys())]
                print("here 1! studentID:", studentID)
            else:
                studentID = studentID_from_tensorflow_a
                print("here 2! studentID:", studentID)
        temporary_results = {"name": name, "studentID": studentID, "allAnswers": all_answers}
        save_data_to_file("temporary_results", temporary_results)
        return jsonify({"success": True, "name": name, "studentID": studentID})
    except Exception as e:
        print(e)
        save_error_log("analyze_image")
        return jsonify({"success": False, "name": "", "studentID": ""})

@app.route('/confirmStudentDetails', methods=['POST'])
def confirm_student_details():
    try:
        temporary_results = load_data_from_file("temporary_results")
        submissions_data = load_data_from_file("submissions")
        submissions_data.append({
            "studentName": temporary_results["name"],
            "studentID": temporary_results["studentID"],
            "answers": temporary_results["allAnswers"]
        })
        save_data_to_file("submissions", submissions_data)
        return jsonify({"success": True})
    except Exception as e:
        print(e)
        save_error_log("confirm_student_details")
        return jsonify({"success": False})

@app.route('/uploadFile', methods=['POST'])
def upload_file():
    if request.method == 'POST':  
        f = request.files['file']
        f.save("new_image.png")
        return jsonify({"success": True})
    else:
        return jsonify({"success": False})

def getFeedbackFromGPT(wrong_question):
    messages = [
        {"role": "system", "content": "فرض کنید یک معلم هستید و سوالی به شما داده شده که دانش‌ آموز آن را غلط جواب داده است. به ازای هر سوال، به دانش آموز بازخورد داده و به او بگویید که چگونه باید موضوع این سوال را بهتر یاد بگیرد. جواب را به شکل «دانش آموز باید...» بدهید، نه به شکل «شما باید…». می‌توانید نکاتی جهت مطالعه بیشتر یا منابعی در خصوص موضوع سوال نیز معرفی کنید."},
        {"role": "user", "content": wrong_question}
    ]
    msg = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=messages
    )
    new_result = msg['choices'][0]['message']['content']
    return new_result

@app.route('/getFeedback', methods=['POST'])
def get_feedback():
    wrong_question = request.json['wrongQuestion']
    try:
        new_result = getFeedbackFromGPT(wrong_question)
        return jsonify({"success": True, "result": new_result})
    except Exception as e:
        print(e)
        save_error_log("get_feedback")
        return jsonify({"success": False, "result": ""})

@app.route('/getAllStudentNames', methods=['GET'])
def get_all_student_names():
    lock.acquire()
    try:
        studentnames_data = load_data_from_file("studentnames")
        lock.release()
        return jsonify({"success": True, "result": studentnames_data})
    except Exception as e:
        print(e)
        lock.release()
        save_error_log("get_all_student_names")
        return jsonify({"success": False, "result": []})
    
@app.route('/addStudentName', methods=['POST'])
def add_student_name():
    new_student_name = request.json['name']
    new_student_id = request.json['studentID']
    lock.acquire()
    try:
        studentnames_data = load_data_from_file("studentnames")
        studentnames_data.append({"name": new_student_name, "studentID": new_student_id})
        save_data_to_file("studentnames", studentnames_data)
        lock.release()
        return jsonify({"success": True})
    except Exception as e:
        print(e)
        lock.release()
        save_error_log("add_student_name")
        return jsonify({"success": False})

def get_answer_key():
    lock.acquire()
    try:
        questions_data = load_data_from_file("questions")
        answer_key = []
        for question in questions_data:
            answer_key.append(question["correct"])
        lock.release()
        return answer_key
    except Exception as e:
        print(e)
        lock.release()
        save_error_log("get_answer_key")
        return []

@app.route('/getAllQuestions', methods=['POST'])
def get_all_questions():
    lock.acquire()
    try:
        questions_data = load_data_from_file("questions")
        lock.release()
        return jsonify({"success": True, "result": questions_data})
    except Exception as e:
        print(e)
        lock.release()
        save_error_log("get_all_questions")
        return jsonify({"success": False, "result": []})

@app.route('/setAllQuestions', methods=['POST'])
def set_all_questions():
    all_questions = request.json['questions']
    print(all_questions)
    lock.acquire()
    try:
        save_data_to_file("questions", all_questions)
        lock.release()
        return jsonify({"success": True})
    except Exception as e:
        print(e)
        lock.release()
        save_error_log("set_all_questions")
        return jsonify({"success": False})

@app.route('/setQuestion', methods=['POST'])
def set_question():
    id = request.json['id']
    question = request.json['question']
    answer_0 = request.json['answer_0']
    answer_1 = request.json['answer_1']
    answer_2 = request.json['answer_2']
    answer_3 = request.json['answer_3']
    correct = request.json['correct']
    weight = request.json['weight']
    lock.acquire()
    try:
        questions_data = load_data_from_file("questions")
        questions_data[id] = {"question": question, "answers": [answer_0, answer_1, answer_2, answer_3], "correct": correct, "weight": weight}
        save_data_to_file("questions", questions_data)
        lock.release()
        return jsonify({"success": True})
    except Exception as e:
        print(e)
        lock.release()
        save_error_log("set_question")
        return jsonify({"success": False})

@app.route('/setNegativePoint', methods=['POST'])   
def set_negative_point():
    negative_point = request.json['negativePoint']
    lock.acquire()
    try:
        with open("negative_point.txt", "w") as f:
            f.write(str(negative_point))
        lock.release()
        return jsonify({"success": True})
    except Exception as e:
        print(e)
        lock.release()
        save_error_log("set_negative_point")
        return jsonify({"success": False})

def get_negative_point():
    try:
        with open("negative_point.txt", "r") as f:
            negative_point = int(f.read().strip())
        return negative_point
    except Exception as e:
        print(e)
        save_error_log("get_negative_point")
        return 0

def add_new_submission(new_submission):
    lock.acquire()
    try:
        submissions_data = load_data_from_file("submissions")
        submissions_data.append(new_submission)
        save_data_to_file("submissions", submissions_data)
        lock.release()
        return True
    except Exception as e:
        print(e)
        lock.release()
        save_error_log("add_new_submission")
        return False

@app.route('/getAllSubmissions', methods=['GET'])   
def get_all_submissions():
    lock.acquire()
    submissions_data = load_data_from_file("submissions")
    questions_data = load_data_from_file("questions")
    negative_point = get_negative_point()
    result = []
    for submission in submissions_data:
        result.append({
            "studentName": submission["studentName"],
            "studentID": submission["studentID"],
            "answers": submission["answers"],
            "score": calculate_score_for_submission(submission, questions_data, negative_point)
        })
    lock.release()
    return jsonify({"success": True, "result": result})

if __name__ == '__main__':
    app.run(host = '0.0.0.0', port = 5001, debug = True)

