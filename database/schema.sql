-- ============================================================
-- Ciryx - Esquema OFICIAL da base de dados "projeto_BD" (PostgreSQL)
-- Fonte partilhada entre o projeto Django (BD/) e o projeto AI2 (src/ + frontend/).
-- Correr numa base de dados projeto_BD vazia.
-- ============================================================

-- ============================================================
-- 1. UTILIZADORES (users)
-- ============================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'manager', 'client')),
    company VARCHAR(150), -- Apenas preenchido se for cliente
    twofa_word1 VARCHAR(60), -- Palavras para simulação do mecanismo de 2FA
    twofa_word2 VARCHAR(60),
    twofa_word3 VARCHAR(60),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Inserção de dados de teste na tabela users.
-- As passwords sao guardadas com hash bcrypt (como na Aula 11). Passwords reais (para login):
--   admin@ciryx.pt -> admin123 | manager@ciryx.pt -> manager123 | cliente@empresa.pt -> client123
INSERT INTO users (name, email, password_hash, role, twofa_word1, twofa_word2, twofa_word3) VALUES
('João Silva', 'admin@ciryx.pt', '$2b$10$Smo3ndzdnCW6Xov6xxCqGusKvu5jbpVUYwr44lXY.2fzobrnohYyu', 'admin', 'segurança', 'firewall', 'cifra'),
('Maria Santos', 'manager@ciryx.pt', '$2b$10$ngcEDHBDTUY7b7mSVsJE1uUgrDATHqpbuBjcOSZ1KjUqYAnUu7UCi', 'manager', 'proteção', 'ameaça', 'escudo');

INSERT INTO users (name, email, password_hash, role, company, twofa_word1, twofa_word2, twofa_word3) VALUES
('Carlos Oliveira', 'cliente@empresa.pt', '$2b$10$jxoGXkgJ3OKE3QRHzhpPU.qR7MP6DI/LwPRTvWk1mqH5CqC.Ask8e', 'client', 'Empresa ABC, Lda.', 'privacidade', 'código', 'autenticação');


-- ============================================================
-- 2. MEMBROS DA EQUIPA (team_members)
-- Entidades exibidas na vista pública "Sobre Nós"
-- ============================================================
CREATE TABLE team_members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role_label VARCHAR(100) NOT NULL, -- Ex: "CEO & Fundador", "Diretora Técnica"
    initials VARCHAR(5) NOT NULL, -- Iniciais usadas para o avatar dinâmico
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Se o utilizador for apagado, mantém o membro da equipa histórico
    sort_order SMALLINT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO team_members (name, role_label, initials, sort_order) VALUES
('Dr. Miguel Ferreira', 'CEO & Fundador', 'MF', 1),
('Eng. Ana Costa', 'Diretora Técnica', 'AC', 2),
('João Silva', 'Gestor de Operações', 'JS', 3),
('Maria Santos', 'Consultora Sénior', 'MS', 4);


-- ============================================================
-- 3. SERVIÇOS E FUNCIONALIDADES (services e service_features)
-- Relação 1-para-Muitos (Cada serviço tem várias features associadas)
-- ============================================================
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50), -- Nome do ícone SVG para mapear no frontend
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE service_features (
    id SERIAL PRIMARY KEY,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE, -- Elimina as dependências se o serviço for removido
    feature VARCHAR(200) NOT NULL,
    sort_order SMALLINT NOT NULL DEFAULT 0
);

INSERT INTO services (title, description, icon, sort_order) VALUES
('Avaliação de Maturidade em TI', 'Análise completa do estado de maturidade tecnológica da sua organização, com recomendações práticas para evolução.', 'shield', 1),
('Testes de Intrusão (PenTest)', 'Testes de penetração com análise periférica para identificar vulnerabilidades antes que sejam exploradas.', 'bug', 2),
('Conformidade NIS I e NIS II', 'Apoio completo ao cumprimento das diretivas europeias de cibersegurança, incluindo relatórios anuais obrigatórios.', 'file-check', 3),
('Formação Especializada', 'Programas de formação em cibersegurança adaptados às necessidades específicas da sua equipa.', 'graduation-cap', 4);

