const { CompanyProfile } = require('../models');

exports.getCompanyProfile = async (req, res) => {
    try {
        let profile = await CompanyProfile.findOne();
        if (!profile) {
            profile = await CompanyProfile.create({
                company_name: '',
                country: '',
                city: '',
                pin_code: '',
                email: '',
                phone: '',
                service_tax_no: '',
                tax_inclusive_rates: false,
                default_currency: 'INR',
                state: '',
                address_line_1: '',
                address_line_2: '',
                website: '',
                taxation_type: '',
                contact_name: ''
            });
        }
        res.status(200).json({ success: true, data: profile });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateCompanyProfile = async (req, res) => {
    try {
        let profile = await CompanyProfile.findOne();
        if (!profile) {
            profile = await CompanyProfile.create({});
        }

        const {
            company_name, country, city, pin_code, email, phone,
            service_tax_no, tax_inclusive_rates, default_currency,
            state, address_line_1, address_line_2, website,
            taxation_type, contact_name
        } = req.body;

        const updateData = {
            company_name, country, city, pin_code, email, phone,
            service_tax_no, 
            tax_inclusive_rates: tax_inclusive_rates === 'true' || tax_inclusive_rates === true,
            default_currency, state, address_line_1, address_line_2,
            website, taxation_type, contact_name
        };

        if (req.file) {
            updateData.logo = req.file.filename;
        }

        await profile.update(updateData);
        res.status(200).json({ success: true, data: profile, message: 'Company Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
