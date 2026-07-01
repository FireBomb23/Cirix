-- ============================================================
-- fix_bd.sql — sincroniza a base de dados projeto_BD com o codigo atual.
-- Seguro e idempotente: SO cria/adiciona o que faltar. NAO apaga dados.
-- Correr no pgAdmin (Query Tool) sobre a base projeto_BD.
-- ============================================================

-- 1) Tabelas do chat (faltam em BDs criadas de versoes antigas)
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    staff_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    subject VARCHAR(250),
    unread_count SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS message_lines (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sent_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2) Colunas adicionadas depois (documentos e contactos)
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_data TEXT;
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS reply TEXT;
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS replied_at TIMESTAMP;

-- 3) Indices do chat (so se faltarem)
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON message_lines(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_client  ON conversations(client_id);