INSERT INTO service_features (service_id, feature, sort_order) VALUES
(1, 'Análise de infraestrutura', 1), (1, 'Avaliação de processos', 2), (1, 'Identificação de gaps', 3), (1, 'Roadmap de evolução', 4),
(2, 'Teste de perímetro', 1), (2, 'Análise de vulnerabilidades', 2), (2, 'Relatório técnico detalhado', 3), (2, 'Recomendações de correção', 4),
(3, 'Análise de conformidade', 1), (3, 'Elaboração de relatórios', 2), (3, 'Acompanhamento contínuo', 3), (3, 'Preparação para auditorias', 4),
(4, 'Formação personalizada', 1), (4, 'Workshops práticos', 2), (4, 'Certificações', 3), (4, 'Materiais de apoio', 4);


-- ============================================================
-- 4. ARTIGOS DO BLOG (articles)
-- Notícias e publicações de teor técnico ou informativo
-- ============================================================
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(250) NOT NULL,
    excerpt TEXT,
    content TEXT,
    author VARCHAR(100) NOT NULL,
    category VARCHAR(80),
    published BOOLEAN NOT NULL DEFAULT TRUE,
    published_at DATE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO articles (title, excerpt, author, category, published_at) VALUES
('NIS2 Directive: O que muda para as empresas portuguesas', 'A nova diretiva NIS2 traz requisitos mais rigorosos de cibersegurança para organizações críticas.', 'Dr. Miguel Ferreira', 'Regulamentação', '2026-03-10'),
('Testes de Intrusão: Metodologias e Melhores Práticas', 'Entenda como os testes de penetração podem fortalecer a segurança da sua infraestrutura.', 'Eng. Ana Costa', 'Técnico', '2026-03-05'),
('Avaliação de Maturidade em Cibersegurança', 'Como medir o nível de maturidade da sua organização em termos de segurança digital.', 'Dr. Miguel Ferreira', 'Consultoria', '2026-02-28');


-- ============================================================
-- 5. DOCUMENTOS DE CLIENTE (documents)
-- Ficheiros partilhados de forma privada ou global no portal
-- ============================================================
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(250) NOT NULL,
    file_type VARCHAR(20), -- PDF, XLSX, DOCX, etc.
    file_size VARCHAR(20), -- Ex: "2.4 MB"
    file_path VARCHAR(500), -- Caminho local de simulação do ficheiro
    file_data TEXT, -- Conteudo do ficheiro em base64 (data URL) para upload/download real
    category VARCHAR(80), -- Relatórios, Templates, Documentação
    visibility VARCHAR(20) NOT NULL DEFAULT 'client' CHECK (visibility IN ('global', 'client')),
    client_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Se for NULL, o documento passa a global/público
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    upload_date TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO documents (name, file_type, file_size, category, visibility, client_id) VALUES
('Relatório PenTest - Q1 2026', 'PDF', '2.4 MB', 'Relatórios', 'client', 3),
('Avaliação de Maturidade - Empresa ABC', 'PDF', '1.8 MB', 'Relatórios', 'client', 3),
('Guia de Boas Práticas NIS2', 'PDF', '850 KB', 'Documentação', 'global', NULL),
('Template Relatório Anual NIS', 'XLSX', '320 KB', 'Templates', 'global', NULL);


