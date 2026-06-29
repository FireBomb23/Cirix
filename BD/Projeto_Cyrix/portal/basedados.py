import psycopg2
from psycopg2.extras import RealDictCursor
import bcrypt
# Persistencia via SQL (psycopg2), sem ORM.

# ==============================================================================
# LIGACAO A BASE DE DADOS (PostgreSQL / pgAdmin)
# Persistencia feita exclusivamente com SQL (psycopg2), sem ORM do Django.
# ==============================================================================

def obter_conexao():
    """Estabelece a ligacao direta com a base de dados PostgreSQL do pgAdmin"""
    return psycopg2.connect(
        dbname="projeto_BD",
        user="postgres",
        password="BDCatarina6",
        host="localhost",
        port="5432"
    )


def executar_consulta(query, params=None):
    """Executa consultas SELECT e mapeia os resultados para dicionarios"""
    conn = obter_conexao()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute(query, params)
        return cursor.fetchall()
    except Exception as e:
        print(f"Erro ao executar consulta SQL: {e}")
        return []
    finally:
        cursor.close()
        conn.close()


def executar_comando(query, params=None):
    """Executa comandos de escrita (INSERT/UPDATE/DELETE) com commit"""
    conn = obter_conexao()
    cursor = conn.cursor()
    try:
        cursor.execute(query, params)
        conn.commit()
        return True
    except Exception as e:
        print(f"Erro ao executar comando SQL: {e}")
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()


# ==============================================================================
# MAPEAMENTO DE PERFIS (role na BD  <->  perfil apresentado no frontend)
# A tabela users guarda role: 'admin' | 'manager' | 'client'.
# ==============================================================================

ROLE_PARA_PERFIL = {
    'admin': 'Administrador',
    'manager': 'Colaborador',
    'client': 'Cliente',
}
PERFIL_PARA_ROLE = {v: k for k, v in ROLE_PARA_PERFIL.items()}


# ==============================================================================
# REQUISITOS OBRIGATORIOS DA FICHA 9 (Metricas do Dashboard)
# Todas as consultas usam o esquema real (users, tickets, documents,
# annual_services) e devolvem aliases iguais aos campos esperados no template.
# ==============================================================================

def obter_conformidade_nis2():
    """Ex 1: Numero de contratos de conformidade NIS2 por estado."""
    query = """
        SELECT status AS estado_nis2,
               COUNT(*) AS total
        FROM annual_services
        WHERE service_type = 'nis-compliance'
        GROUP BY status
        ORDER BY total DESC;
    """
    return executar_consulta(query)


def obter_top5_incidentes():
    """Ex 2: Top 5 clientes com mais incidentes de seguranca registados.
    Incidentes = tickets com categoria 'incident'."""
    query = """
        SELECT u.name AS nome,
               COUNT(t.id) AS total_incidentes
        FROM users u
        JOIN tickets t ON t.client_id = u.id
        WHERE t.category = 'incident'
        GROUP BY u.id, u.name
        ORDER BY total_incidentes DESC
        LIMIT 5;
    """
    return executar_consulta(query)


def obter_documentos_por_mes():
    """Ex 3: Total de documentos submetidos por cliente e por mes."""
    query = """
        SELECT u.name AS cliente,
               TO_CHAR(d.upload_date, 'YYYY-MM') AS mes,
               COUNT(d.id) AS total_documentos
        FROM documents d
        JOIN users u ON u.id = d.client_id
        GROUP BY u.name, mes
        ORDER BY mes DESC, total_documentos DESC;
    """
    return executar_consulta(query)


def obter_distribuicao_perfis():
    """Ex 4: Distribuicao de utilizadores por perfil (Administrador, Colaborador, Cliente)."""
    query = """
        SELECT CASE role
                    WHEN 'admin'   THEN 'Administrador'
                    WHEN 'manager' THEN 'Colaborador'
                    WHEN 'client'  THEN 'Cliente'
                    ELSE role
               END AS perfil,
               COUNT(*) AS total
        FROM users
        GROUP BY role
        ORDER BY total DESC;
    """
    return executar_consulta(query)


