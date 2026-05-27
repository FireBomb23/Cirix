from django.db import connection

# Função para inserir um novo doente (Tarefa 5)
def inserir_doente(nome, morada, nif, numero_sns, data_nascimento):
    with connection.cursor() as cursor:
        cursor.execute("""
            INSERT INTO clinica_doente (nome, morada, nif, numero_sns, data_nascimento)
            VALUES (%s, %s, %s, %s, %s)
        """, [nome, morada, nif, numero_sns, data_nascimento])

# Função para listar todos os doentes (Tarefa 7)


def apagar_doente(id):
    with connection.cursor() as cursor:
        # 1. Executa o comando (Garante que o nome da tabela está correto)
        cursor.execute("DELETE FROM clinica_doente WHERE id = %s", [id])
        
        # 2. SE NÃO ELIMINAR, tenta descomentar a linha abaixo para forçar a gravação:
        # connection.commit() 

def listar_doentes():
    with connection.cursor() as cursor:
        cursor.execute("SELECT id, nome, morada, nif, numero_sns, data_nascimento FROM clinica_doente ORDER BY nome ASC")
        return cursor.fetchall()

# Função para atualizar dados de um doente
def atualizar_doente(id, nome, morada, nif, numero_sns, data_nascimento):
    with connection.cursor() as cursor:
        cursor.execute("""
            UPDATE clinica_doente
            SET nome=%s, morada=%s, nif=%s, numero_sns=%s, data_nascimento=%s
            WHERE id=%s
        """, [nome, morada, nif, numero_sns, data_nascimento, id])
        
        def consultar_doente(id):
            with connection.cursor() as cursor:
                cursor.execute("SELECT id, nome, morada, nif, numero_sns, data_nascimento FROM clinica_doente WHERE id = %s", [id])
            return cursor.fetchone() # Retorna apenas um registo