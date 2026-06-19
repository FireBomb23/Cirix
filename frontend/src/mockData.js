export const mockArticles = [
  {
    id: '1',
    title: 'NIS2 Directive: O que muda para as empresas portuguesas',
    excerpt: 'A nova diretiva europeia NIS2 traz mudanças significativas para as organizações portuguesas. Analisamos os principais requisitos e como se preparar para a conformidade.',
    author: 'Dr. Miguel Ferreira',
    date: '2026-03-10',
    category: 'Regulamentação',
  },
  {
    id: '2',
    title: 'Testes de Intrusão: Metodologias e Melhores Práticas',
    excerpt: 'Os testes de intrusão são essenciais para identificar vulnerabilidades antes que os atacantes o façam. Exploramos as principais metodologias utilizadas por profissionais.',
    author: 'Eng. Ana Costa',
    date: '2026-03-05',
    category: 'Técnico',
  },
  {
    id: '3',
    title: 'Avaliação de Maturidade em Cibersegurança',
    excerpt: 'Como avaliar o nível de maturidade em cibersegurança da sua organização? Apresentamos um framework prático para identificar gaps e priorizar melhorias.',
    author: 'Dr. Miguel Ferreira',
    date: '2026-02-28',
    category: 'Consultoria',
  },
];

export const mockServices = [
  {
    id: '1',
    title: 'Implementação NIS2',
    description: 'Acompanhamento end-to-end para que a sua organização cumpra integralmente a Diretiva NIS2 — da análise de lacunas à submissão do relatório de conformidade.',
    features: ['Análise de lacunas (gap analysis)', 'Definição de plano de ação', 'Elaboração de políticas de segurança', 'Preparação para auditorias NIS2'],
    icon: 'file-check',
  },
  {
    id: '2',
    title: 'Auditorias de Segurança',
    description: 'Avaliação técnica e organizacional da maturidade em cibersegurança, com identificação de vulnerabilidades e recomendações priorizadas.',
    features: ['Avaliação de maturidade (ISO 27001, NIST, CIS)', 'Testes de intrusão (PenTest)', 'Análise de vulnerabilidades', 'Relatório executivo e técnico detalhado'],
    icon: 'shield',
  },
  {
    id: '3',
    title: 'Formação & Security Awareness',
    description: 'Programas de sensibilização e formação especializada para todos os níveis da organização — do utilizador ao CISO.',
    features: ['Simulações de phishing', 'Workshops de segurança', 'Formação para equipas técnicas', 'Módulos de e-learning personalizados'],
    icon: 'graduation-cap',
  },
  {
    id: '4',
    title: 'Gestão Contínua de Risco',
    description: 'Monitorização permanente do risco cibernético da sua organização, com relatórios periódicos e suporte dedicado.',
    features: ['Dashboard de risco em tempo real', 'Relatórios trimestrais de avaliação', 'Resposta a incidentes', 'Suporte 24/7 a situações críticas'],
    icon: 'bug',
  },
];

export const mockDocuments = [
  { id: '1', name: 'Relatório PenTest - Q1 2026', type: 'PDF', size: '2.4 MB', uploadDate: '2026-03-15', clientId: '3', category: 'Relatórios' },
  { id: '2', name: 'Avaliação de Maturidade - Empresa ABC', type: 'PDF', size: '1.8 MB', uploadDate: '2026-03-10', clientId: '3', category: 'Relatórios' },
  { id: '3', name: 'Guia de Boas Práticas NIS2', type: 'PDF', size: '850 KB', uploadDate: '2026-02-20', clientId: null, category: 'Documentação' },
  { id: '4', name: 'Template Relatório Anual NIS', type: 'XLSX', size: '320 KB', uploadDate: '2026-02-15', clientId: null, category: 'Templates' },
];

export const mockRequests = [
  { id: '1', title: 'Solicitação de PenTest Adicional', description: 'Necessidade de realizar um teste de intrusão adicional ao novo servidor de produção.', status: 'in-progress', date: '2026-03-12', clientId: '3' },
  { id: '2', title: 'Esclarecimento sobre Relatório Q1', description: 'Algumas secções do relatório Q1 necessitam de esclarecimento adicional.', status: 'completed', date: '2026-03-08', clientId: '3' },
  { id: '3', title: 'Submissão de Dados de Ativos', description: 'Envio da lista atualizada de ativos de TI para reavaliação de conformidade.', status: 'completed', date: '2026-03-05', clientId: '3' },
];

