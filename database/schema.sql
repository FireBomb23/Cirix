-- ============================================================================
-- Cirix - Esquema da base de dados "projeto_BD" (PostgreSQL)
-- ----------------------------------------------------------------------------
-- Fonte OFICIAL e partilhada das tabelas usadas por AMBOS os projetos:
--   - BD/      (Django - outra cadeira)
--   - src/     (Node + Express + Sequelize - Aplicacoes para a Internet II)
--
-- Como usar (com o PostgreSQL a correr):
--   1) Criar a base de dados (uma vez):
--        CREATE DATABASE "projeto_BD";
--   2) Aplicar este esquema:
--        psql -U postgres -d projeto_BD -f database/schema.sql
--      (ou abrir e executar este ficheiro no pgAdmin, ligado a projeto_BD)
--   3) (Opcional) Dados de exemplo:  database/seed.sql
-- ============================================================================

-- --- Utilizadores -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS utilizadores (
    id        SERIAL PRIMARY KEY,
    nome      VARCHAR(150) NOT NULL,
    email     VARCHAR(150) NOT NULL UNIQUE,
    password  VARCHAR(255) NOT NULL,
    perfil    VARCHAR(50)
);

-- --- Clientes ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clientes (
    id           SERIAL PRIMARY KEY,
    nome         VARCHAR(150) NOT NULL,
    estado_nis2  VARCHAR(50)            -- ex: 'Conforme', 'Nao Conforme', 'Em Avaliacao'
);

-- --- Incidentes (de seguranca, associados a um cliente) ---------------------
CREATE TABLE IF NOT EXISTS incidentes (
    id               SERIAL PRIMARY KEY,
    cliente_id       INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    descricao        TEXT,
    severidade       VARCHAR(50),       -- ex: 'Baixa', 'Media', 'Alta', 'Critica'
    estado           VARCHAR(50),       -- ex: 'Aberto', 'Em Investigacao', 'Resolvido'
    data_ocorrencia  TIMESTAMP
);

-- --- Documentos (submetidos por cliente) ------------------------------------
CREATE TABLE IF NOT EXISTS documentos (
    id              SERIAL PRIMARY KEY,
    cliente_id      INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    nome            VARCHAR(200),
    data_submissao  TIMESTAMP DEFAULT NOW()
);

-- --- Tickets (pedidos de suporte) -------------------------------------------
CREATE TABLE IF NOT EXISTS tickets (
    id              SERIAL PRIMARY KEY,
    assunto         VARCHAR(200),
    estado          VARCHAR(50),        -- ex: 'Aberto', 'Em Curso', 'Resolvido', 'Fechado'
    data_criacao    TIMESTAMP DEFAULT NOW(),
    data_resolucao  TIMESTAMP
);

-- --- Submissoes do formulario de contacto -----------------------------------
CREATE TABLE IF NOT EXISTS contact_submissions (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(150),
    email       VARCHAR(150),
    message     TEXT,
    created_at  TIMESTAMP DEFAULT NOW()
);
