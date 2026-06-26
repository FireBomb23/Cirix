from django.db import connection

def db_ler_servicos():
    """Lê todos os serviços da tabela 'services' criada no pgAdmin."""
    with connection.cursor() as cursor:
        cursor.execute("SELECT id, title, sort_order, active FROM services ORDER BY sort_order")
        columns = [col[0] for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]


def db_criar_servico(title, sort_order, active):
    """Insere um novo serviço na tabela 'services'."""
    with connection.cursor() as cursor:
        cursor.execute(
            "INSERT INTO services (title, description, icon, sort_order, active) VALUES (%s, %s, %s, %s, %s)",
            [title, 'Descrição gerada dinamicamente', 'shield', sort_order, active]
        )


def db_eliminar_servico(servico_id):
    """Remove um serviço da tabela 'services' através do ID."""
    with connection.cursor() as cursor:
        cursor.execute("DELETE FROM services WHERE id = %s", [servico_id])


# =====================================================================
# FUNÇÕES DO DASHBOARD (FICHA 9) ATUALIZADAS COM O TEU SCRIPT REAL
# =====================================================================

def db_clientes_por_conformidade_nis2():
    """1. Estado de Projetos NIS2 - Tabela real: 'annual_services' (coluna 'status' como nis2_status)"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT status as nis2_status, COUNT(*) as total 
            FROM annual_services 
            WHERE service_type = 'nis-compliance'
            GROUP BY status
        """)
        columns = [col[0] for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]


def db_top5_clientes_incidentes():
    """2. Top 5 Clientes com Mais Incidentes - Tabelas reais: 'users' e 'tickets'"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT u.name, COUNT(t.id) as total_incidentes
            FROM users u
            LEFT JOIN tickets t ON u.id = t.client_id
            WHERE t.category = 'incident'
            GROUP BY u.id, u.name
            ORDER BY total_incidentes DESC
            LIMIT 5
        """)
        columns = [col[0] for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]


def db_documentos_por_cliente_mes():
    """3. Total de Documentos por Cliente e Mês - Tabelas reais: 'users' e 'documents'"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT u.name, TO_CHAR(d.upload_date, 'YYYY-MM') as mes, COUNT(d.id) as total_documentos
            FROM users u
            JOIN documents d ON u.id = d.client_id
            GROUP BY u.name, mes
            ORDER BY mes DESC, total_documentos DESC
        """)
        columns = [col[0] for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]


def db_distribuicao_utilizadores_perfil():
    """4. Distribuição de Utilizadores por Perfil - Tabela real: 'users' (coluna 'role')"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT role, COUNT(*) as total 
            FROM users 
            GROUP BY role
        """)
        columns = [col[0] for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]


def db_estado_tickets_tempo_medio():
    """5. Estado dos Tickets e Tempo Médio de Resolução - Tabela real: 'tickets'"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT status, COUNT(*) as total_tickets,
                   ROUND(AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/86400)::numeric, 1) as tempo_medio_dias
            FROM tickets
            GROUP BY status
        """)
        columns = [col[0] for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]

def db_criar_utilizador(name, email, password_hash, role, company):
    """Insere um novo utilizador na tabela 'users' criada no pgAdmin."""
    with connection.cursor() as cursor:
        cursor.execute("""
            INSERT INTO users (name, email, password_hash, role, company, active) 
            VALUES (%s, %s, %s, %s, %s, TRUE)
        """, [name, email, password_hash, role, company if company else None])

def db_eliminar_utilizador(user_id):
    """Remove um utilizador da tabela 'users'."""
    with connection.cursor() as cursor:
        cursor.execute("DELETE FROM users WHERE id = %s", [user_id])