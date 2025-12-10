import cv2 as cv
import numpy as np
import datetime
import psycopg2
from interface import change_interface_message

def connect_database():
    try:
        conn = psycopg2.connect(
            dbname="sistemas_embebidos_db_mqgl",
            user="sistemas_embebidos_db_user",
            password="Bg3340Y1rT6gZ4JYMw5tKiDEZzgCiISB",
            host="dpg-d4s7rhh5pdvs73c1evg0-a.frankfurt-postgres.render.com",
            port=5432,
            sslmode="require"
        )
        return conn
    except psycopg2.OperationalError as e:
        print("Conexão à base de dados falhou:")
        print(e)
        return None

def embedding_photos(photo: np.ndarray):
    gray = cv.cvtColor(photo, cv.COLOR_BGR2GRAY)
    resized = cv.resize(gray, (32, 32), interpolation=cv.INTER_AREA)
    vec = resized.flatten().astype(np.float32)

    # Normalizar (para não rebentar a similaridade)
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm

    embedding = vec

    resgiste_presence(embedding)

    #No caso de termos que registar uma nova pessoa na database, arranjar uma maneira de ir buscar o nome e email

    #name = "Guilherme Silva"
    #email = "guilherme@gmail.com"
    #register_person_database(name, email, embedding)

    #return embedding

def resgiste_presence(embedding1):
    if embedding1 is None or np.linalg.norm(embedding1) == 0:
        print("Embedding de entrada inválido.")
        return

    while True:
        print("Estabelecendo conexão com a base de dados...")
        conn = connect_database()
        if conn is not None:
            print("Conexão estabelecida com a base de dados.")
            break
        else:
            print("Ainda não foi possível conectar ...")

    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT funcionario.id, nome, email, embedding_vector "
            "FROM funcionario INNER JOIN face_template ON funcionario.id = face_template.funcionario_id "
            "WHERE funcionario.ativo = true"
        )
        rows = cursor.fetchall()
        if not rows:
            print("Nenhum template facial na base de dados.")
            return

        best_similarity = -1.0
        best_row = None

        for row in rows:
            name_candidate = row[1]  #Vai mostar o nome de quem está a comparar
            try:
                db_emb = np.array(row[3], dtype=np.float32)
            except Exception as e:
                print(f"Erro ao converter embedding da base for {name_candidate}: {e}")
                continue

            denom = np.linalg.norm(embedding1) * np.linalg.norm(db_emb)
            if denom == 0:
                print(f"Skipping {name_candidate}: zero norm embedding")
                continue

            sim = float(np.dot(embedding1, db_emb) / denom)
            print(f"Comparing with {name_candidate} -> similarity: {sim:.4f}")

            if sim > best_similarity:
                best_similarity = sim
                best_row = row

        threshold = 0.70
        if not best_row or best_similarity < threshold:
            change_interface_message("Presença rejeitada.\nNenhuma correspondência suficiente encontrada.","red")
            print(f"Nenhuma correspondência suficiente encontrada. Similaridade máxima: {best_similarity:.2f}")
            return

        id_funcionario = best_row[0]
        name = best_row[1]
        now = datetime.datetime.now()
        h, m = now.hour, now.minute

        if (h == 9 and m <= 10):
            tipo, observacao = "ENTRADA", "Entrada normal"
        elif (h == 9 and m > 10):
            tipo, observacao = "ENTRADA", "Entrada atrasada"
        elif (h < 9):
            tipo, observacao = "ENTRADA", "Entrada antecipada"
        elif (h == 13 and m <= 10):
            tipo, observacao = "ALMOCO_IN", "Saída normal para almoço"
        elif (h == 13 and m > 10):
            tipo, observacao = "ALMOCO_IN", "Saída tardia para almoço"
        elif (h < 13):
            tipo, observacao = "ALMOCO_IN", "Saída antecipada para almoço"
        elif (h == 14 and m <= 10):
            tipo, observacao = "ALMOCO_OUT", "Retorno normal do almoço"
        elif (h == 14 and m > 10):
            tipo, observacao = "ALMOCO_OUT", "Retorno atrasado do almoço"
        elif (h < 14):
            tipo, observacao = "ALMOCO_OUT", "Retorno antecipado do almoço"
        elif (h == 17 and m <= 10):
            tipo, observacao = "SAIDA", "Saída normal"
        elif (h == 17 and m > 10):
            tipo, observacao = "SAIDA", "Saída tardia"
        elif (h < 17):
            tipo, observacao = "SAIDA", "Saída antecipada"
        else:
            tipo, observacao = "CORRECAO", "Horário fora do esperado"

        try:
            cursor.execute(
                "CALL inserir_evento(%s, %s, %s, %s, %s, %s, %s)",
                (id_funcionario, tipo, None, None, False, observacao, now)
            )
            conn.commit()
            print(f"Presença de {name} registada com sucesso na base de dados. Similaridade: {best_similarity:.2f}")
            change_interface_message(f"Presença do {name} aceite","green")
        except Exception as e:
            conn.rollback()
            print(f"Erro ao registar presença: {e}")

    finally:
        cursor.close()
        conn.close()

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
        change_interface_message("Registo rejeitado. \nErro ao registar na base de dados.","red")
        print("Embedding inválido. Não é possível registar o funcionário.")
        return

    cursor = conn.cursor()

    try:
        cursor.execute(
            "CALL inserir_funcionario(%s, %s, %s, %s, %s)",
            (nome, email, embedding.astype(float).tolist(), 1.0, None)
        )
        conn.commit()
        change_interface_message(f"Registo do {nome} realizado com sucesso","green")
        print(f"Funcionário {nome} registado com sucesso na base de dados.")

    except Exception as e:
        conn.rollback()
        print(f"Erro ao registar funcionário: {e}")

    cursor.close()
    conn.close()
