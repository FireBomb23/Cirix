const { User } = require('../models');

// Devolve a cláusula "where" de filtragem por perfil:
//  - admin   -> {}                      (vê tudo)
//  - cliente -> { client_id: <id> }     (só os seus)
//  - gestor  -> { client_id: [ids] }    (só os clientes que lhe estão atribuídos)
async function scopeWhere(req, field = 'client_id') {
  if (!req.user || req.user.role === 'admin') return {};
  if (req.user.role === 'client') return { [field]: req.user.id };
  // gestor: ids dos clientes com manager_id = este gestor
  const clientes = await User.findAll({
    where: { role: 'client', manager_id: req.user.id },
    attributes: ['id'],
  });
  return { [field]: clientes.map((c) => c.id) };
}

// Lista de ids de clientes de um gestor (ou null se admin = todos)
async function managerClientIds(req) {
  if (!req.user || req.user.role === 'admin') return null;
  if (req.user.role === 'client') return [req.user.id];
  const clientes = await User.findAll({
    where: { role: 'client', manager_id: req.user.id },
    attributes: ['id'],
  });
  return clientes.map((c) => c.id);
}

// Igual a scopeWhere, mas respeita o filtro ?client_id (ex.: ficha de um cliente),
// restringindo-o sempre aos clientes permitidos (um gestor não pode espreitar outros).
async function scopeWhereClient(req, field = 'client_id') {
  const ids = await managerClientIds(req); // null = admin (tudo)
  const q = req.query && req.query.client_id;
  if (ids === null) return q ? { [field]: q } : {};
  if (q && ids.map(String).includes(String(q))) return { [field]: q };
  return { [field]: ids };
}

// Um utilizador pode aceder a um recurso deste cliente?
//  - admin  -> sempre
//  - recurso global (clientId null) -> sempre
//  - cliente -> só o seu
//  - gestor  -> só clientes que lhe estão atribuídos
async function canAccessClient(req, clientId) {
  if (!req.user) return false;
  if (req.user.role === 'admin') return true;
  if (clientId == null) return true;
  if (req.user.role === 'client') return String(clientId) === String(req.user.id);
  const ids = await managerClientIds(req);
  return ids.map(String).includes(String(clientId));
}

module.exports = { scopeWhere, scopeWhereClient, managerClientIds, canAccessClient };
