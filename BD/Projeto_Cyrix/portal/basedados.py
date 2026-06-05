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
# REQUISITOS OBRIGATÓRIOS DA FICHA 9 (SQL SELECT)
# ============================================================

# 1. Número de clientes por estado de conformidade NIS2
# (Conforme, Em avaliação, Com pendências)
def obter_clientes_por_conformidade():
    with connection.cursor() as cursor:
        query = """
            SELECT status, COUNT(id) as total
            FROM annual_services
            WHERE service_type = 'nis-compliance'
            GROUP BY status;
        """
        cursor.execute(query)
        return cursor.fetchall()

# 2. Top 5 clientes com mais incidentes de segurança registados
def obter_top5_clientes_incidentes():
    with connection.cursor() as cursor:
        query = """
            SELECT u.name, COUNT(t.id) as total_incidentes
            FROM users u
            JOIN tickets t ON u.id = t.client_id
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
            SELECT COALESCE(u.name, 'Global/Público') as nome_cliente, 
                   EXTRACT(MONTH FROM d.upload_date) as mes,
                   EXTRACT(YEAR FROM d.upload_date) as ano,
                   COUNT(d.id) as total_documentos
            FROM documents d
            LEFT JOIN users u ON u.id = d.client_id
            GROUP BY u.id, u.name, ano, mes
            ORDER BY nome_cliente, ano, mes;
        """
        cursor.execute(query)
        return cursor.fetchall()

# 4. Distribuição de utilizadores por perfil (Administrador, Colaborador e Cliente)
# Nota: Mapeado para os teus roles reais: 'admin', 'manager'/'employee' e 'client'
def obter_distribuicao_perfil_utilizadores():
    with connection.cursor() as cursor:
        query = """
            SELECT role, COUNT(id) as total
            FROM users
            WHERE role IN ('admin', 'manager', 'client', 'employee')
            GROUP BY role;
        """
        cursor.execute(query)
        return cursor.fetchall()

# 5. Estado dos pedidos/tickets de suporte e tempo médio de resolução
def obter_estado_e_tempo_medio_tickets():
    with connection.cursor() as cursor:
        query = """
            SELECT status, 
                   COUNT(id) as total_tickets,
                   AVG(EXTRACT(DAY FROM (updated_at - created_at))) as tempo_medio_dias
            FROM tickets
            GROUP BY status;
        """
        cursor.execute(query)
        return cursor.fetchall()