export const mockTickets = [
  {
    id: 't1', clientId: '3', clientName: 'Carlos Oliveira',
    title: 'Problema de acesso ao portal', category: 'technical', priority: 'high',
    status: 'in-progress', assignedTo: 'João Silva',
    comments: [
      { id: 'c1', author: 'Carlos Oliveira', isAdmin: false, text: 'Não consigo aceder ao portal desde ontem. Aparece erro 403.', date: '2026-03-15T09:00:00' },
      { id: 'c2', author: 'João Silva', isAdmin: true, text: 'Obrigado pelo contacto. Estamos a investigar o problema. Pode tentar limpar o cache do browser?', date: '2026-03-15T10:30:00' },
    ],
  },
  {
    id: 't2', clientId: '3', clientName: 'Carlos Oliveira',
    title: 'Solicitação de relatório adicional', category: 'service', priority: 'medium',
    status: 'open', assignedTo: 'Maria Santos',
    comments: [
      { id: 'c3', author: 'Carlos Oliveira', isAdmin: false, text: 'Precisamos de um relatório executivo adicional para apresentar ao conselho.', date: '2026-03-14T14:00:00' },
    ],
  },
  {
    id: 't3', clientId: '3', clientName: 'Carlos Oliveira',
    title: 'Incidente de segurança detectado', category: 'security', priority: 'urgent',
    status: 'resolved', assignedTo: 'João Silva',
    comments: [
      { id: 'c4', author: 'Carlos Oliveira', isAdmin: false, text: 'Detetámos atividade suspeita nos logs do servidor.', date: '2026-03-10T08:00:00' },
      { id: 'c5', author: 'João Silva', isAdmin: true, text: 'Analisámos os logs. Trata-se de uma tentativa de brute-force que foi bloqueada. Recomendamos ativar 2FA.', date: '2026-03-10T11:00:00' },
      { id: 'c6', author: 'Carlos Oliveira', isAdmin: false, text: 'Perfeito, obrigado pela rápida resposta!', date: '2026-03-10T11:30:00' },
    ],
  },
];

export const mockAnnualServices = [
  { id: 'as1', clientName: 'Tech Solutions Lda.', serviceType: 'nis-compliance', serviceName: 'Relatório Anual NIS2 - 2026', status: 'completed', progress: 100, assignedTo: 'Maria Santos', notes: '' },
  { id: 'as2', clientName: 'Startup Inovação SA', serviceType: 'pentest', serviceName: 'PenTest Trimestral Q2', status: 'in-progress', progress: 45, assignedTo: 'João Silva', notes: 'A decorrer testes de perímetro externo.' },
  { id: 'as3', clientName: 'Banco Digital SA', serviceType: 'nis-compliance', serviceName: 'Auditoria NIS2 Anual', status: 'overdue', progress: 60, assignedTo: 'Maria Santos', notes: 'Cliente atrasou envio de documentação.' },
  { id: 'as4', clientName: 'Hospital Central', serviceType: 'maturity-assessment', serviceName: 'Avaliação de Maturidade 2026', status: 'in-progress', progress: 25, assignedTo: 'Pedro Alves', notes: '' },
  { id: 'as5', clientName: 'Energia Verde PT', serviceType: 'training', serviceName: 'Formação Equipa TI', status: 'pending', progress: 0, assignedTo: 'Ana Costa', notes: 'Aguarda confirmação de datas.' },
];

export const mockAuditLog = [
  { id: 'a1', action: 'Login realizado com sucesso', category: 'auth', severity: 'info', user: 'admin@ciryx.pt', ip: '192.168.1.1', timestamp: '2026-03-15T14:32:00' },
  { id: 'a2', action: 'Documento enviado: Relatório PenTest Q1', category: 'document', severity: 'info', user: 'admin@ciryx.pt', ip: '192.168.1.1', timestamp: '2026-03-15T14:15:00' },
  { id: 'a3', action: 'Tentativa de acesso não autorizado bloqueada', category: 'security', severity: 'critical', user: 'unknown', ip: '203.0.113.45', timestamp: '2026-03-15T13:45:00' },
  { id: 'a4', action: 'Ticket t1 atualizado para "in-progress"', category: 'ticket', severity: 'info', user: 'manager@ciryx.pt', ip: '192.168.1.2', timestamp: '2026-03-15T10:30:00' },
  { id: 'a5', action: 'Utilizador carlos@empresa.pt criado', category: 'user', severity: 'warning', user: 'admin@ciryx.pt', ip: '192.168.1.1', timestamp: '2026-03-14T16:00:00' },
  { id: 'a6', action: 'Artigo publicado: NIS2 Directive', category: 'content', severity: 'info', user: 'admin@ciryx.pt', ip: '192.168.1.1', timestamp: '2026-03-14T11:00:00' },
  { id: 'a7', action: 'Login falhado — palavra-passe incorreta', category: 'auth', severity: 'warning', user: 'unknown@test.com', ip: '198.51.100.8', timestamp: '2026-03-13T09:15:00' },
  { id: 'a8', action: 'Serviço anual as3 marcado como overdue', category: 'service', severity: 'warning', user: 'system', ip: 'localhost', timestamp: '2026-03-12T00:00:00' },
  { id: 'a9', action: 'Ticket t3 resolvido', category: 'ticket', severity: 'info', user: 'manager@ciryx.pt', ip: '192.168.1.2', timestamp: '2026-03-10T11:00:00' },
  { id: 'a10', action: 'Configuração de 2FA atualizada', category: 'security', severity: 'info', user: 'admin@ciryx.pt', ip: '192.168.1.1', timestamp: '2026-03-09T15:00:00' },
];

