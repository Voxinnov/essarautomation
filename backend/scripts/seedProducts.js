require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Brand, Category, Product, sequelize } = require('../models');
const productsData = require('./products_seed.json');

const seedProducts = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        // Sync models
        await sequelize.sync({ alter: true });
        console.log('Database synced successfully.');

        for (const brandData of productsData) {
            // Find or create Brand
            const [brand] = await Brand.findOrCreate({
                where: { name: brandData.brand },
                defaults: { description: `${brandData.brand} brand products` }
            });

            // Find or create Category
            const [category] = await Category.findOrCreate({
                where: { name: brandData.category },
                defaults: { description: `${brandData.category} category` }
            });

            for (const prod of brandData.products) {
                await Product.findOrCreate({
                    where: { product_code: prod.product_code },
                    defaults: {
                        name: prod.name,
                        hsn_code: prod.hsn_code,
                        size: prod.size,
                        units_per_box: prod.units_per_box,
                        mrp: prod.mrp || 0,
                        ptr: prod.ptr || 0,
                        pts: prod.pts || 0,
                        ptd: prod.ptd || 0,
                        tax_rate: prod.tax_rate,
                        brand_id: brand.id,
                        category_id: category.id,
                        current_stock: 0,
                        reorder_level: 10,
                        status: 'ACTIVE'
                    }
                });
            }
        }

        console.log('✅ Products seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding products:', error);
        process.exit(1);
    }
};

seedProducts();
