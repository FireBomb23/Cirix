const { Service, ServiceFeature } = require('../models');

const INCLUDE_FEATURES = [
  { model: ServiceFeature, as: 'features', attributes: ['id', 'feature', 'sort_order'] },
];

// GET /services  (com as features de cada servico)
exports.service_list = async (req, res) => {
  try {
    const servicos = await Service.findAll({
      include: INCLUDE_FEATURES,
      order: [['sort_order', 'ASC'], ['id', 'ASC'], [{ model: ServiceFeature, as: 'features' }, 'sort_order', 'ASC']],
    });
    res.json(servicos);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// GET /services/:id
exports.service_detail = async (req, res) => {
  try {
    const servico = await Service.findByPk(req.params.id, { include: INCLUDE_FEATURES });
    if (!servico) return res.status(404).json({ error: 'Servico nao encontrado' });
    res.json(servico);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /services/create
exports.service_create = async (req, res) => {
  try {
    const { title, description, icon, active, sort_order, features } = req.body;
    const novo = await Service.create({ title, description, icon, active, sort_order });
    if (Array.isArray(features)) {
      await Promise.all(features.map((f, i) =>
        ServiceFeature.create({ service_id: novo.id, feature: typeof f === 'string' ? f : f.feature, sort_order: i })
      ));
    }
    const completo = await Service.findByPk(novo.id, { include: INCLUDE_FEATURES });
    res.status(201).json(completo);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// PUT /services/update/:id
exports.service_update = async (req, res) => {
  try {
    const servico = await Service.findByPk(req.params.id);
    if (!servico) return res.status(404).json({ error: 'Servico nao encontrado' });
    const { title, description, icon, active, sort_order } = req.body;
    await servico.update({ title, description, icon, active, sort_order });
    res.json(servico);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// DELETE /services/delete/:id
exports.service_delete = async (req, res) => {
  try {
    const servico = await Service.findByPk(req.params.id);
    if (!servico) return res.status(404).json({ error: 'Servico nao encontrado' });
    await servico.destroy(); // features sao removidas em cascata (ON DELETE CASCADE)
    res.json({ status: 'success', message: 'Servico eliminado' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
