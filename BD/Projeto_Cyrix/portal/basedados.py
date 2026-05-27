from django.db import connection

# ==========================================
# CRUD PARA A TABELA USERS (Exemplo)
# ==========================================

def db_criar_utilizador(name, email, password_hash, role, company):
    """Insere um novo utilizador usando SQL puro"""
    with connection.cursor() as cursor:
        query = """
            INSERT INTO users (name, email, password_hash, role, company, active, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, TRUE, NOW(), NOW());
        """
        cursor.execute(query, [name, email, password_hash, role, company])

def db_ler_utilizadores():
    """Retorna todos os utilizadores através de uma query SQL"""
    with connection.cursor() as cursor:
        cursor.execute("SELECT id, name, email, role, company FROM users WHERE active = TRUE;")
        # Transforma os resultados numa lista de dicionários para ser fácil usar no HTML
        colunas = [col[0] for col in cursor.description]
        return [dict(zip(colunas, row)) for row in cursor.fetchall()]

def db_atualizar_utilizador(user_id, name, email, role, company):
    """Atualiza os dados de um utilizador"""
    with connection.cursor() as cursor:
        query = """
            UPDATE users 
            SET name = %s, email = %s, role = %s, company = %s, updated_at = NOW()
            WHERE id = %s;
        """
        cursor.execute(query, [name, email, role, company, user_id])

def db_apagar_utilizador(user_id):
    """Faz um soft-delete (desativa o utilizador) como boa prática"""
    with connection.cursor() as cursor:
        cursor.execute("UPDATE users SET active = FALSE WHERE id = %s;", [user_id])