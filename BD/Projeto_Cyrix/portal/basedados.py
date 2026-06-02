import psycopg2
from psycopg2.extras import RealDictCursor

def obter_conexao():
    """Estabelece a ligação direta com a base de dados PostgreSQL do pgAdmin"""
    return psycopg2.connect(
        dbname="projeto_BD",
        user="postgres",
        password="BDCatarina6",
        host="localhost",
        port="5432"
    )

def executar_consulta(query, params=None):
    """Executa consultas SELECT e mapeia os resultados para dicionários"""
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

# ==============================================================================
# REQUISITOS OBRIGATÓRIOS DA FICHA 9 (Métricas do Dashboard)
# ==============================================================================

def obter_conformidade_nis2():
    """Ex 1: Número de clientes por estado de conformidade NIS2"""
    # Ajusta os nomes das colunas/tabelas conforme a tua base de dados real
    query = """
        SELECT estado_nis2, COUNT(*) as total 
        FROM clientes 
        GROUP BY estado_nis2;
    """
    return executar_consulta(query)

def obter_top5_incidentes():
    """Ex 2: Top 5 clientes com mais incidentes de segurança registados"""
    query = """
        SELECT c.nome, COUNT(i.id) as total_incidentes
        FROM clientes c
        JOIN incidentes i ON c.id = i.cliente_id
        GROUP BY c.id, c.nome
        ORDER BY total_incidentes DESC
        LIMIT 5;
    """
    return executar_consulta(query)

def obter_documentos_por_mes():
    """Ex 3: Total de documentos submetidos por cliente e por mês"""
    query = """
        SELECT c.nome as cliente, 
               TO_CHAR(d.data_submissao, 'YYYY-MM') as mes, 
               COUNT(d.id) as total_documentos
        FROM clientes c
        JOIN documentos d ON c.id = d.cliente_id
        GROUP BY c.nome, mes
        ORDER BY mes DESC, total_documentos DESC;
    """
    return executar_consulta(query)

def obter_distribuicao_perfis():
    """Ex 4: Distribuição de utilizadores por perfil (Administrador, Colaborador, Cliente)"""
    query = """
        SELECT perfil, COUNT(*) as total 
        FROM utilizadores 
        GROUP BY perfil;
    """
    return executar_consulta(query)

def obter_estado_tickets_resolucao():
    """Ex 5: Estado dos pedidos/tickets de suporte e tempo médio de resolução"""
    query = """
        SELECT estado, 
               COUNT(*) as total_tickets,
               AVG(data_resolucao - data_criacao) as tempo_medio_resolucao
        FROM tickets
        GROUP BY estado;
    """
    return executar_consulta(query)

# ==============================================================================
# AUTENTICAÇÃO E ENVIO DE FORMULÁRIOS
# ==============================================================================

def inserir_contacto(nome, email, mensagem):
    conn = obter_conexao()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO contact_submissions (name, email, message) VALUES (%s, %s, %s);",
            (nome, email, mensagem)
        )
        conn.commit()
        return True
    except Exception as e:
        print(f"Erro ao gravar contacto: {e}")
        return False
    finally:
        cursor.close()
        conn.close()

def validar_login(email, password):
    conn = obter_conexao()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute(
            "SELECT id, nome, email, perfil FROM utilizadores WHERE email = %s AND password = %s;",
            (email, password)
        )
        return cursor.fetchone()
    except Exception as e:
        print(f"Erro na autenticação: {e}")
        return None
    finally:
        cursor.close()
        conn.close()

        # ==============================================================================
# OPERAÇÕES DE CRUD EM FALTA (Exigidas pela Ficha 7, Ponto 5)
# ==============================================================================

# --- CRUD: UTILIZADORES ---

def criar_utilizador(nome, email, password, perfil):
    """CREATE: Insere um novo utilizador no sistema"""
    conn = obter_conexao()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO utilizadores (nome, email, password, perfil) VALUES (%s, %s, %s, %s);",
            (nome, email, password, perfil)
        )
        conn.commit()
        return True
    except Exception as e:
        print(f"Erro ao criar utilizador: {e}")
        return False
    finally:
        cursor.close()
        conn.close()

def atualizar_utilizador(id_utilizador, nome, email, perfil):
    """UPDATE: Atualiza os dados de um utilizador existente"""
    conn = obter_conexao()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "UPDATE utilizadores SET nome = %s, email = %s, perfil = %s WHERE id = %s;",
            (nome, email, perfil, id_utilizador)
        )
        conn.commit()
        return True
    except Exception as e:
        print(f"Erro ao atualizar utilizador: {e}")
        return False
    finally:
        cursor.close()
        conn.close()

def eliminar_utilizador(id_utilizador):
    """DELETE: Remove um utilizador do PostgreSQL"""
    conn = obter_conexao()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM utilizadores WHERE id = %s;", (id_utilizador,))
        conn.commit()
        return True
    except Exception as e:
        print(f"Erro ao eliminar utilizador: {e}")
        return False
    finally:
        cursor.close()
        conn.close()


# --- CRUD: CLIENTES ---

def criar_cliente(nome, estado_nis2):
    """CREATE: Insere um novo cliente"""
    conn = obter_conexao()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO clientes (nome, estado_nis2) VALUES (%s, %s);",
            (nome, estado_nis2)
        )
        conn.commit()
        return True
    except Exception as e:
        print(f"Erro ao criar cliente: {e}")
        return False
    finally:
        cursor.close()
        conn.close()

def atualizar_cliente(id_cliente, nome, estado_nis2):
    """UPDATE: Altera o estado NIS2 ou o nome do cliente"""
    conn = obter_conexao()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "UPDATE clientes SET nome = %s, estado_nis2 = %s WHERE id = %s;",
            (nome, estado_nis2, id_cliente)
        )
        conn.commit()
        return True
    except Exception as e:
        print(f"Erro ao atualizar cliente: {e}")
        return False
    finally:
        cursor.close()
        conn.close()

def eliminar_cliente(id_cliente):
    """DELETE: Apaga um cliente da base de dados"""
    conn = obter_conexao()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM clientes WHERE id = %s;", (id_cliente,))
        conn.commit()
        return True
    except Exception as e:
        print(f"Erro ao eliminar cliente: {e}")
        return False
    finally:
        cursor.close()
        conn.close()