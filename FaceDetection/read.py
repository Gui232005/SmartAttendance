import cv2 as cv
import numpy as np
import matplotlib.pyplot as plt

face_cascade = cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_frontalface_default.xml') # Carrega o modelo para deteção de faces

#Read Videos
capture = cv.VideoCapture(0)

while True:
    ret, frame = capture.read()
    if not ret:
        print("Error: Could not read frame.")
        break
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    isTrue, frame = capture.read()
    for(x, y, w, h) in faces:
        cv.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
    cv.imshow('Video', frame)
    if cv.waitKey(20) & 0xFF == ord('q'):
        break
    capture.release()
    cv.destroyAllWindows()
    cv.waitKey(0)