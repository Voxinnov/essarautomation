const { BankAccount } = require('../models');

exports.getAllBankAccounts = async (req, res) => {
    try {
        const bankAccounts = await BankAccount.findAll();
        res.json({ success: true, data: bankAccounts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getBankAccountById = async (req, res) => {
    try {
        const bankAccount = await BankAccount.findByPk(req.params.id);
        if (!bankAccount) {
            return res.status(404).json({ success: false, message: 'Bank account not found' });
        }
        res.json({ success: true, data: bankAccount });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createBankAccount = async (req, res) => {
    try {
        const { bank_name, account_name, account_number, ifsc_code, branch, upi_id, is_active } = req.body;
        let qr_code = null;
        if (req.file) {
            qr_code = req.file.filename;
        }

        const bankAccount = await BankAccount.create({
            bank_name,
            account_name,
            account_number,
            ifsc_code,
            branch,
            upi_id,
            qr_code,
            is_active: is_active === 'true' || is_active === true
        });

        res.status(201).json({ success: true, data: bankAccount });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateBankAccount = async (req, res) => {
    try {
        const { bank_name, account_name, account_number, ifsc_code, branch, upi_id, is_active } = req.body;
        
        const bankAccount = await BankAccount.findByPk(req.params.id);
        if (!bankAccount) {
            return res.status(404).json({ success: false, message: 'Bank account not found' });
        }

        const updateData = {
            bank_name, account_name, account_number, ifsc_code, branch, upi_id,
            is_active: is_active === 'true' || is_active === true
        };

        if (req.file) {
            updateData.qr_code = req.file.filename;
        }

        await bankAccount.update(updateData);
        res.json({ success: true, data: bankAccount });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteBankAccount = async (req, res) => {
    try {
        const bankAccount = await BankAccount.findByPk(req.params.id);
        if (!bankAccount) {
            return res.status(404).json({ success: false, message: 'Bank account not found' });
        }
        await bankAccount.destroy();
        res.json({ success: true, message: 'Bank account deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
