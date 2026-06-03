-- ============================================================================
-- Cirix - Dados de exemplo (opcional) para a base de dados "projeto_BD"
-- Aplicar DEPOIS do schema.sql:
--   psql -U postgres -d projeto_BD -f database/seed.sql
-- ============================================================================

INSERT INTO utilizadores (nome, email, password, perfil) VALUES
    ('Admin Cirix',   'admin@cirix.pt',     'admin123', 'Administrador'),
    ('Rodrigo Silva', 'rodrigo@cirix.pt',   'pass123',  'Colaborador'),
    ('Catarina Reis', 'catarina@cirix.pt',  'pass123',  'Colaborador');

INSERT INTO clientes (nome, estado_nis2) VALUES
    ('Empresa Alfa Lda',  'Conforme'),
    ('Beta Solutions SA', 'Em Avaliacao'),
    ('Gamma Tech',        'Nao Conforme');

INSERT INTO incidentes (cliente_id, descricao, severidade, estado, data_ocorrencia) VALUES
    (1, 'Tentativa de phishing detetada', 'Media',   'Resolvido',        '2026-05-10 09:30:00'),
    (3, 'Acesso nao autorizado a servidor', 'Critica', 'Em Investigacao', '2026-05-28 22:15:00'),
    (2, 'Malware num posto de trabalho',  'Alta',    'Aberto',           '2026-06-01 14:00:00');

INSERT INTO documentos (cliente_id, nome, data_submissao) VALUES
    (1, 'Politica de Seguranca.pdf', '2026-05-05 10:00:00'),
    (2, 'Relatorio de Auditoria.pdf', '2026-05-20 16:30:00');

INSERT INTO tickets (assunto, estado, data_criacao, data_resolucao) VALUES
    ('Reset de password',          'Resolvido', '2026-05-15 08:00:00', '2026-05-15 09:00:00'),
    ('Pedido de novo acesso VPN',  'Aberto',    '2026-06-02 11:00:00', NULL),
    ('Erro ao submeter documento', 'Em Curso',  '2026-06-03 09:45:00', NULL);
