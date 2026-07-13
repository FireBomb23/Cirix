import os
import psycopg2
from psycopg2.extras import RealDictCursor
import bcrypt
# Persistencia via SQL (psycopg2), sem ORM.

# ==============================================================================
# LIGACAO A BASE DE DADOS (PostgreSQL / pgAdmin)
# Persistencia feita exclusivamente com SQL (psycopg2), sem ORM do Django.
# ==============================================================================

def obter_conexao():
    """Liga a base de dados PostgreSQL.
    Em producao (deploy) usa a variavel de ambiente DATABASE_URL (ex.: Neon);
    localmente usa a base local do pgAdmin."""
    url = os.environ.get('DATABASE_URL')
    if url:
        return psycopg2.connect(url)
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
        # Propaga o erro real (ex.: email duplicado, FK) para a view o mostrar.
        raise
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
    """Ex 1 (Ficha 9): Numero de CLIENTES por estado de conformidade NIS2
    (Conforme, Em avaliacao, Com pendencias). O estado de conformidade de cada
    cliente e derivado do estado dos seus contratos NIS2 (annual_services)."""
    query = """
        SELECT estado_nis2, COUNT(*) AS total
        FROM (
            SELECT DISTINCT client_name,
                   CASE
                       WHEN status = 'completed'              THEN 'Conforme'
                       WHEN status IN ('overdue', 'cancelled') THEN 'Com pendências'
                       ELSE 'Em avaliação'
                   END AS estado_nis2
            FROM annual_services
            WHERE service_type = 'nis-compliance'
        ) sub
        GROUP BY estado_nis2
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
            """SELECT id, name, email, role, password_hash,
                      twofa_word1, twofa_word2, twofa_word3
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
        resultado = {
            'id': utilizador['id'],
            'nome': utilizador['name'],
            'email': utilizador['email'],
            'perfil': ROLE_PARA_PERFIL.get(utilizador['role'], utilizador['role']),
        }
        # Se a conta tiver palavras de seguranca, exige 2.o passo (2FA).
        palavras = [w for w in (utilizador['twofa_word1'], utilizador['twofa_word2'], utilizador['twofa_word3']) if w]
        if palavras:
            resultado['needs2fa'] = True
        return resultado
    except Exception as e:
        print(f"Erro na autenticacao: {e}")
        return None
    finally:
        cursor.close()
        conn.close()


def validar_2fa(user_id, palavra):
    """2.o passo do login: valida a palavra de seguranca contra as 3 palavras
    (twofa_word1/2/3) guardadas para o utilizador."""
    if not palavra:
        return None
    rows = executar_consulta(
        """SELECT id, name, email, role, twofa_word1, twofa_word2, twofa_word3
           FROM users WHERE id = %s AND active = TRUE;""",
        (user_id,)
    )
    if not rows:
        return None
    u = rows[0]
    palavras = [(w or '').strip().lower() for w in (u['twofa_word1'], u['twofa_word2'], u['twofa_word3']) if w]
    if palavra.strip().lower() in palavras:
        return {
            'id': u['id'],
            'nome': u['name'],
            'email': u['email'],
            'perfil': ROLE_PARA_PERFIL.get(u['role'], u['role']),
        }
    return None


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


# ==============================================================================
# DADOS DO CLIENTE AUTENTICADO (dashboard do Portal do Cliente)
# Devolve os dados REAIS do proprio cliente, filtrados por client_id.
# ==============================================================================

