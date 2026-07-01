-- ============================================================
-- fix_bd2.sql — novos requisitos (campos de cliente + categorias)
-- Seguro e idempotente. Correr no pgAdmin sobre a base projeto_BD.
-- ============================================================

-- 1) Campos extra do CLIENTE na tabela users
--    Telefone do cliente + Responsável de Segurança + Contacto Permanente
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone           VARCHAR(30);
ALTER TABLE users ADD COLUMN IF NOT EXISTS so_name         VARCHAR(100);   -- Responsável de Segurança: nome
ALTER TABLE users ADD COLUMN IF NOT EXISTS so_email        VARCHAR(150);   -- Responsável de Segurança: email
ALTER TABLE users ADD COLUMN IF NOT EXISTS so_phone        VARCHAR(30);    -- Responsável de Segurança: telefone
ALTER TABLE users ADD COLUMN IF NOT EXISTS pc_name         VARCHAR(100);   -- Contacto Permanente: nome
ALTER TABLE users ADD COLUMN IF NOT EXISTS pc_email        VARCHAR(150);   -- Contacto Permanente: email
ALTER TABLE users ADD COLUMN IF NOT EXISTS pc_phone        VARCHAR(30);    -- Contacto Permanente: telefone

-- 2) ATIVOS TECNOLÓGICOS (registados pelo cliente / importados de Excel)
CREATE TABLE IF NOT EXISTS tech_assets (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    asset_type VARCHAR(100),        -- Servidor, Portátil, Software, Rede, ...
    quantity INTEGER NOT NULL DEFAULT 1,
    location VARCHAR(150),
    criticality VARCHAR(20) DEFAULT 'media' CHECK (criticality IN ('baixa','media','alta','critica')),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 3) INCIDENTES DE SEGURANÇA (report com base no formulário do CNCS)
CREATE TABLE IF NOT EXISTS security_incidents (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(250) NOT NULL,
    incident_date DATE,
    category VARCHAR(80),           -- Ransomware, Phishing, Acesso não autorizado, ...
    severity VARCHAR(20) NOT NULL DEFAULT 'media' CHECK (severity IN ('baixa','media','alta','critica')),
    description TEXT,
    impact TEXT,                    -- Impacto/consequências
    actions TEXT,                   -- Ações tomadas
    status VARCHAR(20) NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto','em-analise','resolvido','fechado')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4) PEN TESTS (testes de intrusão do cliente)
CREATE TABLE IF NOT EXISTS pentests (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(250) NOT NULL,
    test_date DATE,
    scope VARCHAR(250),             -- Âmbito (ex.: infraestrutura cloud)
    summary TEXT,
    critico INTEGER NOT NULL DEFAULT 0,
    alto INTEGER NOT NULL DEFAULT 0,
    medio INTEGER NOT NULL DEFAULT 0,
    baixo INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_assets_client     ON tech_assets(client_id);
CREATE INDEX IF NOT EXISTS idx_incidents_client  ON security_incidents(client_id);
CREATE INDEX IF NOT EXISTS idx_pentests_client   ON pentests(client_id);
