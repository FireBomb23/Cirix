const { AuditLog } = require('../models');

// IP do cliente (atras de proxy usa o primeiro X-Forwarded-For)
function clientIp(req) {
  const fwd = req.headers && req.headers['x-forwarded-for'];
  return (fwd ? String(fwd).split(',')[0].trim() : (req.socket && req.socket.remoteAddress)) || null;
}

// Regista um evento no log de auditoria. Nunca rebenta a operacao principal.
async function recordAudit(req, { action, category, severity = 'info', user_id, user_email }) {
  try {
    await AuditLog.create({
      action,
      category,
      severity,
      user_id: user_id !== undefined ? user_id : (req.user ? req.user.id : null),
      user_email: user_email !== undefined ? user_email : (req.user ? req.user.email : null),
      ip_address: clientIp(req),
    });
  } catch (e) {
    // ignora erros de auditoria
  }
}

module.exports = { recordAudit, clientIp };