-- ============================================================
-- 6. PEDIDOS DE SERVIÇOS (service_requests)
-- Solicitações submetidas via formulário do portal
-- ============================================================
CREATE TABLE service_requests (
    id SERIAL PRIMARY KEY,
    title VARCHAR(250) NOT NULL,
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
    client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO service_requests (title, description, status, client_id, request_date) VALUES
('Solicitação de PenTest Adicional', 'Necessitamos de um teste de intrusão adicional para a nova infraestrutura cloud.', 'in-progress', 3, '2026-03-12'),
('Esclarecimento sobre Relatório Q1', 'Questões sobre algumas recomendações do último relatório.', 'completed', 3, '2026-03-08'),
('Submissão de Dados de Ativos', 'Envio da lista atualizada de ativos tecnológicos.', 'completed', 3, '2026-03-05');


-- ============================================================
-- 7. TICKETS DE SUPORTE (tickets e ticket_comments)
-- Sistema de suporte técnico para tracking de incidentes
-- ============================================================
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(250) NOT NULL,
    description TEXT,
    category VARCHAR(20) NOT NULL CHECK (category IN ('technical', 'general', 'incident', 'billing', 'other')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')),
    client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE ticket_comments (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO tickets (title, description, category, priority, status, client_id, assigned_to, created_at) VALUES
('Problema de acesso ao portal', 'Não consigo fazer login no portal desde ontem.', 'technical', 'high', 'in-progress', 3, 1, '2026-03-15 14:30:00'),
('Solicitação de relatório adicional', 'Preciso de um relatório extra sobre a infraestrutura cloud.', 'general', 'medium', 'open', 3, NULL, '2026-03-16 10:00:00'),
('Incidente de segurança detectado', 'O sistema detectou tentativas de acesso não autorizadas.', 'incident', 'urgent', 'resolved', 3, 2, '2026-03-14 16:45:00');

INSERT INTO ticket_comments (ticket_id, user_id, content, created_at) VALUES
(1, 3, 'Não consigo fazer login no portal desde ontem.', '2026-03-15 14:30:00'),
(1, 1, 'Obrigado pelo reporte. Estou a investigar. Pode verificar se o email está na pasta de spam?', '2026-03-16 09:00:00'),
(2, 3, 'Preciso do relatório até dia 20.', '2026-03-16 10:00:00'),
(3, 3, 'Detetadas 15 tentativas de login falhadas em 10 minutos.', '2026-03-14 16:45:00'),
(3, 2, 'Verificado. Era um teste automatizado mal configurado. Problema resolvido.', '2026-03-15 11:30:00');


-- ============================================================
-- 8. CONTRATOS ANUAIS (annual_services)
-- Acompanhamento contínuo de projetos a longo prazo
-- ============================================================
CREATE TABLE annual_services (
    id SERIAL PRIMARY KEY,
    client_name VARCHAR(150) NOT NULL, -- Permite guardar clientes que ainda não criaram conta utilizador
    client_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    service_type VARCHAR(30) NOT NULL CHECK (service_type IN ('pentest','nis-compliance','maturity-assessment','training','other')),
    service_name VARCHAR(250) NOT NULL,
    start_date DATE NOT NULL,
    deadline DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in-progress','completed','overdue','cancelled')),
    progress SMALLINT NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO annual_services (client_name, service_type, service_name, start_date, deadline, status, progress, assigned_to) VALUES
('Tech Solutions Lda.', 'nis-compliance', 'Relatório Anual NIS2 - 2026', '2026-01-01', '2026-01-31', 'completed', 100, 2),
('Tech Solutions Lda.', 'pentest', 'PenTest Trimestral Q2', '2026-03-01', '2026-06-30', 'in-progress', 45, 1),
('Hospital Central', 'maturity-assessment', 'Avaliação de Maturidade 2026', '2026-02-01', '2026-12-31', 'in-progress', 25, 1),
('Energia Verde PT', 'training', 'Formação em Cibersegurança', '2026-03-01', '2026-12-31', 'pending', 0, NULL);

INSERT INTO annual_services (client_name, service_type, service_name, start_date, deadline, status, progress, assigned_to, notes) VALUES
('Banco Digital SA', 'nis-compliance', 'Conformidade NIS2 - Auditoria Anual', '2026-01-01', '2026-01-31', 'overdue', 60, 2, 'Cliente atrasou envio de documentação.');


-- ============================================================
-- 9. CHAT INTERNO (conversations e message_lines)
-- Sistema de envio de mensagens diretas
-- ============================================================
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    staff_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    subject VARCHAR(250),
    unread_count SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE message_lines (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sent_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO conversations (client_id, staff_id, subject, unread_count) VALUES
(3, 1, 'Questões sobre relatório de PenTest', 1);

INSERT INTO message_lines (conversation_id, sender_id, content, sent_at) VALUES
(1, 3, 'Bom dia! Tenho algumas questões sobre o relatório de PenTest.', '2026-03-16 09:30:00'),
(1, 1, 'Bom dia Carlos! Claro, em que questões posso ajudar?', '2026-03-16 09:45:00'),
(1, 3, 'As recomendações na secção 3 sobre autenticação multifator — como implementar?', '2026-03-16 10:00:00'),
(1, 1, 'Essas recomendações referem-se à implementação de autenticação multifator usando TOTP.', '2026-03-16 10:15:00');


-- ============================================================
-- 10. SUBMISSÕES DE CONTACTO PÚBLICO (contact_submissions)
-- Mensagens gerais vindas da Landing Page pública
-- ============================================================
CREATE TABLE contact_submissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    company VARCHAR(150),
    phone VARCHAR(30),
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    reply TEXT,                    -- resposta do staff (admin/gestor)
    replied_at TIMESTAMP,          -- data da resposta
    submitted_at TIMESTAMP NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 11. REGISTO DE AUDITORIA / LOGS DO SISTEMA (audit_log)
-- Tabela para rastreabilidade de eventos e logs do sistema
-- ============================================================
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    action VARCHAR(250) NOT NULL,
    category VARCHAR(30) NOT NULL CHECK (category IN ('authentication','content','users','documents','system','security')),
    severity VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(150), -- Mantém registado o email do autor em caso de remoção do utilizador
    ip_address VARCHAR(45),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO audit_log (action, category, severity, user_id, user_email, ip_address, created_at) VALUES
('Login realizado', 'authentication', 'info', 1, 'admin@ciryx.pt', '192.168.1.10', '2026-03-16 11:20:00'),
('Utilizador criado: cliente@nova.pt', 'users', 'info', 1, 'admin@ciryx.pt', '192.168.1.10', '2026-03-16 10:45:00'),
('Falhas de login consecutivas (5x)', 'security', 'critical', NULL, 'desconhecido', '203.0.113.45', '2026-03-16 09:30:00'),
('Documento enviado: Relatório PenTest Q1', 'documents', 'info', 2, 'manager@ciryx.pt', '192.168.1.15', '2026-03-15 16:00:00'),
('Artigo publicado: NIS2 Directive', 'content', 'info', 1, 'admin@ciryx.pt', '192.168.1.10', '2026-03-15 14:30:00'),
('Ticket urgente criado: Incidente segurança', 'system', 'warning', 3, 'cliente@empresa.pt', '10.0.0.25', '2026-03-14 16:45:00'),
('Permissões alteradas: manager@ciryx.pt', 'users', 'warning', 1, 'admin@ciryx.pt', '192.168.1.10', '2026-03-14 11:00:00'),
('Backup do sistema realizado', 'system', 'info', NULL, 'sistema', 'localhost', '2026-03-14 03:00:00'),
('Configuração de segurança alterada', 'security', 'warning', 1, 'admin@ciryx.pt', '192.168.1.10', '2026-03-13 15:20:00'),
('Exportação de dados realizada', 'documents', 'info', 2, 'manager@ciryx.pt', '192.168.1.15', '2026-03-13 10:10:00');


-- ============================================================
-- 12. ÍNDICES DE OTIMIZAÇÃO (INDEXES)
-- Adicionados para otimizar pesquisas frequentes (Consultas/Filtros)
-- ============================================================
CREATE INDEX idx_documents_client          ON documents(client_id);
CREATE INDEX idx_documents_visibility      ON documents(visibility);
CREATE INDEX idx_requests_client           ON service_requests(client_id);
CREATE INDEX idx_requests_status           ON service_requests(status);
CREATE INDEX idx_tickets_client            ON tickets(client_id);
CREATE INDEX idx_tickets_status            ON tickets(status);
CREATE INDEX idx_tickets_priority          ON tickets(priority);
CREATE INDEX idx_ticket_comments_ticket    ON ticket_comments(ticket_id);
CREATE INDEX idx_annual_status             ON annual_services(status);
CREATE INDEX idx_annual_assigned           ON annual_services(assigned_to);
CREATE INDEX idx_audit_severity            ON audit_log(severity);
CREATE INDEX idx_audit_created             ON audit_log(created_at DESC);
CREATE INDEX idx_audit_user                ON audit_log(user_id);
CREATE INDEX idx_articles_published        ON articles(published_at DESC);
CREATE INDEX idx_messages_conversation     ON message_lines(conversation_id);
CREATE INDEX idx_conversations_client      ON conversations(client_id);


-- ============================================================
-- 13. VISTAS RELACIONAIS (VIEWS)
-- Desenvolvidas para simplificar as consultas feitas pelo Django
-- ============================================================

-- Vista para juntar informações dos Tickets com dados do respetivo cliente
CREATE OR REPLACE VIEW vw_open_tickets AS
SELECT
    t.id,
    t.title,
    t.category,
    t.priority,
    t.status,
    t.created_at,
    c.name       AS client_name,
    c.email      AS client_email,
    c.company    AS client_company,
    a.name       AS assigned_to,
    (SELECT COUNT(*) FROM ticket_comments tc WHERE tc.ticket_id = t.id) AS comment_count
FROM tickets t
JOIN users c ON c.id = t.client_id
LEFT JOIN users a ON a.id = t.assigned_to
WHERE t.status NOT IN ('resolved','closed');

-- Vista para listar documentos mapeando os nomes dos clientes e autores
CREATE OR REPLACE VIEW vw_documents AS
SELECT
    d.id,
    d.name,
    d.file_type,
    d.file_size,
    d.category,
    d.visibility,
    d.upload_date,
    u.name       AS client_name,
    u.email      AS client_email,
    up.name      AS uploaded_by_name
FROM documents d
LEFT JOIN users u  ON u.id  = d.client_id
LEFT JOIN users up ON up.id = d.uploaded_by;

-- Vista para monitorizar o progresso de contratos e alertar prazos ultrapassados
CREATE OR REPLACE VIEW vw_annual_services AS
SELECT
    s.id,
    s.client_name,
    s.service_type,
    s.service_name,
    s.start_date,
    s.deadline,
    s.status,
    s.progress,
    s.notes,
    u.name       AS assigned_to_name,
    CASE WHEN s.deadline < CURRENT_DATE AND s.status NOT IN ('completed','cancelled')
         THEN TRUE ELSE FALSE END AS is_overdue
FROM annual_services s
LEFT JOIN users u ON u.id = s.assigned_to;

-- Vista para o histórico de logs com criticidade elevada (Warnings e Critical)
CREATE OR REPLACE VIEW vw_audit_alerts AS
SELECT
    a.id,
    a.action,
    a.category,
    a.severity,
    a.user_email,
    a.ip_address,
    a.created_at,
    u.name AS user_name
FROM audit_log a
LEFT JOIN users u ON u.id = a.user_id
WHERE a.severity IN ('warning','critical')
ORDER BY a.created_at DESC;

-- ============================================================
-- FIM DO SCRIPT DO PROJETO
-- ============================================================
