import pytesseract
import cv2
import numpy as np


def convert_to_binary_image(image, binary_thresh):
    img_float = image.astype(np.float32) / 255.

    k_channel = 1 - np.max(img_float, axis=2)

    k_channel = (255 * k_channel).astype(np.uint8)

    _, binary_image = cv2.threshold(k_channel, binary_thresh, 255, cv2.THRESH_BINARY)
    binary_image = np.bitwise_not(binary_image)

    return binary_image


def rotate(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.bitwise_not(gray)
    thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]

    coords = np.column_stack(np.where(thresh > 0))

    rect = cv2.minAreaRect(coords)
    if rect[1][0] < rect[1][1]:
        angle = -rect[-1]
    else:
        angle = 90 - rect[-1]

    (h, w) = img.shape[:2]
    center = (w // 2, h // 2)
    m = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(img, m, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    return rotated


def find_text(img, thresholds=range(100, 250, 10)):
    all_texts = dict()
    custom_config = r'-l fas --oem 3 --psm 6'
    for thresh in thresholds:
        binary_image = convert_to_binary_image(img, thresh)
        text = pytesseract.image_to_string(binary_image, config=custom_config)
        if text in all_texts.keys():
            all_texts[text] += 1
        else:
            all_texts[text] = 1
    return max(all_texts, key=lambda x: all_texts[x])


def ocr_main(img=None):
    pytesseract.pytesseract.tesseract_cmd = 'tesseract'
    rotated = rotate(img)
    return find_text(rotated)

