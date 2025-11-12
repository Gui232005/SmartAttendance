import numpy as np
from deepface import DeepFace
import cv2 as cv

def embedding_photos(photo: np.ndarray):
    photo_rgb = cv.cvtColor(photo, cv.COLOR_BGR2RGB)  # Converte BGR para RGB para DeepFace processar corretamente

    # Gera o embedding da foto usando o modelo ArcFace
    result = DeepFace.represent(photo_rgb, model_name="ArcFace", enforce_detection=False)

    embedding = np.array(result[0]["embedding"], dtype=np.float32)

    print(f"Photo em embedding: {embedding}")