export const twoFAWords = {
  'admin@ciryx.pt': ['segurança', 'firewall', 'cifra'],
  'manager@ciryx.pt': ['proteção', 'ameaça', 'escudo'],
  'cliente@empresa.pt': ['privacidade', 'código', 'autenticação'],
};

export const mockClients = [
  {
    id: '3',
    name: 'Carlos Oliveira',
    email: 'cliente@empresa.pt',
    phone: '+351 912 345 678',
    company: 'Empresa ABC, Lda.',
    role: 'client',
    active: true,
    sector: 'Indústria',
    createdAt: '2025-12-01',
    securityContact: { name: 'Ana Pereira', email: 'ana.pereira@empresa.pt', phone: '+351 913 456 789' },
    permanentContact: { name: 'Rui Santos', email: 'rui.santos@empresa.pt', phone: '+351 914 567 890' },
  },
  {
    id: '4',
    name: 'Sofia Pinto',
    email: 'sofia@techsolutions.pt',
    phone: '+351 965 123 456',
    company: 'Tech Solutions Lda.',
    role: 'client',
    active: true,
    sector: 'Tecnologia',
    createdAt: '2026-01-15',
    securityContact: { name: 'Manuel Carvalho', email: 'manuel.carvalho@techsolutions.pt', phone: '+351 966 234 567' },
    permanentContact: { name: 'Isabel Fonseca', email: 'isabel.fonseca@techsolutions.pt', phone: '+351 967 345 678' },
  },
  {
    id: '5',
    name: 'Pedro Nunes',
    email: 'pedro@hospitalnorte.pt',
    phone: '+351 934 987 654',
    company: 'Hospital Norte',
    role: 'client',
    active: false,
    sector: 'Saúde',
    createdAt: '2026-02-20',
    securityContact: { name: 'Catarina Matos', email: 'catarina.matos@hospitalnorte.pt', phone: '+351 935 098 765' },
    permanentContact: { name: 'Jorge Lima', email: 'jorge.lima@hospitalnorte.pt', phone: '+351 936 109 876' },
  },
];

export const mockRiskAssessment = {
  '3': {
    score: 72,
    level: 'Médio',
    lastUpdated: '2026-03-01',
    findings: [
      { id: 'f1', category: 'Gestão de Acessos', severity: 'high', description: 'Ausência de autenticação multifator em sistemas críticos', status: 'open' },
      { id: 'f2', category: 'Gestão de Patches', severity: 'medium', description: 'Sistemas operativos desatualizados em 3 servidores', status: 'in-progress' },
      { id: 'f3', category: 'Backup e Recuperação', severity: 'low', description: 'Política de backup não documentada formalmente', status: 'resolved' },
      { id: 'f4', category: 'Formação', severity: 'medium', description: 'Colaboradores sem formação em phishing nos últimos 12 meses', status: 'open' },
    ],
    controls: [
      { name: 'Política de Segurança', score: 65 },
      { name: 'Gestão de Riscos', score: 55 },
      { name: 'Controlo de Acessos', score: 40 },
      { name: 'Criptografia', score: 80 },
      { name: 'Continuidade de Negócio', score: 70 },
      { name: 'Gestão de Incidentes', score: 85 },
    ],
  },
  '4': {
    score: 88,
    level: 'Baixo',
    lastUpdated: '2026-02-15',
    findings: [
      { id: 'f5', category: 'Gestão de Acessos', severity: 'low', description: 'Contas de serviço com permissões excessivas', status: 'in-progress' },
      { id: 'f6', category: 'Monitorização', severity: 'medium', description: 'SIEM sem alertas para acesso fora de horas', status: 'open' },
    ],
    controls: [
      { name: 'Política de Segurança', score: 90 },
      { name: 'Gestão de Riscos', score: 85 },
      { name: 'Controlo de Acessos', score: 75 },
      { name: 'Criptografia', score: 95 },
      { name: 'Continuidade de Negócio', score: 88 },
      { name: 'Gestão de Incidentes', score: 92 },
    ],
  },
};

