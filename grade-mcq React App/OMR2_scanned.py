from imutils.perspective import four_point_transform
from imutils import contours
import numpy as np
import imutils
import cv2

def warp_image(cnt, orig):
    pts = cnt.reshape(4, 2)
    rect = np.zeros((4, 2), dtype="float32")

    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]
    rect[2] = pts[np.argmax(s)]

    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]
    rect[3] = pts[np.argmax(diff)]

    (tl, tr, br, bl) = rect
    widthA = np.sqrt(((br[0] - bl[0]) ** 2) + ((br[1] - bl[1]) ** 2))
    widthB = np.sqrt(((tr[0] - tl[0]) ** 2) + ((tr[1] - tl[1]) ** 2))

    heightA = np.sqrt(((tr[0] - br[0]) ** 2) + ((tr[1] - br[1]) ** 2))
    heightB = np.sqrt(((tl[0] - bl[0]) ** 2) + ((tl[1] - bl[1]) ** 2))

    maxWidth = max(int(widthA), int(widthB))
    maxHeight = max(int(heightA), int(heightB))

    dst = np.array([
        [0, 0],
        [maxWidth - 1, 0],
        [maxWidth - 1, maxHeight - 1],
        [0, maxHeight - 1]], dtype="float32")

    M = cv2.getPerspectiveTransform(rect, dst)
    warp = cv2.warpPerspective(orig, M, (maxWidth, maxHeight), flags=cv2.INTER_NEAREST)
    return warp

def read_image(image_path):
    image = cv2.imread(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    return blurred, image, gray

def find_contours(image):
    edged = cv2.Canny(image, 110, 1100)
    cnts = cv2.findContours(edged.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cnts = imutils.grab_contours(cnts)
    return cnts

def find_main_sheet(cnts, image, gray):
    docCnt = None
    if len(cnts) > 0:
        cnts = sorted(cnts, key=cv2.contourArea, reverse=True)
        for c in cnts:
            peri = cv2.arcLength(c, True)
            approx = cv2.approxPolyDP(c, 0.02 * peri, True)
            print("len_approx", len(approx)) ###
            if len(approx) == 4:
                docCnt = approx
                break
    paper = four_point_transform(image.copy(), docCnt.reshape(4, 2))
    warped = four_point_transform(gray.copy(), docCnt.reshape(4, 2))
    thresh = cv2.threshold(warped.copy(), 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)[1]
    return paper, warped, thresh


def fined_choices_box(paper):
    cnts = find_contours(paper)
    name_box_cnt = None
    if len(cnts) > 0:
        print('OK1')
        cnts = sorted(cnts, key=cv2.contourArea, reverse=True)
        for c in cnts:
            peri = cv2.arcLength(c, True)
            approx = cv2.approxPolyDP(c, 0.02 * peri, True)
            if len(approx) == 4:
                name_box_cnt = approx
                print('OK2')
                break
    warped = four_point_transform(paper.copy(), name_box_cnt.reshape(4, 2))
    return warped, None

def fined_boxes(paper, thresh):
    cnts = find_contours(paper)

    choices_box_found = False
    choices_box_cnt = None

    name_box_found = False
    name_box_cnt = None

    number_box_cnt = None
    if len(cnts) > 0:
        cnts = sorted(cnts, key=lambda x: (cv2.contourArea(x), -cv2.boundingRect(x)[1]), reverse=True)
        for c in cnts:
            peri = cv2.arcLength(c, True)
            approx = cv2.approxPolyDP(c, 0.02 * peri, True)
            print("here, len(approx)", len(approx), choices_box_found, name_box_found, number_box_cnt) ###
            if len(approx) == 4:
                if not choices_box_found:
                    choices_box_cnt = approx
                    choices_box_found = True
                elif not name_box_found:
                    name_box_cnt = approx
                    name_box_found = True
                else:
                    number_box_cnt = approx
                    break

    if name_box_cnt is None or number_box_cnt is None or choices_box_cnt is None:
        name_box_cnt = paper[int(len(paper) / 50):int(len(paper) / 13), int(len(paper[0]) / 20):int(12 * len(paper[0]) / 13)]
        number_box_cnt = paper[int(len(paper) / 10):int(len(paper) / 6.25), int(len(paper[0]) / 20):int(12 * len(paper[0]) / 13)]
        choices_box_cnt = paper[int(len(paper) / 6):int(19 * len(paper) / 20), int(len(paper[0]) / 20):int(12 * len(paper[0]) / 13)]
        return find_contours(name_box_cnt), find_contours(number_box_cnt), find_contours(choices_box_cnt), find_contours(choices_box_cnt)
    
    warped_name = warp_image(name_box_cnt, paper.copy())
    warped_number = warp_image(number_box_cnt, paper.copy())
    warped_choices = warp_image(choices_box_cnt, paper.copy())
    thresh_choices = warp_image(choices_box_cnt, thresh.copy())
    return warped_name, warped_number, warped_choices, thresh_choices


def find_choices(thresh):
    cnts = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cnts = imutils.grab_contours(cnts)
    questionCnts = []
    for c in cnts:
        (x, y, w, h) = cv2.boundingRect(c)
        ar = w / float(h)
        if w >= 20 and h >= 20 and 0.9 <= ar <= 1.1:
            questionCnts.append(c)
    return contours.sort_contours(questionCnts, method="top-to-bottom")[0]


def grade(questionCnts, thresh, paper, answer_key):
    all_answers = []
    marked_thresh = 500
    for (q, i) in enumerate(np.arange(0, len(questionCnts), 4)):
        cnts = contours.sort_contours(questionCnts[i:i + 4])[0]
        bubbled = None
        for (j, c) in enumerate(cnts):
            mask = np.zeros(thresh.shape, dtype="uint8")
            cv2.drawContours(mask, [c], -1, 255, -1)
            mask = cv2.bitwise_and(thresh, thresh, mask=mask)
            total = cv2.countNonZero(mask)
            if total > marked_thresh and (bubbled is None or total > bubbled[0]):
                bubbled = (total, j)
        color = (0, 0, 255)
        k = answer_key[q]
        if bubbled is None:
            color = (0, 255, 255)
            all_answers.append(4)
        elif k == bubbled[1]:
            color = (0, 255, 0)
            all_answers.append(k)
        else:
            all_answers.append(bubbled[1])
        cv2.drawContours(paper, [cnts[k]], -1, color, 3)
    return all_answers

def find(answer_key):
    image_path = "new_image.png"
    edited_image, image, gray = read_image(image_path)
    cnts = find_contours(gray)
    paper, warped, thresh = find_main_sheet(cnts, image, gray)
    warped_name, warped_number, warped_choices, thresh_choices = fined_boxes(paper, thresh)
    if len(thresh_choices) == 1:
        questionCnts = find_choices(thresh_choices[0])
    else:
        questionCnts = find_choices(thresh_choices)
    all_answers = grade(questionCnts, thresh_choices, warped_choices, answer_key)
    cv2.imwrite('name.png', warped_name)
    cv2.imwrite('number.png', warped_number)
    cv2.imwrite('result.png', warped_choices)
    return all_answers


if __name__ == '__main__':
    print(find([1, 2, 3, 2, 3, 1, 2, 1, 3, 2]))
