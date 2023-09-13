import tensorflow.lite as tflite
import numpy as np
from PIL import Image, ImageOps
import cv2

interpreter = tflite.Interpreter(model_path="model-small-pics.tflite")

def resize_with_padding(image, new_shape): # From Stack Overflow
    original_shape = (image.shape[1], image.shape[0])
    ratio = float(max(new_shape))/max(original_shape)
    new_size = tuple([int(x*ratio) for x in original_shape])
    image = cv2.resize(image, new_size)
    delta_w = new_shape[0] - new_size[0]
    delta_h = new_shape[1] - new_size[1]
    top, bottom = delta_h // 2, delta_h-(delta_h//2)
    left, right = delta_w //2, delta_w-(delta_w//2)
    top = 0 if top < 0 else top
    bottom = 0 if bottom < 0 else bottom
    left = 0 if left < 0 else left
    right = 0 if right < 0 else right
    image = cv2.copyMakeBorder(image, top, bottom, left, right, cv2.BORDER_CONSTANT, value=(255, 255, 255))
    return image

def find_number(number_of_pictures, interpreter):
    result = ""
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    for i in range(0, number_of_pictures):
        img = cv2.imread('digits/roi_' + str(i) + '.png')
        img = resize_with_padding(img, (30, 49))
        img = cv2.resize(img, (30, 49))
        img = np.array(img, dtype="float32")
        processed_image = np.expand_dims(img, axis=0)
        interpreter.allocate_tensors()
        interpreter.set_tensor(input_details[0]['index'], processed_image)
        interpreter.invoke()
        predictions = interpreter.get_tensor(output_details[0]['index'])[0]
        max_j = 0
        max_predictions = -1
        for j in range(len(predictions)):
            if predictions[j] > 0 and predictions[j] > max_predictions:
                max_predictions = predictions[j]
                max_j = j
        result += "1" if max_predictions < 5 else str(max_j)
    return result


