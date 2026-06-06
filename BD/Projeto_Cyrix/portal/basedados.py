from django.db import connection

# ============================================================
# OPERAÇÕES CRUD DE CLIENTES (Fichas 7 e 8 - Ativação de Botões)
# ============================================================

def obter_todos_clientes():
    with connection.cursor() as cursor:
        query = """
            SELECT id, name, email, company, active
            FROM users
            WHERE role = 'client'
            ORDER BY id ASC;
        """
        cursor.execute(query)
        return cursor.fetchall()

def inserir_cliente(nome, email, password_hash, company):
    with connection.cursor() as cursor:
        query = """
            INSERT INTO users (name, email, password_hash, role, company, active, created_at, updated_at) 
            VALUES (%s, %s, %s, 'client', %s, TRUE, NOW(), NOW());
        """
        cursor.execute(query, [nome, email, password_hash, company])

def obter_cliente_por_id(id_cliente):
    with connection.cursor() as cursor:
        query = "SELECT id, name, email, company FROM users WHERE id = %s AND role = 'client';"
        cursor.execute(query, [id_cliente])
        return cursor.fetchone()

def atualizar_cliente(id_cliente, nome, email, company):
    with connection.cursor() as cursor:
        query = """
            UPDATE users 
            SET name = %s, email = %s, company = %s, updated_at = NOW() 
            WHERE id = %s AND role = 'client';
        """
        cursor.execute(query, [nome, email, company, id_cliente])

def eliminar_cliente_db(id_cliente):
    with connection.cursor() as cursor:
        query = "DELETE FROM users WHERE id = %s AND role = 'client';"
        cursor.execute(query, [id_cliente])


# ============================================================
# CONSULTAS ANALÍTICAS (Ficha 9 - Dashboard)
# ============================================================

# 1. Número de clientes por estado de conformidade NIS2
def obter_clientes_por_conformidade():
    with connection.cursor() as cursor:
        query = """
            SELECT status, COUNT(*) AS total 
            FROM annual_services 
            GROUP BY status;
        """
        cursor.execute(query)
        return cursor.fetchall()


# 2. Top 5 clientes com mais incidentes de segurança registados
def obter_top5_clientes_incidentes():
    with connection.cursor() as cursor:
        query = """
            SELECT 
                u.name AS nome_cliente,
                COUNT(t.id) AS total_incidentes
            FROM tickets t
            JOIN users u ON t.client_id = u.id
            WHERE t.category = 'incident'
            GROUP BY u.id, u.name
            ORDER BY total_incidentes DESC
            LIMIT 5;
        """
        cursor.execute(query)
        return cursor.fetchall()


# 3. Total de documentos submetidos por cliente e por mês
def obter_documentos_por_cliente_mes():
    with connection.cursor() as cursor:
        query = """
            SELECT 
                u.name AS nome_cliente,
                CASE EXTRACT(MONTH FROM d.upload_date)
                    WHEN 1 THEN 'Janeiro'
                    WHEN 2 THEN 'Fevereiro'
                    WHEN 3 THEN 'Março'
                    WHEN 4 THEN 'Abril'
                    WHEN 5 THEN 'Maio'
                    WHEN 6 THEN 'Junho'
                    WHEN 7 THEN 'Julho'
                    WHEN 8 THEN 'Agosto'
                    WHEN 9 THEN 'Setembro'
                    WHEN 10 THEN 'Outubro'
                    WHEN 11 THEN 'Novembro'
                    WHEN 12 THEN 'Dezembro'
                END AS mes,
                EXTRACT(YEAR FROM d.upload_date) AS ano,
                COUNT(d.id) AS total_documentos
            FROM documents d
            JOIN users u ON d.client_id = u.id
            GROUP BY u.id, u.name, ano, EXTRACT(MONTH FROM d.upload_date)
            ORDER BY ano DESC, EXTRACT(MONTH FROM d.upload_date) DESC, total_documentos DESC;
        """
        cursor.execute(query)
        return cursor.fetchall()


# 4. Distribuição de utilizadores por perfil (Administrador, Colaborador e Cliente)
def obter_distribuicao_perfil_utilizadores():
    with connection.cursor() as cursor:
        query = """
            SELECT 
                CASE role
                    WHEN 'admin' THEN 'Administrador'
                    WHEN 'manager' THEN 'Colaborador / Gestor'
                    WHEN 'client' THEN 'Cliente Regulado'
                    ELSE role
                END AS perfil,
                COUNT(*) AS total_utilizadores
            FROM users
            GROUP BY role;
        """
        cursor.execute(query)
        return cursor.fetchall()


# 5. Estado dos pedidos/tickets de suporte e tempo médio de resolução
def obter_estado_e_tempo_medio_tickets():
    with connection.cursor() as cursor:
        query = """
            SELECT 
                CASE status
                    WHEN 'open' THEN 'Aberto'
                    WHEN 'in-progress' THEN 'Em processo'
                    WHEN 'resolved' THEN 'Resolvido'
                    WHEN 'closed' THEN 'Fechado'
                    ELSE status
                END AS estado,
                COUNT(*) AS total_pedidos,
                ROUND(COALESCE(AVG(EXTRACT(DAY FROM (updated_at - created_at))), 0), 1) AS tempo_medio_dias
            FROM tickets
            GROUP BY status;
        """
        cursor.execute(query)
        return cursor.fetchall()