def dados_cliente(user_id):
    """Reune os dados reais do cliente autenticado a partir da base de dados."""
    tickets = executar_consulta(
        """SELECT id, title AS titulo, category AS categoria, priority AS prioridade, status AS estado
           FROM tickets WHERE client_id = %s ORDER BY id DESC;""",
        (user_id,)
    )
    documentos = executar_consulta(
        """SELECT name AS nome, COALESCE(category, '-') AS categoria,
                  COALESCE(file_type, '-') AS tipo,
                  TO_CHAR(upload_date, 'YYYY-MM-DD') AS data
           FROM documents WHERE client_id = %s ORDER BY id DESC;""",
        (user_id,)
    )
    pedidos = executar_consulta(
        """SELECT title AS titulo, status AS estado,
                  TO_CHAR(request_date, 'YYYY-MM-DD') AS data
           FROM service_requests WHERE client_id = %s ORDER BY id DESC;""",
        (user_id,)
    )
    kpis_rows = executar_consulta(
        """SELECT
             (SELECT COUNT(*) FROM tickets WHERE client_id = %s) AS tickets,
             (SELECT COUNT(*) FROM security_incidents WHERE client_id = %s) AS incidentes,
             (SELECT COUNT(*) FROM documents WHERE client_id = %s) AS documentos,
             (SELECT COUNT(*) FROM service_requests WHERE client_id = %s) AS pedidos;""",
        (user_id, user_id, user_id, user_id)
    )
    kpis = kpis_rows[0] if kpis_rows else {'tickets': 0, 'incidentes': 0, 'documentos': 0, 'pedidos': 0}
    ativos = listar_ativos_cliente(user_id)
    incidentes = listar_incidentes_cliente(user_id)
    return {'kpis': kpis, 'tickets': tickets, 'documentos': documentos,
            'pedidos': pedidos, 'ativos': ativos, 'incidentes': incidentes}


# ==============================================================================
# DADOS DE GESTAO (paineis do Administrador e do Gestor)
# Listagens globais, todas obtidas por SQL (sem ORM).
# ==============================================================================

def listar_tickets():
    """Todos os tickets de suporte com o nome do cliente associado."""
    return executar_consulta(
        """SELECT t.id, t.title AS titulo, t.category AS categoria,
                  t.priority AS prioridade, t.status AS estado,
                  COALESCE(u.name, '-') AS cliente
           FROM tickets t
           LEFT JOIN users u ON u.id = t.client_id
           ORDER BY t.id DESC;"""
    )


def listar_documentos():
    """Todos os documentos com o nome do cliente (ou 'Global')."""
    return executar_consulta(
        """SELECT d.id, d.name AS nome, COALESCE(d.category, '-') AS categoria,
                  COALESCE(d.file_type, '-') AS tipo,
                  TO_CHAR(d.upload_date, 'YYYY-MM-DD') AS data,
                  COALESCE(u.name, 'Global') AS cliente
           FROM documents d
           LEFT JOIN users u ON u.id = d.client_id
           ORDER BY d.id DESC;"""
    )


def dados_gestao():
    """Reune as listagens usadas nos paineis de Administrador e Gestor."""
    return {
        'utilizadores': listar_utilizadores(),
        'clientes': listar_clientes(),
        'tickets': listar_tickets(),
        'documentos': listar_documentos(),
        'pedidos': listar_pedidos(),
        'contactos': listar_contactos(),
        'servicos': listar_servicos_anuais(),
        'auditoria': listar_auditoria(),
    }


# ==============================================================================
# ACOES DO CLIENTE (escrita) — abrir tickets, submeter pedidos, editar conta.
# Tudo por SQL (INSERT/UPDATE), sem ORM.
# ==============================================================================

def criar_ticket(client_id, titulo, categoria, prioridade, descricao):
    """Abre um novo ticket de suporte para o cliente autenticado."""
    return executar_comando(
        """INSERT INTO tickets (title, description, category, priority, status, client_id)
           VALUES (%s, %s, %s, %s, 'open', %s);""",
        (titulo, descricao, categoria or 'general', prioridade or 'medium', client_id)
    )


def criar_pedido(client_id, titulo, descricao):
    """Submete um novo pedido de servico para o cliente autenticado."""
    return executar_comando(
        """INSERT INTO service_requests (title, description, status, client_id)
           VALUES (%s, %s, 'pending', %s);""",
        (titulo, descricao, client_id)
    )


def atualizar_conta(user_id, nome, email):
    """Atualiza os dados da conta do proprio utilizador autenticado."""
    return executar_comando(
        """UPDATE users SET name = %s, email = %s, updated_at = NOW() WHERE id = %s;""",
        (nome, email, user_id)
    )


# ==============================================================================
# ACOES DE GESTAO (Administrador / Gestor) — gerir tickets, pedidos, documentos.
# Tudo por SQL (UPDATE/DELETE), sem ORM.
# ==============================================================================

