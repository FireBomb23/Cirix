// Descricao declarativa de cada entidade (alinhada a database/schema.sql).
// As paginas de listagem e de formulario sao genericas e leem esta config.
//
// Tipos de campo: text | textarea | email | password | number | date |
//                 datetime-local | select | boolean | ref
//   - select: usa "options" (lista fixa)
//   - boolean: checkbox (true/false)
//   - ref: carrega opcoes de outro endpoint (refEndpoint/refLabel)

const nomeUtilizador = (u) => (u ? `${u.name}` : '-');

export const entities = {
  users: {
    label: 'Utilizadores',
    singular: 'Utilizador',
    endpoint: '/users',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Nome' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Perfil' },
      { key: 'company', label: 'Empresa' },
      { key: 'active', label: 'Ativo', render: (r) => (r.active ? 'Sim' : 'Nao') },
    ],
    fields: [
      { name: 'name', label: 'Nome', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'password_hash', label: 'Password', type: 'password', required: true, hint: 'Em edicao, deixa vazio para manter a atual' },
      { name: 'role', label: 'Perfil', type: 'select', required: true, options: ['admin', 'manager', 'client'] },
      { name: 'company', label: 'Empresa (so clientes)', type: 'text' },
      { name: 'active', label: 'Ativo', type: 'boolean' },
    ],
  },

  tickets: {
    label: 'Tickets',
    singular: 'Ticket',
    endpoint: '/tickets',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'title', label: 'Titulo' },
      { key: 'cliente', label: 'Cliente', render: (r) => nomeUtilizador(r.cliente) },
      { key: 'category', label: 'Categoria' },
      { key: 'priority', label: 'Prioridade' },
      { key: 'status', label: 'Estado' },
    ],
    fields: [
      { name: 'title', label: 'Titulo', type: 'text', required: true },
      { name: 'description', label: 'Descricao', type: 'textarea' },
      { name: 'client_id', label: 'Cliente', type: 'ref', required: true, refEndpoint: '/users', refLabel: 'name' },
      { name: 'category', label: 'Categoria', type: 'select', required: true, options: ['technical', 'general', 'incident', 'billing', 'other'] },
      { name: 'priority', label: 'Prioridade', type: 'select', options: ['low', 'medium', 'high', 'urgent'] },
      { name: 'status', label: 'Estado', type: 'select', options: ['open', 'in-progress', 'resolved', 'closed'] },
      { name: 'assigned_to', label: 'Atribuido a', type: 'ref', refEndpoint: '/users', refLabel: 'name' },
    ],
  },

  documents: {
    label: 'Documentos',
    singular: 'Documento',
    endpoint: '/documents',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Nome' },
      { key: 'file_type', label: 'Tipo' },
      { key: 'category', label: 'Categoria' },
      { key: 'visibility', label: 'Visibilidade' },
      { key: 'cliente', label: 'Cliente', render: (r) => nomeUtilizador(r.cliente) },
    ],
    fields: [
      { name: 'name', label: 'Nome', type: 'text', required: true },
      { name: 'file_type', label: 'Tipo de ficheiro', type: 'select', options: ['PDF', 'XLSX', 'DOCX', 'PNG', 'ZIP'] },
      { name: 'file_size', label: 'Tamanho', type: 'text' },
      { name: 'category', label: 'Categoria', type: 'text' },
      { name: 'visibility', label: 'Visibilidade', type: 'select', options: ['client', 'global'] },
      { name: 'client_id', label: 'Cliente', type: 'ref', refEndpoint: '/users', refLabel: 'name' },
      { name: 'uploaded_by', label: 'Submetido por', type: 'ref', refEndpoint: '/users', refLabel: 'name' },
    ],
  },

  'service-requests': {
    label: 'Pedidos',
    singular: 'Pedido',
    endpoint: '/service-requests',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'title', label: 'Titulo' },
      { key: 'cliente', label: 'Cliente', render: (r) => nomeUtilizador(r.cliente) },
      { key: 'status', label: 'Estado' },
      { key: 'request_date', label: 'Data do pedido' },
    ],
    fields: [
      { name: 'title', label: 'Titulo', type: 'text', required: true },
      { name: 'description', label: 'Descricao', type: 'textarea' },
      { name: 'client_id', label: 'Cliente', type: 'ref', required: true, refEndpoint: '/users', refLabel: 'name' },
      { name: 'status', label: 'Estado', type: 'select', options: ['pending', 'in-progress', 'completed', 'cancelled'] },
      { name: 'assigned_to', label: 'Atribuido a', type: 'ref', refEndpoint: '/users', refLabel: 'name' },
      { name: 'request_date', label: 'Data do pedido', type: 'date' },
    ],
  },
};

export const entityKeys = Object.keys(entities);
