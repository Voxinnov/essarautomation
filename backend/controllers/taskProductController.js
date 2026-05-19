const { TaskProduct, Product, StockTransaction, Task, sequelize } = require('../models');

exports.addTaskProduct = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { task_id } = req.params;
        const { product_id, quantity_required } = req.body;

        const task = await Task.findByPk(task_id);
        const product = await Product.findByPk(product_id);

        if (!task || !product) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Task or Product not found' });
        }

        const required = parseInt(quantity_required);
        const fulfilled = Math.min(required, product.current_stock);
        const status = fulfilled >= required ? 'fulfilled' : 'backordered';

        const taskProduct = await TaskProduct.create({
            task_id,
            product_id,
            quantity_required: required,
            quantity_fulfilled: fulfilled,
            status
        }, { transaction: t });

        if (fulfilled > 0) {
            await product.update({ current_stock: product.current_stock - fulfilled }, { transaction: t });
            await StockTransaction.create({
                product_id,
                type: 'OUT',
                quantity: fulfilled,
                reference_id: taskProduct.id.toString(),
                reference_type: 'TASK_PRODUCT',
                notes: `Fulfilled for Task #${task_id}`,
                user_id: req.user.id
            }, { transaction: t });
        }

        await t.commit();
        res.status(201).json({ success: true, data: taskProduct });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTaskProducts = async (req, res) => {
    try {
        const { task_id } = req.params;
        const products = await TaskProduct.findAll({
            where: { task_id },
            include: [{ model: Product, as: 'product' }]
        });
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.resolveBackorders = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const backorders = await TaskProduct.findAll({
            where: { status: 'backordered' },
            include: [{ model: Product, as: 'product' }],
            order: [['createdAt', 'ASC']]
        });

        const resolved = [];

        for (const bo of backorders) {
            const product = await Product.findByPk(bo.product_id, { transaction: t });
            const remainingNeeded = bo.quantity_required - bo.quantity_fulfilled;

            if (remainingNeeded > 0 && product.current_stock > 0) {
                const canFulfill = Math.min(remainingNeeded, product.current_stock);
                
                await product.update({ current_stock: product.current_stock - canFulfill }, { transaction: t });
                
                const newFulfilled = bo.quantity_fulfilled + canFulfill;
                const newStatus = newFulfilled >= bo.quantity_required ? 'fulfilled' : 'backordered';
                
                await bo.update({
                    quantity_fulfilled: newFulfilled,
                    status: newStatus
                }, { transaction: t });

                await StockTransaction.create({
                    product_id: product.id,
                    type: 'OUT',
                    quantity: canFulfill,
                    reference_id: bo.id.toString(),
                    reference_type: 'BACKORDER_RESOLUTION',
                    notes: `Resolved backorder for Task #${bo.task_id}`,
                    user_id: req.user.id
                }, { transaction: t });

                resolved.push(bo);
            }
        }

        await t.commit();
        res.status(200).json({ success: true, message: `Resolved ${resolved.length} backorders`, data: resolved });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllBackorders = async (req, res) => {
    try {
        const backorders = await TaskProduct.findAll({
            where: { status: 'backordered' },
            include: [
                { model: Product, as: 'product' },
                { model: Task, as: 'task', attributes: ['id', 'title'] }
            ]
        });
        res.status(200).json({ success: true, data: backorders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