def listar_pedidos():
    """Todos os pedidos de servico com o nome do cliente."""
    return executar_consulta(
        """SELECT sr.id, sr.title AS titulo, sr.status AS estado,
                  TO_CHAR(sr.request_date, 'YYYY-MM-DD') AS data,
                  COALESCE(u.name, '-') AS cliente
           FROM service_requests sr
           LEFT JOIN users u ON u.id = sr.client_id
           ORDER BY sr.id DESC;"""
    )


def atualizar_estado_ticket(ticket_id, estado):
    """Muda o estado de um ticket (open/in-progress/resolved/closed)."""
    return executar_comando(
        "UPDATE tickets SET status = %s, updated_at = NOW() WHERE id = %s;",
        (estado, ticket_id)
    )


def atualizar_estado_pedido(pedido_id, estado):
    """Muda o estado de um pedido (pending/in-progress/completed/cancelled)."""
    return executar_comando(
        "UPDATE service_requests SET status = %s, updated_at = NOW() WHERE id = %s;",
        (estado, pedido_id)
    )


def eliminar_documento(doc_id):
    """Remove um documento."""
    return executar_comando("DELETE FROM documents WHERE id = %s;", (doc_id,))


# ==============================================================================
# ATIVOS TECNOLOGICOS e INCIDENTES DE SEGURANCA (do proprio cliente)
# ==============================================================================

def listar_ativos_cliente(client_id):
    return executar_consulta(
        """SELECT name AS nome, COALESCE(asset_type, '-') AS tipo, quantity AS quantidade,
                  COALESCE(location, '-') AS local, criticality AS criticidade
           FROM tech_assets WHERE client_id = %s ORDER BY id DESC;""",
        (client_id,)
    )


def criar_ativo(client_id, nome, tipo, quantidade, local, criticidade, notas):
    return executar_comando(
        """INSERT INTO tech_assets (client_id, name, asset_type, quantity, location, criticality, notes)
           VALUES (%s, %s, %s, %s, %s, %s, %s);""",
        (client_id, nome, tipo, quantidade or 1, local, criticidade or 'media', notas)
    )


def listar_incidentes_cliente(client_id):
    return executar_consulta(
        """SELECT title AS titulo, TO_CHAR(incident_date, 'YYYY-MM-DD') AS data,
                  COALESCE(category, '-') AS categoria, severity AS severidade, status AS estado
           FROM security_incidents WHERE client_id = %s ORDER BY id DESC;""",
        (client_id,)
    )


def criar_incidente(client_id, titulo, data_inc, categoria, severidade, descricao):
    return executar_comando(
        """INSERT INTO security_incidents (client_id, title, incident_date, category, severity, description)
           VALUES (%s, %s, %s, %s, %s, %s);""",
        (client_id, titulo, data_inc or None, categoria, severidade or 'media', descricao)
    )


# ==============================================================================
# CONTACTOS PUBLICOS, SERVICOS ANUAIS e LOG DE AUDITORIA (paineis de gestao)
# ==============================================================================

def listar_contactos():
    return executar_consulta(
        """SELECT id, name AS nome, email, COALESCE(company, '-') AS empresa,
                  message AS mensagem, read AS lido,
                  TO_CHAR(submitted_at, 'YYYY-MM-DD') AS data
           FROM contact_submissions ORDER BY id DESC;"""
    )


def marcar_contacto_lido(contacto_id):
    return executar_comando(
        "UPDATE contact_submissions SET read = TRUE WHERE id = %s;", (contacto_id,)
    )


def listar_servicos_anuais():
    return executar_consulta(
        """SELECT id, client_name AS cliente, service_name AS servico,
                  service_type AS tipo, status AS estado, progress AS progresso,
                  TO_CHAR(deadline, 'YYYY-MM-DD') AS prazo
           FROM annual_services ORDER BY id DESC;"""
    )


def atualizar_estado_servico(servico_id, estado):
    return executar_comando(
        "UPDATE annual_services SET status = %s, updated_at = NOW() WHERE id = %s;",
        (estado, servico_id)
    )


def listar_auditoria():
    return executar_consulta(
        """SELECT id, action AS acao, category AS categoria, severity AS severidade,
                  COALESCE(user_email, '—') AS utilizador,
                  TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') AS data
           FROM audit_log ORDER BY id DESC LIMIT 100;"""
    )


# ==============================================================================
# MENSAGENS / CHAT (cliente <-> equipa Cyrix) — conversations + message_lines
# ==============================================================================

