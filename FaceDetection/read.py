import cv2 as cv
import numpy as np
import matplotlib.pyplot as plt

from embedding import embedding_photos

face_cascade = cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_frontalface_default.xml')
capture = cv.VideoCapture(0) # Abre a câmara padrão

if not capture.isOpened():
    print('Erro ao abrir a câmera')
    exit()

while True:
    isTrue, frame = capture.read()
    if not isTrue:
        print('Erro ao capturar o vídeo')
        break
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)
    for (x, y, w, h) in faces:
        cv.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
    cv.imshow('Face', frame)
    if cv.waitKey(1) & 0xFF == ord('q'):
        face_img = frame[y:y + h, x:x + w].copy()  # Recorta a face detectada
        embedding_photos() # Chama a função de embedding e vai enviar para a database
        break
capture.release()
cv.destroyAllWindows()