import cv2
from imutils.perspective import four_point_transform
import imutils
import numpy as np

first_box_coordinates = (126, 168)

name_box_lef_up_coordinate = (16, 15)

student_number_left_up_coordinate = (17, 74)

box_height = 450
box_width = 45

length_of_choice_box = 15

horizontal_distance = 77
vertical_distance = 48

image_shape = (487, 681)


def resize_image(image, dim):
    resized = cv2.resize(image, dim, interpolation=cv2.INTER_AREA)
    return resized


def scale_image(image, scale_percent):
    width = int(image.shape[1] * scale_percent / 100)
    height = int(image.shape[0] * scale_percent / 100)
    dim = (width, height)
    resized = cv2.resize(image, dim, interpolation=cv2.INTER_AREA)
    return resized


def read_image(image_path):
    image = cv2.imread(image_path)
    image = scale_image(image.copy(), 20)
    gray = cv2.cvtColor(image.copy(), cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray.copy(), (3, 3), 0)
    blurred = cv2.GaussianBlur(blurred.copy(), (3, 3), 0)
    return blurred, image, gray

def warp_rectangle(img, tl_corner, br_corner):
    src_points = np.float32([tl_corner, [br_corner[0], tl_corner[1]], [tl_corner[0], br_corner[1]], br_corner])
    dst_points = np.float32([[0, 0], [br_corner[0] - tl_corner[0], 0], [0, br_corner[1] - tl_corner[1]],
                             [br_corner[0] - tl_corner[0], br_corner[1] - tl_corner[1]]])
    M = cv2.getPerspectiveTransform(src_points, dst_points)
    return cv2.warpPerspective(img, M, (br_corner[0] - tl_corner[0], br_corner[1] - tl_corner[1]))

def find_contours(image, left, right):
    edged = cv2.Canny(image, left, right)
    cnts = cv2.findContours(edged.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cnts = imutils.grab_contours(cnts)
    return cnts


def find_main_sheet(cnts, image):
    docCnt = None
    if len(cnts) > 0:
        cnts = sorted(cnts, key=cv2.contourArea, reverse=True)
        for c in cnts:
            peri = cv2.arcLength(c, True)
            approx = cv2.approxPolyDP(c, 0.02 * peri, True)
            if len(approx) == 4:
                docCnt = approx
                break

    paper = four_point_transform(image.copy(), docCnt.reshape(4, 2))
    return paper


def get_name_and_student_number_boxes(paper):
    tl_corner = name_box_lef_up_coordinate
    br_corner = (name_box_lef_up_coordinate[0] + box_height, name_box_lef_up_coordinate[1] + box_width)

    name_box = warp_rectangle(paper, tl_corner, br_corner)

    tl_corner = student_number_left_up_coordinate
    br_corner = (student_number_left_up_coordinate[0] + box_height, student_number_left_up_coordinate[1] + box_width)

    student_number_box = warp_rectangle(paper, tl_corner, br_corner)

    return name_box, student_number_box


def grade(thresh, paper, answer_key):
    all_answers = []
    marked_thresh = 500
    for q in range(len(answer_key)):
        bubbled = None
        for c in range(4):
            first_element = first_box_coordinates[0] + (c * horizontal_distance)
            second_element = first_box_coordinates[1] + (q * vertical_distance)
            choice = thresh[second_element - length_of_choice_box:second_element + length_of_choice_box,
                     first_element - length_of_choice_box:first_element + length_of_choice_box]
            total = cv2.countNonZero(choice)
            if total > marked_thresh and (bubbled is None or total > bubbled[0]):
                bubbled = (total, c)
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
        first_element_c = first_box_coordinates[0] + (answer_key[q] * horizontal_distance)
        cv2.rectangle(paper, pt1=(first_element_c - length_of_choice_box, second_element - length_of_choice_box),
                        pt2=(first_element_c + length_of_choice_box, second_element + length_of_choice_box),
                        color=color, thickness=3)
    return all_answers

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

# def convert_to_binary_image(image, binary_thresh = 120):
#     img_float = image.astype(np.float32) / 255.

#     k_channel = 1 - np.max(img_float, axis=2)

#     k_channel = (255 * k_channel).astype(np.uint8)

#     _, binary_image = cv2.threshold(k_channel, binary_thresh, 255, cv2.THRESH_BINARY)
#     binary_image = np.bitwise_not(binary_image)

#     return binary_image

def find(answer_key):
    edited_image, image, gray = read_image("new_image.png")

    cnts = find_contours(edited_image, 20, 45)

    paper = find_main_sheet(cnts, edited_image)
    color_paper = find_main_sheet(cnts, image)

    image = resize_image(paper, image_shape)
    color_image = resize_image(color_paper, image_shape)
    thresh = cv2.threshold(image.copy(), 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)[1]
    all_answers = grade(thresh, color_image, answer_key)

    name_box, student_number_box = get_name_and_student_number_boxes(color_paper)

    name_box = rotate(name_box)
    student_number_box = rotate(student_number_box)
    # name_box = convert_to_binary_image(rotate(name_box))
    # student_number_box = convert_to_binary_image(rotate(student_number_box))

    cv2.imwrite('result.png', color_image)
    cv2.imwrite('name.png', name_box)
    cv2.imwrite('number.png', student_number_box)

    return all_answers


if __name__ == '__main__':
    print(find([1, 2, 3, 2, 3, 1, 2, 1, 3, 2]))
