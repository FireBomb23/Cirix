from django.db import connection

# ============================================================
# OPERAÇÕES CRUD DE CLIENTES CONFIGURADAS PARA A TABELA "users"
# (Fichas 7 e 8)
# ============================================================

# 1. Função para Ler TODOS os clientes (Essencial para listar na tabela com botões funcionais)
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

# 2. Função para Criar (INSERT) um cliente na tabela users
def inserir_cliente(nome, email, password_hash, company):
    with connection.cursor() as cursor:
        query = """
            INSERT INTO users (name, email, password_hash, role, company, active, created_at, updated_at) 
            VALUES (%s, %s, %s, 'client', %s, TRUE, NOW(), NOW());
        """
        cursor.execute(query, [nome, email, password_hash, company])

# 3. Função para Ler apenas um cliente por ID (Usado para carregar o formulário de Edição)
def obter_cliente_por_id(id_cliente):
    with connection.cursor() as cursor:
        query = """
            SELECT id, name, email, company 
            FROM users 
            WHERE id = %s AND role = 'client';
        """
        cursor.execute(query, [id_cliente])
        return cursor.fetchone()

# 4. Função para Atualizar (UPDATE) os dados de um cliente
def atualizar_cliente(id_cliente, nome, email, company):
    with connection.cursor() as cursor:
        query = """
            UPDATE users 
            SET name = %s, email = %s, company = %s, updated_at = NOW() 
            WHERE id = %s AND role = 'client';
        """
        cursor.execute(query, [nome, email, company, id_cliente])

# 5. Função para Eliminar (DELETE) um cliente
def eliminar_cliente_db(id_cliente):
    with connection.cursor() as cursor:
        query = """
            DELETE FROM users 
            WHERE id = %s AND role = 'client';
        """
        cursor.execute(query, [id_cliente])


# ============================================================
# QUERIES METRICAS DO DASHBOARD AVANÇADO (Ficha 9)
# ============================================================

# 1. Número de contratos por estado de conformidade/progresso NIS2
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

# 2. Top 5 utilizadores/clientes com mais tickets de incidentes de segurança registados
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

# 4. Distribuição de utilizadores por perfil (role)
def obter_distribuicao_perfil_utilizadores():
    with connection.cursor() as cursor:
        query = """
            SELECT role, COUNT(id) as total
            FROM users
            WHERE role IN ('admin', 'manager', 'client')
            GROUP BY role;
        """
        cursor.execute(query)
        return cursor.fetchall()

# 5. Estado dos tickets de suporte e tempo médio de resolução
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