const prisma = require('../config/prisma');
const HttpError = require('../utils/httpError');

exports.list = async (_req, res, next) => {
  try {
    const cats = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: cats.map((c) => ({ id: c.id, name: c.name, icon: c.icon, count: c._count.products }))
    });
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    const name = String(req.body?.name || '').trim();
    const icon = String(req.body?.icon || '📦').trim() || '📦';
    if (!name) throw new HttpError(400, 'Category name is required');

    const created = await prisma.category.create({ data: { name, icon } });
    res.status(201).json({ success: true, data: { ...created, count: 0 } });
  } catch (e) {
    next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = +req.params.id;
    const payload = {};
    if (typeof req.body?.name === 'string') payload.name = req.body.name.trim();
    if (typeof req.body?.icon === 'string') payload.icon = req.body.icon.trim() || '📦';
    if (payload.name === '') throw new HttpError(400, 'Category name cannot be empty');

    const updated = await prisma.category.update({
      where: { id },
      data: payload,
      include: { _count: { select: { products: true } } }
    });

    res.json({
      success: true,
      data: { id: updated.id, name: updated.name, icon: updated.icon, count: updated._count.products }
    });
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = +req.params.id;
    const count = await prisma.product.count({ where: { categoryId: id } });
    if (count > 0) throw new HttpError(400, 'Cannot delete category with existing products');
    await prisma.category.delete({ where: { id } });
    res.json({ success: true, message: 'Category deleted' });
  } catch (e) {
    next(e);
  }
};