export const mockAtivos = {
  '3': [
    { id: 'a1', nome: 'Servidor Web Principal', tipo: 'Servidor', ip: '10.0.0.1', so: 'Ubuntu 22.04', criticidade: 'crítico', estado: 'ativo', dataRegisto: '2026-01-10' },
    { id: 'a2', nome: 'Base de Dados MySQL', tipo: 'Base de Dados', ip: '10.0.0.2', so: 'CentOS 8', criticidade: 'crítico', estado: 'ativo', dataRegisto: '2026-01-10' },
    { id: 'a3', nome: 'Router Cisco ISR 4000', tipo: 'Rede', ip: '192.168.1.1', so: 'Cisco IOS 16.9', criticidade: 'alto', estado: 'ativo', dataRegisto: '2026-01-12' },
    { id: 'a4', nome: 'Estação de Trabalho — RH', tipo: 'Workstation', ip: '192.168.1.50', so: 'Windows 11 Pro', criticidade: 'médio', estado: 'ativo', dataRegisto: '2026-02-01' },
    { id: 'a5', nome: 'NAS de Backup', tipo: 'Armazenamento', ip: '10.0.0.10', so: 'Synology DSM 7', criticidade: 'alto', estado: 'ativo', dataRegisto: '2026-02-15' },
  ],
  '4': [
    { id: 'a6', nome: 'Cluster Kubernetes', tipo: 'Servidor', ip: '10.1.0.0/24', so: 'Ubuntu 24.04', criticidade: 'crítico', estado: 'ativo', dataRegisto: '2026-01-05' },
    { id: 'a7', nome: 'PostgreSQL Principal', tipo: 'Base de Dados', ip: '10.1.0.5', so: 'Debian 12', criticidade: 'crítico', estado: 'ativo', dataRegisto: '2026-01-05' },
  ],
};

export const mockIncidentes = {
  '3': [
    { id: 'i1', titulo: 'Tentativa de Phishing', tipo: 'Phishing', data: '2026-02-15', severidade: 'high', estado: 'resolvido', descricao: 'Email fraudulento recebido por 3 colaboradores. Nenhum utilizador clicou no link.', acoes: 'Bloqueio do remetente, alerta enviado a todos os colaboradores.' },
    { id: 'i2', titulo: 'Brute Force SSH', tipo: 'Acesso não autorizado', data: '2026-03-10', severidade: 'critical', estado: 'resolvido', descricao: 'Múltiplas tentativas de login falhadas no servidor web via SSH.', acoes: 'IP bloqueado via fail2ban, 2FA ativado.' },
    { id: 'i3', titulo: 'Vulnerabilidade OpenSSL', tipo: 'Vulnerabilidade', data: '2026-03-20', severidade: 'medium', estado: 'em-progresso', descricao: 'Detetada versão desatualizada de OpenSSL com CVE-2024-0727.', acoes: 'Patch em curso, downtime agendado.' },
  ],
  '4': [
    { id: 'i4', titulo: 'Acesso suspeito fora de horas', tipo: 'Acesso não autorizado', data: '2026-03-01', severidade: 'medium', estado: 'resolvido', descricao: 'Login detetado às 03h00 de IP não reconhecido.', acoes: 'Sessão terminada, password resetada, utilizador notificado.' },
  ],
};

export const mockPenTests = {
  '3': [
    { id: 'p1', titulo: 'PenTest Externo Q1 2026', tipo: 'Externo', data: '2026-01-20', resultado: 'Médio', ficheiro: 'pentest_q1_2026.pdf', consultor: 'Eng. Ana Costa', critico: 2, alto: 5, medio: 8, baixo: 12 },
    { id: 'p2', titulo: 'PenTest Aplicação Web', tipo: 'Web Application', data: '2025-11-10', resultado: 'Alto', ficheiro: 'pentest_webapp_2025.pdf', consultor: 'Eng. Rui Martins', critico: 4, alto: 7, medio: 3, baixo: 6 },
  ],
  '4': [
    { id: 'p3', titulo: 'PenTest Infra Cloud AWS', tipo: 'Cloud', data: '2026-02-05', resultado: 'Baixo', ficheiro: 'pentest_cloud_2026.pdf', consultor: 'Eng. Ana Costa', critico: 0, alto: 2, medio: 5, baixo: 9 },
  ],
};
