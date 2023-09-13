from PIL import Image
import pytesseract
from pytesseract import Output
import os

image_path = "D:/University/Hardware Lab/OCR/test.png" # example

pytesseract.pytesseract.tesseract_cmd = r'C:/Program Files/Tesseract-OCR/tesseract.exe'

image = Image.open(image_path)
custom_config = r'-l fas --oem 3 --psm 6'
text = pytesseract.image_to_string(image, config=custom_config)
print(text)

if __name__ == '__main__':
    i1 = Image.open('test.png')
    i1.convert('RGB').save(
        'result.pdf'
    )
