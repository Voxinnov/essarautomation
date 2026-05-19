const { Product, Brand, Category, StockTransaction, User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [
                { model: Brand, as: 'brand' },
                { model: Category, as: 'category' }
            ],
            order: [['name', 'ASC']]
        });
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getBrands = async (req, res) => {
    try {
        const brands = await Brand.findAll({ order: [['name', 'ASC']] });
        res.status(200).json({ success: true, data: brands });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({ order: [['name', 'ASC']] });
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createTransaction = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { product_id, type, quantity, reference_id, reference_type, notes } = req.body;

        const product = await Product.findByPk(product_id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        let newStock = product.current_stock;
        const qty = parseInt(quantity);

        if (type === 'IN') {
            newStock += qty;
        } else if (type === 'OUT') {
            if (product.current_stock < qty) {
                return res.status(400).json({ success: false, message: 'Insufficient stock' });
            }
            newStock -= qty;
        } else if (type === 'ADJUSTMENT') {
            newStock = qty; 
        }

        await product.update({ current_stock: newStock }, { transaction: t });

        await StockTransaction.create({
            product_id,
            type,
            quantity: qty,
            reference_id,
            reference_type,
            notes,
            user_id: req.user.id
        }, { transaction: t });

        await t.commit();
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { name, product_code, hsn_code, brand_name, category_name, units_per_box, mrp, ptr, tax_rate, reorder_level } = req.body;

        // Find or create Brand
        const [brand] = await Brand.findOrCreate({
            where: { name: brand_name },
            defaults: { description: `${brand_name} brand products` }
        });

        // Find or create Category
        const [category] = await Category.findOrCreate({
            where: { name: category_name },
            defaults: { description: `${category_name} category` }
        });

        const product = await Product.create({
            name,
            product_code,
            hsn_code,
            brand_id: brand.id,
            category_id: category.id,
            units_per_box,
            mrp: mrp || 0,
            ptr: ptr || 0,
            tax_rate: tax_rate || 5,
            reorder_level: reorder_level || 10,
            current_stock: 0,
            status: 'ACTIVE'
        });

        res.status(201).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getDashboard = async (req, res) => {
    try {
        const lowStock = await Product.findAll({
            where: {
                current_stock: { [Op.lte]: sequelize.col('reorder_level') }
            },
            include: [
                { model: Brand, as: 'brand' },
                { model: Category, as: 'category' }
            ]
        });

        const recentTransactions = await StockTransaction.findAll({
            limit: 20,
            order: [['created_at', 'DESC']],
            include: [
                { model: Product, as: 'product' },
                { model: User, as: 'user', attributes: ['name'] }
            ]
        });

        const totalProducts = await Product.count();

        res.status(200).json({
            success: true,
            data: {
                totalProducts,
                lowStock,
                recentTransactions
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        await product.destroy();
        res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const transactions = await StockTransaction.findAll({
            include: [
                { model: Product, as: 'product' },
                { model: User, as: 'user', attributes: ['name', 'email'] }
            ],
            order: [['created_at', 'DESC']]
        });
        res.status(200).json({ success: true, data: transactions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
