import numpy as np
import faiss

def embedding_photos():
    embedding = np.random.rand(128).astype('float32')  # Vetor de embedding de 128 dimensões para uma representação mais fiel

    dimension = embedding.shape[0]
    index = faiss.IndexFlatL2(dimension)


    print("Embedding adicionado ao índice FAISS.")
