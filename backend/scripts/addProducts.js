require('dotenv').config();
const sequelize = require('../config/database');
const { Product, Brand, Category } = require('../models');

const brandName = "NoWound";
const categoryName = "VAC DRESSING (NPWT)";
const productsList = [
    { name: "NPWT Dressing Kit - Small", product_code: "NOW-NPWT-S" },
    { name: "NPWT Dressing Kit - Medium", product_code: "NOW-NPWT-M" },
    { name: "NPWT Dressing Kit - Large", product_code: "NOW-NPWT-L" },
    { name: "NPWT Canister 600 ML", product_code: "NOW-NPWT-C600" }
];

async function addProducts() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Find or create Brand
        const [brand] = await Brand.findOrCreate({
            where: { name: brandName },
            defaults: { description: `${brandName} brand products` }
        });

        // Find or create Category
        const [category] = await Category.findOrCreate({
            where: { name: categoryName },
            defaults: { description: `${categoryName} category` }
        });

        // Add products
        let count = 0;
        for (const pd of productsList) {
            const [product, created] = await Product.findOrCreate({
                where: { product_code: pd.product_code },
                defaults: {
                    name: pd.name,
                    brand_id: brand.id,
                    category_id: category.id,
                    current_stock: 0,
                    status: 'ACTIVE'
                }
            });
            if (created) count++;
        }

        console.log(`Successfully added ${count} products.`);
    } catch (error) {
        console.error('Error adding products:', error);
    } finally {
        await sequelize.close();
    }
}

addProducts();
