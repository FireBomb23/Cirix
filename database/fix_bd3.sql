-- ============================================================
-- fix_bd3.sql — Atribuição de clientes a gestores
-- Cada cliente pode ter um gestor responsável (1 gestor -> N clientes).
-- Seguro e idempotente. Correr no pgAdmin sobre a base projeto_BD.
-- ============================================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_users_manager ON users(manager_id);

-- Atribui os clientes já existentes ao gestor de demonstração (Maria Santos),
-- para que o exemplo funcione de imediato. O admin pode depois trocar no portal.
UPDATE users
SET manager_id = (SELECT id FROM users WHERE email = 'manager@cyrix.pt' LIMIT 1)
WHERE role = 'client' AND manager_id IS NULL;
