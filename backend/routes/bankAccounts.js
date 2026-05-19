const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const bankAccountController = require('../controllers/bankAccountController');
const { protect } = require('../middleware/auth');

// Setup multer for QR code upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, 'qr-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.use(protect);

router.get('/', bankAccountController.getAllBankAccounts);
router.get('/:id', bankAccountController.getBankAccountById);
router.post('/', upload.single('qr_code'), bankAccountController.createBankAccount);
router.put('/:id', upload.single('qr_code'), bankAccountController.updateBankAccount);
router.delete('/:id', bankAccountController.deleteBankAccount);

module.exports = router;
