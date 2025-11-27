import cv2 as cv
import time

from embedding import embedding_photos, connect_database, register_person_database

face_cascade = cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_frontalface_default.xml')
#capture = cv.VideoCapture(0) # Abre a câmara padrão
capture = cv.imshow('Photos/Amadeu.png')

if not capture.isOpened():
    print('Erro ao abrir a câmera')
    exit()

stable_start = None     # Guarda o momento em que a cara ficou estável durante 2 segundos
last_box = None         # Guarda a última bounding box detetada para comparar movimento
STABLE_TIME = 2.0       # Tempo necessário para considerar a face estabilizada
MOVEMENT_THRESHOLD = 20 # Quanto pode mexer para continuar considerado estável


def is_stable(box1, box2):
    """Compara duas bounding boxes e vê se o rosto mexeu pouco."""
    if box1 is None or box2 is None:
        return False
    (x1, y1, w1, h1) = box1
    (x2, y2, w2, h2) = box2
    return (
        abs(x1 - x2) < MOVEMENT_THRESHOLD and
        abs(y1 - y2) < MOVEMENT_THRESHOLD and
        abs(w1 - w2) < MOVEMENT_THRESHOLD and
        abs(h1 - h2) < MOVEMENT_THRESHOLD
    )


while True:
    isTrue, frame = capture.read()
    if not isTrue:
        print('Erro ao capturar o vídeo')
        break

    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)

    chosen_face = None
    for (x, y, w, h) in faces:
        chosen_face = (x, y, w, h)
        cv.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
        break  # só usa a primeira face detetada

    # Caso não haja cara visível, reiniciar estado
    if chosen_face is None:
        stable_start = None
        last_box = None

    else:
        # Verifica se a cara está estável (sem mexer muito)
        if is_stable(chosen_face, last_box):
            if stable_start is None:
                stable_start = time.time()  # inicia contagem de estabilidade da cara
        else:
            stable_start = time.time()      # reinicia contagem se mexer

        last_box = chosen_face

        # Se a cara ficou 2 segundos estável → captura automaticamente
        if stable_start and (time.time() - stable_start >= STABLE_TIME):
            print("Cara estável durante 2 segundos — inicia a captura automática...")

            (x, y, w, h) = chosen_face
            face_img = frame[y:y + h, x:x + w].copy()  # Recorta a face detectada

            if face_img is not None:
                print('Cara detetada com sucesso')
                stable_start = None  # Reinicia para evitar múltiplas capturas

                embedding_photos(face_img)    # Quando quiser marcar a presença
                # embedding_photos(face_img)  # Chama a função de embedding e vai enviar para a database

                break

capture.release()
cv.destroyAllWindows()