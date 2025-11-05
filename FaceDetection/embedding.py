import numpy as np
import faiss
from deepface import DeepFace
import cv2 as cv

def embedding_photos(photo: np.ndarray):
    photo_rgb = cv.cvtColor(photo, cv.COLOR_BGR2RGB)  # Converte BGR para RGB para DeepFace processar corretamente

    # Gera o embedding da foto usando o modelo Facenet
    result = DeepFace.represent(photo_rgb, model_name="Facenet", enforce_detection=False)

    embedding = np.array(result[0]["embedding"], dtype=np.float32)

    dimension = embedding.shape[0]
    index = faiss.IndexFlatL2(dimension)
    index.add(np.array([embedding]))

    print(f"Photo em embedding: {embedding}")
    print("Embedding adicionado ao índice FAISS.")
