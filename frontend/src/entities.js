// Descricao declarativa de cada entidade. As paginas de listagem e de
// formulario sao genericas e leem esta configuracao, evitando repetir codigo.
//
// Tipos de campo suportados no formulario:
//   text | email | password | number | date | datetime-local | select | ref
//   - select: usa "options" (lista fixa)
//   - ref: carrega opcoes a partir de outro endpoint (refEndpoint/refLabel)

export const entities = {
  utilizadores: {
    label: 'Utilizadores',
    singular: 'Utilizador',
    endpoint: '/utilizadores',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'nome', label: 'Nome' },
      { key: 'email', label: 'Email' },
      { key: 'perfil', label: 'Perfil' },
    ],
    fields: [
      { name: 'nome', label: 'Nome', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true },
      { name: 'perfil', label: 'Perfil', type: 'select', options: ['Administrador', 'Colaborador', 'Cliente'] },
    ],
  },

  clientes: {
    label: 'Clientes',
    singular: 'Cliente',
    endpoint: '/clientes',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'nome', label: 'Nome' },
      { key: 'estado_nis2', label: 'Estado NIS2' },
    ],
    fields: [
      { name: 'nome', label: 'Nome', type: 'text', required: true },
      { name: 'estado_nis2', label: 'Estado NIS2', type: 'select', options: ['Conforme', 'Nao Conforme', 'Em Avaliacao'] },
    ],
  },

  incidentes: {
    label: 'Incidentes',
    singular: 'Incidente',
    endpoint: '/incidentes',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'cliente', label: 'Cliente', render: (row) => (row.cliente ? row.cliente.nome : row.cliente_id) },
      { key: 'severidade', label: 'Severidade' },
      { key: 'estado', label: 'Estado' },
      { key: 'descricao', label: 'Descricao' },
    ],
    fields: [
      { name: 'cliente_id', label: 'Cliente', type: 'ref', required: true, refEndpoint: '/clientes', refLabel: 'nome' },
      { name: 'descricao', label: 'Descricao', type: 'text' },
      { name: 'severidade', label: 'Severidade', type: 'select', options: ['Baixa', 'Media', 'Alta', 'Critica'] },
      { name: 'estado', label: 'Estado', type: 'select', options: ['Aberto', 'Em Investigacao', 'Resolvido'] },
      { name: 'data_ocorrencia', label: 'Data de ocorrencia', type: 'datetime-local' },
    ],
  },

  tickets: {
    label: 'Tickets',
    singular: 'Ticket',
    endpoint: '/tickets',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'assunto', label: 'Assunto' },
      { key: 'estado', label: 'Estado' },
      { key: 'data_criacao', label: 'Criado em' },
      { key: 'data_resolucao', label: 'Resolvido em' },
    ],
    fields: [
      { name: 'assunto', label: 'Assunto', type: 'text', required: true },
      { name: 'estado', label: 'Estado', type: 'select', options: ['Aberto', 'Em Curso', 'Resolvido', 'Fechado'] },
      { name: 'data_criacao', label: 'Data de criacao', type: 'datetime-local' },
      { name: 'data_resolucao', label: 'Data de resolucao', type: 'datetime-local' },
    ],
  },
};

export const entityKeys = Object.keys(entities);