def obter_estado_tickets_resolucao():
    """Ex 5: Estado dos pedidos/tickets de suporte e tempo medio de resolucao (em dias)."""
    query = """
        SELECT status AS estado,
               COUNT(*) AS total_tickets,
               ROUND(AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400.0)::numeric, 1)
                   AS tempo_medio_resolucao
        FROM tickets
        GROUP BY status
        ORDER BY total_tickets DESC;
    """
    return executar_consulta(query)


# ==============================================================================
# AUTENTICACAO E ENVIO DE FORMULARIOS
# ==============================================================================

def inserir_contacto(nome, email, mensagem):
    """Grava uma submissao do formulario de contacto publico."""
    return executar_comando(
        "INSERT INTO contact_submissions (name, email, message) VALUES (%s, %s, %s);",
        (nome, email, mensagem)
    )


def validar_login(email, password):
    """Valida credenciais contra a tabela users.
    A password e guardada com hash bcrypt (coluna password_hash), por isso a
    verificacao faz-se em Python com bcrypt.checkpw."""
    conn = obter_conexao()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute(
            """SELECT id, name, email, role, password_hash
               FROM users
               WHERE email = %s AND active = TRUE;""",
            (email,)
        )
        utilizador = cursor.fetchone()
        if not utilizador:
            return None

        hash_guardado = utilizador['password_hash']
        if not bcrypt.checkpw(password.encode('utf-8'), hash_guardado.encode('utf-8')):
            return None

        # Devolve so o necessario ao frontend, ja com o perfil legivel.
        return {
            'id': utilizador['id'],
            'nome': utilizador['name'],
            'email': utilizador['email'],
            'perfil': ROLE_PARA_PERFIL.get(utilizador['role'], utilizador['role']),
        }
    except Exception as e:
        print(f"Erro na autenticacao: {e}")
        return None
    finally:
        cursor.close()
        conn.close()


# ==============================================================================
# OPERACOES DE CRUD (Exigidas pela Ficha 7)
# Operam sobre a tabela real users.
# ==============================================================================

def listar_utilizadores():
    """READ: Lista todos os utilizadores com o perfil legivel."""
    query = """
        SELECT id,
               name AS nome,
               email,
               CASE role
                    WHEN 'admin'   THEN 'Administrador'
                    WHEN 'manager' THEN 'Colaborador'
                    WHEN 'client'  THEN 'Cliente'
                    ELSE role
               END AS perfil,
               active
        FROM users
        ORDER BY id;
    """
    return executar_consulta(query)


def criar_utilizador(nome, email, password, perfil):
    """CREATE: Insere um novo utilizador (password guardada com hash bcrypt)."""
    role = PERFIL_PARA_ROLE.get(perfil, perfil)
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    return executar_comando(
        """INSERT INTO users (name, email, password_hash, role)
           VALUES (%s, %s, %s, %s);""",
        (nome, email, password_hash, role)
    )


def atualizar_utilizador(id_utilizador, nome, email, perfil):
    """UPDATE: Atualiza os dados de um utilizador existente."""
    role = PERFIL_PARA_ROLE.get(perfil, perfil)
    return executar_comando(
        """UPDATE users
           SET name = %s, email = %s, role = %s, updated_at = NOW()
           WHERE id = %s;""",
        (nome, email, role, id_utilizador)
    )


def eliminar_utilizador(id_utilizador):
    """DELETE: Remove um utilizador."""
    return executar_comando("DELETE FROM users WHERE id = %s;", (id_utilizador,))


# ==============================================================================
# CLIENTES
# Nao existe tabela 'clientes': um cliente e um utilizador com role 'client'.
# As funcoes abaixo operam sobre users filtrando por esse perfil.
# ==============================================================================

def listar_clientes():
    """READ: Lista os utilizadores que sao clientes."""
    query = """
        SELECT id, name AS nome, email, company AS empresa, active
        FROM users
        WHERE role = 'client'
        ORDER BY name;
    """
    return executar_consulta(query)
