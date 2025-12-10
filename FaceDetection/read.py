import cv2 as cv
import time

from embedding import embedding_photos, connect_database, register_person_database

face_cascade = cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_frontalface_default.xml')

capture = cv.VideoCapture(0)  # câmera
#capture = cv.imread('Photos/Amadeu.png')  # imagem

# Detecta se a fonte é um video ou photo
is_video = hasattr(capture, 'read')

if is_video:
    if not capture.isOpened():
        print('Erro ao abrir a câmera')
        exit()
else:
    if capture is None:
        print('Erro ao abrir a imagem')
        exit()

stable_start = None
last_box = None
STABLE_TIME = 2.0
MOVEMENT_THRESHOLD = 20

def is_stable(box1, box2):
    """Compara duas bounding boxes e vê se a cara se mexeu pouco."""
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

single_image_mode = not is_video

while True:
    if is_video:
        isTrue, frame = capture.read()
        if not isTrue:
            print('Erro ao capturar o vídeo')
            break
    else:
        frame = capture.copy()

    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)

    chosen_face = None
    for (x, y, w, h) in faces:
        chosen_face = (x, y, w, h)
        cv.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
        break

    if chosen_face is None:
        stable_start = None
        last_box = None
    else:
        if single_image_mode:
            # Para imagem estática, considerar estável imediatamente
            print('Imagem estática: captura imediata da face detectada.')
            (x, y, w, h) = chosen_face
            face_img = frame[y:y + h, x:x + w].copy()
            if face_img is not None:
                print('Cara detetada com sucesso (imagem estática)')
                embedding_photos(face_img)
                break
        else:
            if is_stable(chosen_face, last_box):
                if stable_start is None:
                    stable_start = time.time()
            else:
                stable_start = time.time()
            last_box = chosen_face
            if stable_start and (time.time() - stable_start >= STABLE_TIME):
                print("Cara estável durante 2 segundos — inicia a captura automática...")
                (x, y, w, h) = chosen_face
                face_img = frame[y:y + h, x:x + w].copy()
                if face_img is not None:
                    print('Cara detetada com sucesso')
                    stable_start = None
                    embedding_photos(face_img)
                    break

    if single_image_mode:
        break

if is_video:
    capture.release()
cv.destroyAllWindows()