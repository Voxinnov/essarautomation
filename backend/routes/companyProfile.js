const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getCompanyProfile, updateCompanyProfile } = require('../controllers/companyProfileController');
const { protect } = require('../middleware/auth');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, 'logo-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.use(protect);

router.get('/', getCompanyProfile);
router.put('/', upload.single('logo'), updateCompanyProfile);

module.exports = router;
