import cv2 as cv, numpy as np, datetime, psycopg2
from deepface import DeepFace
from joblib import delayed
from psycopg import cursor
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

    resgiste_presence(embedding)

    #No caso de termos que registar uma nova pessoa na database, arranjar uma maneira de ir buscar o nome e email

    #name = "Guilherme Silva"
    #email = "guilherme@gmail.com"
    #register_person_database(name, email, embedding)

    #return embedding

def resgiste_presence(embedding1):
    while True:
        print("Estabelecendo conexão com a base de dados...")
        conn = connect_database()
        if conn is not None:
            print("Conexão estabelecida com a base de dados.")
            break
        else:
            print("Ainda não foi possível conectar ...")
    cursor = conn.cursor()
    cursor.execute("SELECT nome, email, embedding_vector from funcionario inner join face_template on funcionario.id = face_template.funcionario_id where funcionario.ativo = true")
    rows = cursor.fetchall()
    name = rows[0][0]
    embedding = np.array(rows[0][2], dtype=np.float32)

    #Aqui vamos calcular a similaridade entre os embeddings
    similarity = np.dot(embedding1, embedding) / (np.linalg.norm(embedding1) * np.linalg.norm(embedding))
    threshold = 0.70  # Defina um limiar adequado para considerar uma correspond

    #Aqui vou buscar os dados que preciso para registar a presença
    cursor.execute("SELECT id FROM funcionario WHERE nome LIKE %s",(f"{name}",))
    funcionario = cursor.fetchall()
    id_funcionario = funcionario[0][0]

    # Definir o tipo de registo com base na hora atual
    if (datetime.datetime.now().hour == 9 and datetime.datetime.now().minute <= 10):
        tipo = "ENTRADA"
        observacao = "Entrada normal"

    elif (datetime.datetime.now().hour == 9 and datetime.datetime.now().minute > 10):
        tipo = "ENTRADA"
        observacao = "Entrada atrasada"

    elif (datetime.datetime.now().hour < 9):
        tipo = "ENTRADA"
        observacao = "Entrada antecipada"

    elif (datetime.datetime.now().hour == 13 and datetime.datetime.now().minute <= 10):
        tipo = "ALMOCO_IN"
        observacao = "Saída normal para almoço"

    elif (datetime.datetime.now().hour == 13 and datetime.datetime.now().minute > 10):
        tipo = "ALMOCO_IN"
        observacao = "Saída tardia para almoço"

    elif (datetime.datetime.now().hour < 13):
        tipo = "ALMOCO_IN"
        observacao = "Saída antecipada para almoço"

    elif (datetime.datetime.now().hour == 14 and datetime.datetime.now().minute <= 10):
        tipo = "ALMOCO_OUT"
        observacao = "Retorno normal do almoço"

    elif (datetime.datetime.now().hour == 14 and datetime.datetime.now().minute > 10):
        tipo = "ALMOCO_OUT"
        observacao = "Retorno atrasado do almoço"

    elif (datetime.datetime.now().hour < 14):
        tipo = "ALMOCO_OUT"
        observacao = "Retorno antecipado do almoço"

    elif (datetime.datetime.now().hour == 17 and datetime.datetime.now().minute <= 10):
        tipo = "SAIDA"
        observacao = "Saída normal"

    elif (datetime.datetime.now().hour == 17 and datetime.datetime.now().minute > 10):
        tipo = "SAIDA"
        observacao = "Saída tardia"

    elif (datetime.datetime.now().hour < 17):
        tipo = "SAIDA"
        observacao = "Saída antecipada"

    else:
        tipo = "CORRECAO"
        observacao = "Horário fora do esperado"

    if similarity >= threshold:
        try:
            cursor.execute(
                "CALL inserir_evento(%s, %s, %s, %s, %s, %s, %s)",
                (id_funcionario, tipo, None, None, False, observacao, datetime.datetime.now())
            )

            conn.commit()
            print(f"Presença de {name} registada com sucesso na base de dados.")
        except Exception as e:
            conn.rollback()
            print(f"Erro ao registar presença: {e}")
    else:
        print(f"Nenhuma correspondência encontrada. Similaridade máxima: {similarity:.2f}")

def register_person_database(nome, email, embedding):  # Concluido com sucesso
    '''Aqui vai ser registado os users para ter na database'''
    while True:
        print("Estabelecendo conexão com a base de dados...")
        conn = connect_database()
        print("Ainda não foi possível conectar ...")
        if conn is not None:
            print("Conexão estabelecida com a base de dados.")
            break

    # Fazer uma verificação do embedding
    if embedding is None:
        print("Embedding inválido. Não é possível registar o funcionário.")
        return

    cursor = conn.cursor()

    try:
        cursor.execute(
            "CALL inserir_funcionario(%s, %s, %s, %s, %s)",
            (nome, email, embedding.astype(float).tolist(), 1.0, None)
        )
        conn.commit()
        print(f"Funcionário {nome} registado com sucesso na base de dados.")

    except Exception as e:
        conn.rollback()
        print(f"Erro ao registar funcionário: {e}")

    cursor.close()
    conn.close()