def obter_ou_criar_conversa(client_id):
    """Devolve o id da conversa do cliente; cria uma se ainda nao existir."""
    rows = executar_consulta(
        "SELECT id FROM conversations WHERE client_id = %s ORDER BY id LIMIT 1;",
        (client_id,)
    )
    if rows:
        return rows[0]['id']
    conn = obter_conexao()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO conversations (client_id, subject) VALUES (%s, %s) RETURNING id;",
            (client_id, 'Suporte')
        )
        novo_id = cursor.fetchone()[0]
        conn.commit()
        return novo_id
    except Exception as e:
        print(f"Erro ao criar conversa: {e}")
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()


def listar_mensagens(conversation_id):
    """Mensagens de uma conversa, com o autor e o perfil."""
    return executar_consulta(
        """SELECT ml.content AS texto, ml.sender_id AS autor_id,
                  COALESCE(u.name, '?') AS autor, u.role AS perfil,
                  TO_CHAR(ml.sent_at, 'YYYY-MM-DD HH24:MI') AS data
           FROM message_lines ml
           LEFT JOIN users u ON u.id = ml.sender_id
           WHERE ml.conversation_id = %s
           ORDER BY ml.id;""",
        (conversation_id,)
    )


def enviar_mensagem(conversation_id, sender_id, content):
    """Insere uma mensagem numa conversa e atualiza a data da conversa."""
    ok = executar_comando(
        "INSERT INTO message_lines (conversation_id, sender_id, content) VALUES (%s, %s, %s);",
        (conversation_id, sender_id, content)
    )
    executar_comando(
        "UPDATE conversations SET updated_at = NOW() WHERE id = %s;",
        (conversation_id,)
    )
    return ok


def dados_conversa_cliente(client_id):
    """Para o cliente: a sua conversa + mensagens (cria conversa se preciso)."""
    conv_id = obter_ou_criar_conversa(client_id)
    return {'conversation_id': conv_id, 'mensagens': listar_mensagens(conv_id)}


def listar_conversas():
    """Para o staff: todas as conversas com o cliente e a ultima mensagem."""
    return executar_consulta(
        """SELECT c.id, COALESCE(u.name, '?') AS cliente,
                  (SELECT content FROM message_lines WHERE conversation_id = c.id ORDER BY id DESC LIMIT 1) AS ultima,
                  (SELECT TO_CHAR(sent_at, 'YYYY-MM-DD HH24:MI') FROM message_lines WHERE conversation_id = c.id ORDER BY id DESC LIMIT 1) AS data
           FROM conversations c
           LEFT JOIN users u ON u.id = c.client_id
           ORDER BY c.updated_at DESC;"""
    )


def listar_clientes_conversas():
    """Para o staff: TODOS os clientes + a ultima mensagem (haja conversa ou nao).
    Permite ao admin/gestor iniciar chat com qualquer cliente."""
    return executar_consulta(
        """SELECT u.id AS client_id, u.name AS cliente,
                  (SELECT ml.content FROM message_lines ml
                     JOIN conversations c ON c.id = ml.conversation_id
                     WHERE c.client_id = u.id ORDER BY ml.id DESC LIMIT 1) AS ultima
           FROM users u
           WHERE u.role = 'client' AND u.active = TRUE
           ORDER BY u.name;"""
    )


# ==============================================================================
# CHAT INTERNO DOS TICKETS (ticket_comments) — cliente <-> staff por ticket
# ==============================================================================

def listar_comentarios_ticket(ticket_id):
    return executar_consulta(
        """SELECT tc.content AS texto, tc.user_id AS autor_id,
                  COALESCE(u.name, '?') AS autor, u.role AS perfil,
                  TO_CHAR(tc.created_at, 'YYYY-MM-DD HH24:MI') AS data
           FROM ticket_comments tc
           LEFT JOIN users u ON u.id = tc.user_id
           WHERE tc.ticket_id = %s ORDER BY tc.id;""",
        (ticket_id,)
    )


def criar_comentario_ticket(ticket_id, user_id, content):
    return executar_comando(
        "INSERT INTO ticket_comments (ticket_id, user_id, content) VALUES (%s, %s, %s);",
        (ticket_id, user_id, content)
    )
