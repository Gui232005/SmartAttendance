import numpy as np
from deepface import DeepFace
import cv2 as cv
import psycopg2 # Para a database
from tensorflow.python.eager.context import async_wait


def connect_database():
    try:
        conn = psycopg2.connect(
            database="sistemas_embebidos_db",
            user="sistemas_embebidos_db_user",
            password="pAw5zk32wojrN3bqaJRRTZ9fMor53B6p",
            host="dpg-d45lskhr0fns73f7slvg-a.frankfurt-postgres.render.com",
            port="5432"
        )
        print("Conectado à base de dados com sucesso!")
        return conn

    except psycopg2.OperationalError as e:
        print("Conexão à base de dados falhou:")
        print(e)
        return None

def embedding_photos(photo: np.ndarray):
    photo_rgb = cv.cvtColor(photo, cv.COLOR_BGR2RGB)  # Converte BGR para RGB para DeepFace processar corretamente

    # Gera o embedding da foto usando o modelo ArcFace
    result = DeepFace.represent(photo_rgb, model_name="ArcFace", enforce_detection=False)

    embedding = np.array(result[0]["embedding"], dtype=np.float32)

    with open("embedding2.txt", "w") as file:
        file.write(np.array2string(embedding, separator=' ')) # C
    file.close()
    #print(embedding)
    resgiste_presence(embedding)


def resgiste_presence(embedding1):
    with open("embedding2.txt", "r") as file:
        content = file.read()
        # Remove colchetes e quebras de linha para comparar com o armazenado
        content = content.replace('[', '').replace(']', '').replace('\n', ' ').strip()
        embedding2 = np.fromstring(content, sep=' ')

    # Normaliza os vetores
    embedding1 = embedding1 / np.linalg.norm(embedding1)
    embedding2 = embedding2 / np.linalg.norm(embedding2)

    # Calcula a similaridade
    similarity = np.dot(embedding1, embedding2)
    print(f"Igualdade entre os embeddings -> {similarity:.4f}")

    # Limite de 95% de confiança
    if similarity > 0.95:
        print("Presença marcada")
    else:
        print("Pessoas não está na base de dados")

def register_person_database():
    '''Aqui vai ser registado os users para ter na database'''
    conn = connect_database()
    cursor = conn.cursor()
    cursor.execute('') # Aqui vamos chamar o procedure para inserir os dados
