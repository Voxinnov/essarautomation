import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box, Card, Typography, TextField, Button, Grid, IconButton,
    FormControl, Select, MenuItem, InputLabel, Chip, Radio, RadioGroup,
    FormControlLabel, Checkbox, InputAdornment, Alert, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Add, Delete, Send, AttachFile, Refresh, Info } from '@mui/icons-material';
import { proformaService, clientService, stockService, doctorService, hospitalService, authService, companyProfileService } from '../../services';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/constants';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const emptyItem = { product_id: '', quantity: 1, rate: 0, mrp: 0, hsn_code: '', amount: 0, max_stock: 0, tax_rate: 18 };
const emptyForm = {
    client_id: '',
    bank_account_id: '',
    invoice_number: '',
    invoice_prefix: 'EE',
    invoice_no: '',
    date: new Date().toISOString().split('T')[0],
    valid_until: '',
    terms: 'Due on Receipt',
    po_number: '',
    order_number: '',
    place_of_supply: '',
    branch: 'Head Office',
    gst_treatment: 'Consumer',
    status: 'Draft',
    items: [{ ...emptyItem }],
    sub_total: 0,
    shipping_charges: 0,
    cgst: 0,
    sgst: 0,
    discount: 0,
    discount_type: '%',
    tds_tcs: 'TDS',
    tds_tcs_tax: '',
    adjustment: 0,
    rounding: 0,
    grand_total: 0,
    customer_notes: 'THANK YOU FOR YOUR BUSINESS, YOUR TRUST, AND YOUR CONFIDENCE. IT IS OUR PLEASURE TO WORK WITH YOUR BUSINESS.',
    terms_conditions: '1. Payment terms: 100% Advance\n2. Validity: 15 days from the date of Proforma Invoice\n3. Delivery: Within 7 working days',
    payment_received: false,
    cgst_percent: 9,
    sgst_percent: 9,
    referred_by_hospital_id: '',
    referred_by_doctor_id: '',
    sales_person_id: '',
    created_by: '',
    shipping_address: ''
};

const TERMS_OPTIONS = ['Due on Receipt', 'Net 15', 'Net 30', 'Net 45', 'Net 60', 'Custom'];
const PLACE_OF_SUPPLY_OPTIONS = [
    '[KL] - Kerala', '[TN] - Tamil Nadu', '[KA] - Karnataka', '[MH] - Maharashtra',
    '[DL] - Delhi', '[GJ] - Gujarat', '[AP] - Andhra Pradesh', '[TS] - Telangana',
];

const NewProformaPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [companyAddress, setCompanyAddress] = useState('');
    const [error, setError] = useState('');

    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [salesPersons, setSalesPersons] = useState([]);
    const [shippingDialogOpen, setShippingDialogOpen] = useState(false);
    const [tempShippingAddress, setTempShippingAddress] = useState('');

    const handleOpenShippingDialog = () => {
        setTempShippingAddress(form.shipping_address || '');
        setShippingDialogOpen(true);
    };

    const handleSaveShippingAddress = () => {
        setForm(prev => ({ ...prev, shipping_address: tempShippingAddress }));
        setShippingDialogOpen(false);
    };

    const handleCopyBillingAddress = () => {
        if (selectedClient) {
            setTempShippingAddress(selectedClient.address || '');
        }
    };

    const calculateDueDate = (invoiceDateStr, terms) => {
        if (!invoiceDateStr) return '';
        const date = new Date(invoiceDateStr);
        if (isNaN(date.getTime())) return '';
        
        let daysToAdd = 0;
        if (terms === 'Net 15') daysToAdd = 15;
        else if (terms === 'Net 30') daysToAdd = 30;
        else if (terms === 'Net 45') daysToAdd = 45;
        else if (terms === 'Net 60') daysToAdd = 60;
        else if (terms === 'Due on Receipt') daysToAdd = 0;
        else return null;
        
        date.setDate(date.getDate() + daysToAdd);
        return date.toISOString().split('T')[0];
    };

    const handleGenerateInvoiceNumber = async (prefix) => {
        try {
            const currentPrefix = prefix || form.invoice_prefix || 'EE';
            const res = await proformaService.getAll();
            const items = res.data.data || [];
            
            let nextNo = 1000;
            const matchingInvoices = items.filter(inv => {
                const num = inv.invoice_number || '';
                return num.startsWith(`${currentPrefix}-`);
            });
            
            if (matchingInvoices.length > 0) {
                const latest = matchingInvoices[0];
                const latestNoStr = latest.invoice_no || latest.invoice_number?.split('-')[1] || '';
                const parsed = parseInt(latestNoStr.replace(/\D/g, ''));
                if (!isNaN(parsed)) {
                    nextNo = parsed + 1;
                }
            }
            
            setForm(prev => ({
                ...prev,
                invoice_prefix: currentPrefix,
                invoice_no: String(nextNo),
                invoice_number: `${currentPrefix}-${nextNo}`
            }));
        } catch (err) {
            console.error("Error generating proforma number", err);
        }
    };

    // Load dependencies
    useEffect(() => {
        setLoading(true);
        Promise.all([
            clientService.getAll({ limit: 1000 }),
            stockService.getProducts(),
            api.get('/bank-accounts'),
            hospitalService.getAll({ limit: 1000 }),
            doctorService.getAll({ limit: 1000 }),
            authService.getUsers(),
            companyProfileService.get()
        ]).then(async ([c, p, b, h, d, u, comp]) => {
            setClients(c.data.data || []);
            setProducts(p.data.data || []);
            setBankAccounts(b.data.data || []);
            setHospitals(h.data.data || []);
            setDoctors(d.data.data || []);
            setSalesPersons(u.data.data || []);
            if (comp.data?.data) {
                const profile = comp.data.data;
                const address = profile.address_line_1 
                    ? `${profile.address_line_1}${profile.address_line_2 ? `, ${profile.address_line_2}` : ''}, ${profile.city || ''}, ${profile.state || ''} - ${profile.pin_code || ''}`
                    : '2/214B, 1ST FLOOR, M.L.A. ROAD, PUTHIAKAVU, TRIPUNITHURA, ERNAKULAM, KERALA 682307';
                setCompanyAddress(address);
            }
            if (!id) {
                // Generate default number on load
                const currentPrefix = form.invoice_prefix || 'EE';
                let nextNo = 1000;
                const res = await proformaService.getAll();
                const recentProformas = res.data.data || [];
                const matchingInvoices = recentProformas.filter(inv => {
                    const num = inv.invoice_number || '';
                    return num.startsWith(`${currentPrefix}-`);
                });
                if (matchingInvoices.length > 0) {
                    const latest = matchingInvoices[0];
                    const latestNoStr = latest.invoice_no || latest.invoice_number?.split('-')[1] || '';
                    const parsed = parseInt(latestNoStr.replace(/\D/g, ''));
                    if (!isNaN(parsed)) nextNo = parsed + 1;
                }
                setForm(prev => ({
                    ...prev,
                    invoice_no: String(nextNo),
                    invoice_number: `${currentPrefix}-${nextNo}`
                }));
            }
        }).catch(err => {
            console.error("Error loading dependencies", err);
            setError("Failed to load dependency data");
        }).finally(() => {
            setLoading(false);
        });
    }, [id]);

    // Load proforma for editing if id is present
    useEffect(() => {
        if (id) {
            setLoading(true);
            proformaService.getById(id)
                .then(res => {
                    const item = res.data.data;
                    setForm({
                        ...emptyForm,
                        ...item,
                        referred_by_hospital_id: item.referred_by_hospital_id || '',
                        referred_by_doctor_id: item.referred_by_doctor_id || '',
                        sales_person_id: item.sales_person_id || '',
                        created_by: item.created_by || '',
                        date: item.date ? item.date.split('T')[0] : '',
                        valid_until: item.valid_until ? item.valid_until.split('T')[0] : '',
                        items: Array.isArray(item.items) && item.items.length ? item.items.map(i => ({
                            ...emptyItem,
                            ...i,
                            max_stock: i.product?.current_stock || 0,
                            tax_rate: i.tax_rate || 18,
                        })) : [{ ...emptyItem }],
                        cgst_percent: item.cgst_percent || 9,
                        sgst_percent: item.sgst_percent || 9,
                    });
                })
                .catch(err => {
                    console.error("Error loading proforma", err);
                    setError("Failed to load proforma invoice details");
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [id]);

    const handleAddItem = () => {
        setForm({ ...form, items: [...form.items, { ...emptyItem }] });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...form.items];
        if (field === 'product_id') {
            const product = products.find(p => p.id === value);
            if (product) {
                newItems[index].product_id = product.id;
                newItems[index].name = product.name;
                newItems[index].rate = product.ptr || product.mrp || 0;
                newItems[index].mrp = product.mrp || 0;
                newItems[index].hsn_code = product.hsn_code || '';
                newItems[index].max_stock = product.current_stock || 0;
            }
        } else {
            newItems[index][field] = value;
        }
        const qty = parseFloat(newItems[index].quantity) || 0;
        const rate = parseFloat(newItems[index].rate) || 0;
        newItems[index].amount = qty * rate;
        setForm({ ...form, items: newItems });
    };

    // Calculate totals automatically
    useEffect(() => {
        const sub_total = form.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        const shipping = parseFloat(form.shipping_charges) || 0;
        const cgst = sub_total * ((parseFloat(form.cgst_percent) || 0) / 100);
        const sgst = sub_total * ((parseFloat(form.sgst_percent) || 0) / 100);
        let discountAmt = 0;
        if (form.discount_type === '%') {
            discountAmt = (sub_total * (parseFloat(form.discount) || 0)) / 100;
        } else {
            discountAmt = parseFloat(form.discount) || 0;
        }
        const adjustment = parseFloat(form.adjustment) || 0;
        const total = sub_total + shipping + cgst + sgst - discountAmt + adjustment;
        const roundedTotal = Math.round(total);
        const rounding = roundedTotal - total;
        setForm(f => ({
            ...f,
            sub_total,
            cgst,
            sgst,
            rounding: parseFloat(rounding.toFixed(2)),
            grand_total: roundedTotal
        }));
    }, [form.items, form.cgst_percent, form.sgst_percent, form.shipping_charges, form.discount, form.discount_type, form.adjustment]);

    const handleSubmit = async (asDraft = false) => {
        if (!form.client_id) return setError('Client is required');
        if (!form.items.length || !form.items.some(i => i.product_id || i.name || i.rate > 0)) return setError('At least one item with a product or rate is required');
        for (let item of form.items) {
            if (!item.quantity || item.quantity <= 0) return setError('Quantity must be greater than zero');
            if (item.rate < 0) return setError('Rate cannot be negative');
        }
        setSaving(true);
        try {
            const payload = { 
                ...form, 
                status: asDraft ? 'Draft' : form.status,
                bank_account_id: form.bank_account_id || null,
                client_id: form.client_id || null,
                referred_by_hospital_id: form.referred_by_hospital_id || null,
                referred_by_doctor_id: form.referred_by_doctor_id || null,
                sales_person_id: form.sales_person_id || null,
            };
            if (id) await proformaService.update(id, payload);
            else await proformaService.create(payload);
            navigate('/proforma');
        } catch (err) { 
            setError(err.response?.data?.message || 'Failed to save'); 
        } finally { 
            setSaving(false); 
        }
    };

    const selectedClient = clients.find(c => c.id === form.client_id);

    /* ─── Form Field Style Helpers ─── */
    const fieldSx = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '6px',
            bgcolor: '#fff',
            '& fieldset': { borderColor: '#d1d5db' },
            '&:hover fieldset': { borderColor: '#9ca3af' },
        },
        '& .MuiInputLabel-root': { fontSize: '13px', color: '#374151' },
    };

    if (loading && !saving) {
        return <LoadingSpinner height="400px" />;
    }

    return (
        <Box sx={{ pb: 5 }}>
            <PageHeader 
                title={id ? `Edit Proforma: ${form.invoice_number || ''}` : 'New Proforma Invoice'} 
                subtitle={id ? 'Modify proforma invoice details' : 'Create a new proforma invoice'}
                action={() => navigate('/proforma')} 
                actionLabel="Back to Proformas" 
            />

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Box sx={{ mt: 2 }}>
                {/* ── Customer Section ── */}
                <Box sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 2, p: 3, mb: 3 }}>
                    <Grid container spacing={3}>
                        {/* Customer Name */}
                        <Grid size={12}>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <FormControl fullWidth size="small" sx={fieldSx} required>
                                    <InputLabel id="client-select-label">Customer Name</InputLabel>
                                    <Select
                                        labelId="client-select-label"
                                        value={form.client_id}
                                        label="Customer Name"
                                        onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                                    >
                                        <MenuItem value=""><em style={{ color: '#9ca3af' }}>Select or type to search</em></MenuItem>
                                        {clients.map(c => <MenuItem key={c.id} value={c.id}>{c.patient_name}</MenuItem>)}
                                    </Select>
                                </FormControl>
                                <Chip label="⊙ INR" size="small" sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 600, fontSize: '11px', borderRadius: 1, height: 32 }} />
                            </Box>
                            
                            {selectedClient && (
                                <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
                                    <Box>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', textTransform: 'uppercase', fontSize: '10px', letterSpacing: 0.5 }}>
                                            BILLING ADDRESS
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontSize: '12px', color: '#334155', mt: 0.5 }}>
                                            {selectedClient.address || 'Kerala India'}
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontSize: '12px', color: '#334155' }}>
                                            Phone: {selectedClient.phone || '-'}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', textTransform: 'uppercase', fontSize: '10px', letterSpacing: 0.5 }}>
                                                SHIPPING ADDRESS
                                            </Typography>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        size="small"
                                                        checked={selectedClient && form.shipping_address === (selectedClient.address || 'Kerala India')}
                                                        onChange={(e) => {
                                                            if (e.target.checked && selectedClient) {
                                                                setForm(prev => ({ ...prev, shipping_address: selectedClient.address || 'Kerala India' }));
                                                            } else {
                                                                setForm(prev => ({ ...prev, shipping_address: '' }));
                                                            }
                                                        }}
                                                        sx={{ p: 0 }}
                                                    />
                                                }
                                                label={
                                                    <Typography sx={{ fontSize: '10px', fontWeight: 600, color: '#475569' }}>
                                                        Is the BILLING ADDRESS as SHIPPING ADDRESS
                                                    </Typography>
                                                }
                                                sx={{ m: 0 }}
                                            />
                                        </Box>
                                        <Typography 
                                            variant="body2" 
                                            sx={{ fontSize: '12px', color: '#2563eb', mt: 0.5, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                                            onClick={handleOpenShippingDialog}
                                        >
                                            {form.shipping_address ? (
                                                <span style={{ color: '#334155', whiteSpace: 'pre-wrap' }}>{form.shipping_address}</span>
                                            ) : (
                                                'New Address'
                                            )}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                            {selectedClient && (
                                <Typography variant="body2" sx={{ mt: 1.5, fontSize: '12px', color: '#475569', fontWeight: 500 }}>
                                    GST Treatment: <span style={{ color: '#1e293b', fontWeight: 600 }}>{form.gst_treatment}</span>
                                </Typography>
                            )}
                        </Grid>

                        {/* Place of Supply */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth size="small" sx={fieldSx} required>
                                <InputLabel id="place-supply-label">Place of Supply</InputLabel>
                                <Select
                                    labelId="place-supply-label"
                                    value={form.place_of_supply}
                                    label="Place of Supply"
                                    onChange={(e) => setForm({ ...form, place_of_supply: e.target.value })}
                                >
                                    <MenuItem value=""><em style={{ color: '#9ca3af' }}>Select place of supply</em></MenuItem>
                                    {PLACE_OF_SUPPLY_OPTIONS.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Company Address */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Company Address (from Settings)"
                                value={companyAddress}
                                multiline
                                maxRows={2}
                                InputProps={{ readOnly: true }}
                                sx={fieldSx}
                            />
                            <Typography variant="caption" sx={{ fontSize: '11px', color: '#64748b', mt: 0.75, display: 'block' }}>
                                Source of Supply: {form.place_of_supply?.split(' - ')[1] || 'Kerala'}
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>

                {/* ── Proforma Details Section ── */}
                <Box sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 2, p: 3, mb: 3 }}>
                    <Grid container spacing={3}>
                        {/* Proforma # */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    size="small"
                                    sx={{ minWidth: 140, ...fieldSx }}
                                    label="Series Prefix"
                                    value={form.invoice_prefix || ''}
                                    onChange={(e) => {
                                        const newPrefix = e.target.value;
                                        setForm(prev => ({
                                            ...prev,
                                            invoice_prefix: newPrefix,
                                            invoice_number: `${newPrefix}-${prev.invoice_no || ''}`
                                        }));
                                    }}
                                />
                                <TextField
                                    fullWidth size="small" sx={fieldSx}
                                    label="Proforma Number"
                                    value={form.invoice_no || form.invoice_number || ''}
                                    onChange={(e) => setForm({ ...form, invoice_no: e.target.value, invoice_number: `${form.invoice_prefix}-${e.target.value}` })}
                                    placeholder="EE-26-27-00001"
                                    required
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton size="small" onClick={() => handleGenerateInvoiceNumber()}>
                                                    <Refresh fontSize="small" />
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Box>
                        </Grid>

                        {/* Order / Enquiry Number */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <TextField
                                fullWidth size="small" sx={fieldSx}
                                label="Order / Enquiry Number"
                                value={form.po_number || ''}
                                onChange={(e) => setForm({ ...form, po_number: e.target.value })}
                            />
                        </Grid>

                        {/* Proforma Date */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <TextField
                                fullWidth size="small" type="date" sx={fieldSx}
                                label="Proforma Date"
                                InputLabelProps={{ shrink: true }}
                                value={form.date}
                                onChange={(e) => {
                                    const newDate = e.target.value;
                                    const calculated = calculateDueDate(newDate, form.terms);
                                    setForm(prev => ({
                                        ...prev,
                                        date: newDate,
                                        valid_until: calculated !== null ? calculated : prev.valid_until
                                    }));
                                }}
                                required
                            />
                        </Grid>

                        {/* Terms */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <FormControl fullWidth size="small" sx={fieldSx}>
                                <InputLabel id="terms-label">Terms</InputLabel>
                                <Select
                                    labelId="terms-label"
                                    value={form.terms}
                                    label="Terms"
                                    onChange={(e) => {
                                        const newTerms = e.target.value;
                                        const calculated = calculateDueDate(form.date, newTerms);
                                        setForm(prev => ({
                                            ...prev,
                                            terms: newTerms,
                                            valid_until: calculated !== null ? calculated : prev.valid_until
                                        }));
                                    }}
                                >
                                    {TERMS_OPTIONS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Valid Until */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <TextField
                                fullWidth size="small" type="date" sx={fieldSx}
                                label="Valid Until"
                                InputLabelProps={{ shrink: true }}
                                value={form.valid_until}
                                onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                                required
                            />
                        </Grid>

                        {/* Status */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <FormControl fullWidth size="small" sx={fieldSx}>
                                <InputLabel id="status-label">Status</InputLabel>
                                <Select
                                    labelId="status-label"
                                    value={form.status}
                                    label="Status"
                                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                                >
                                    <MenuItem value="Draft">Draft</MenuItem>
                                    <MenuItem value="Sent">Sent</MenuItem>
                                    <MenuItem value="Approved">Approved</MenuItem>
                                    <MenuItem value="Expired">Expired</MenuItem>
                                    <MenuItem value="Converted to Invoice">Converted to Invoice</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Box>

                {/* ── Reference & Sales Details Section ── */}
                <Box sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 2, p: 3, mb: 3 }}>
                    <Typography variant="h6" sx={{ fontSize: '14px', fontWeight: 700, color: '#374151', mb: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Reference & Sales Details
                    </Typography>
                    <Grid container spacing={3}>
                        {/* Referred by Hospital */}
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <FormControl fullWidth size="small" sx={fieldSx}>
                                <InputLabel id="referred-hospital-label">Referred by Hospital</InputLabel>
                                <Select
                                    labelId="referred-hospital-label"
                                    value={form.referred_by_hospital_id || ''}
                                    label="Referred by Hospital"
                                    onChange={(e) => setForm({ ...form, referred_by_hospital_id: e.target.value })}
                                >
                                    <MenuItem value=""><em style={{ color: '#9ca3af' }}>None</em></MenuItem>
                                    {hospitals.map(h => <MenuItem key={h.id} value={h.id}>{h.hospital_name}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Referred by Doctor */}
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <FormControl fullWidth size="small" sx={fieldSx}>
                                <InputLabel id="referred-doctor-label">Referred by Doctor</InputLabel>
                                <Select
                                    labelId="referred-doctor-label"
                                    value={form.referred_by_doctor_id || ''}
                                    label="Referred by Doctor"
                                    onChange={(e) => setForm({ ...form, referred_by_doctor_id: e.target.value })}
                                >
                                    <MenuItem value=""><em style={{ color: '#9ca3af' }}>None</em></MenuItem>
                                    {doctors.map(d => <MenuItem key={d.id} value={d.id}>{d.doctor_name}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Sales Person */}
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <FormControl fullWidth size="small" sx={fieldSx}>
                                <InputLabel id="sales-person-label">Sales Person</InputLabel>
                                <Select
                                    labelId="sales-person-label"
                                    value={form.sales_person_id || ''}
                                    label="Sales Person"
                                    onChange={(e) => setForm({ ...form, sales_person_id: e.target.value })}
                                >
                                    <MenuItem value=""><em style={{ color: '#9ca3af' }}>None</em></MenuItem>
                                    {salesPersons.map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Created by */}
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <TextField
                                fullWidth
                                size="small"
                                sx={fieldSx}
                                label="Created by"
                                value={id ? (form.creator?.name || '') : (user?.name || '')}
                                disabled
                            />
                        </Grid>
                    </Grid>
                </Box>

                {/* ── Items Table ── */}
                <Box sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 2, mb: 3, overflow: 'hidden' }}>
                    <TableContainer>
                        <Table size="small">
                            <TableHead sx={{ bgcolor: '#f3f4f6' }}>
                                <TableRow>
                                    <TableCell sx={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', py: 1.5, width: 45 }}>#</TableCell>
                                    <TableCell sx={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', py: 1.5 }}>ITEM DETAILS</TableCell>
                                    <TableCell sx={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', py: 1.5, width: 90 }}>MRP</TableCell>
                                    <TableCell sx={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', py: 1.5, width: 80 }}>STOCK</TableCell>
                                    <TableCell sx={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', py: 1.5, width: 100 }}>QUANTITY</TableCell>
                                    <TableCell sx={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', py: 1.5, width: 120 }}>RATE</TableCell>
                                    <TableCell sx={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', py: 1.5, width: 130 }}>TAX</TableCell>
                                    <TableCell sx={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', py: 1.5, width: 110, textAlign: 'right' }}>AMOUNT</TableCell>
                                    <TableCell sx={{ width: 40 }} />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {form.items.map((item, idx) => (
                                    <TableRow key={idx} sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                                        <TableCell align="center" sx={{ color: '#6b7280', fontSize: '13px' }}>{idx + 1}</TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <FormControl fullWidth size="small" variant="standard">
                                                <Select
                                                    value={item.product_id || ''}
                                                    displayEmpty
                                                    onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)}
                                                    sx={{ fontSize: '13px' }}
                                                >
                                                    <MenuItem value=""><em style={{ color: '#9ca3af' }}>Type or click to select an item.</em></MenuItem>
                                                    {products.map(p => <MenuItem key={p.id} value={p.id}>{p.name} (MRP: ₹{p.mrp})</MenuItem>)}
                                                </Select>
                                            </FormControl>
                                            {item.hsn_code && (
                                                <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '11px' }}>
                                                    HSN Code: {item.hsn_code}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <TextField fullWidth size="small" variant="standard" type="number"
                                                value={item.mrp || 0}
                                                onChange={(e) => handleItemChange(idx, 'mrp', e.target.value)}
                                                sx={{ '& input': { fontSize: '13px' } }} />
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Typography variant="caption" fontWeight={700}
                                                color={item.max_stock < item.quantity ? 'error' : 'success.main'}
                                                sx={{ fontSize: '11px' }}>
                                                {item.max_stock} Avail
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <TextField size="small" variant="standard" type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                                    sx={{ width: '60px', '& input': { fontSize: '13px' } }} />
                                                <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '11px' }}>pcs</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <TextField size="small" variant="standard" type="number"
                                                value={item.rate}
                                                onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                                                sx={{ width: '90px', '& input': { fontSize: '13px' } }} />
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <FormControl fullWidth size="small" variant="standard">
                                                <Select
                                                    value={item.tax_rate || 18}
                                                    onChange={(e) => handleItemChange(idx, 'tax_rate', e.target.value)}
                                                    sx={{ fontSize: '12px' }}
                                                >
                                                    <MenuItem value={0}>None</MenuItem>
                                                    <MenuItem value={5}>GST5 [5%]</MenuItem>
                                                    <MenuItem value={12}>GST12 [12%]</MenuItem>
                                                    <MenuItem value={18}>GST18 [18%]</MenuItem>
                                                    <MenuItem value={28}>GST28 [28%]</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5, textAlign: 'right' }}>
                                            <Typography variant="body2" fontWeight={700} sx={{ fontSize: '13px' }}>
                                                {formatCurrency(item.amount || 0)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center" sx={{ py: 1.5 }}>
                                            <IconButton size="small" color="error" onClick={() => {
                                                const newItems = form.items.filter((_, i) => i !== idx);
                                                setForm({ ...form, items: newItems.length ? newItems : [{ ...emptyItem }] });
                                            }}><Delete fontSize="small" /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box sx={{ p: 2, borderTop: '1px solid #f3f4f6', display: 'flex', gap: 2 }}>
                        <Button startIcon={<Add />} onClick={handleAddItem} size="small"
                            sx={{ color: '#8a0303', fontSize: '13px', textTransform: 'none', fontWeight: 600 }}>
                            Add New Row
                        </Button>
                    </Box>
                </Box>

                {/* ── Totals & Notes Row ── */}
                <Grid container spacing={3}>
                    {/* Left: Notes & Attachments */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        {/* Customer Notes */}
                        <Box sx={{ mb: 2 }}>
                            <Typography sx={{ fontSize: '13px', color: '#374151', fontWeight: 600, mb: 0.5 }}>Customer Notes</Typography>
                            <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '11px', display: 'block', mb: 0.5 }}>
                                Will be displayed on the Invoice
                            </Typography>
                            <TextField
                                fullWidth multiline rows={3}
                                placeholder="THANK YOU FOR YOUR BUSINESS..."
                                value={form.customer_notes}
                                onChange={(e) => setForm({ ...form, customer_notes: e.target.value })}
                                sx={{ ...fieldSx, '& textarea': { fontSize: '13px' } }}
                                size="small"
                            />
                        </Box>

                        {/* Terms & Conditions */}
                        <Box sx={{ mb: 2 }}>
                            <Typography sx={{ fontSize: '13px', color: '#374151', fontWeight: 600, mb: 0.5 }}>Terms & Conditions</Typography>
                            <TextField
                                fullWidth multiline rows={4}
                                value={form.terms_conditions}
                                onChange={(e) => setForm({ ...form, terms_conditions: e.target.value })}
                                sx={{ ...fieldSx, '& textarea': { fontSize: '12px' } }}
                                size="small"
                            />
                        </Box>

                        {/* Attach Files */}
                        <Box sx={{ mb: 2 }}>
                            <Typography sx={{ fontSize: '13px', color: '#374151', fontWeight: 600, mb: 1 }}>Attach File(s) to Invoice</Typography>
                            <Button
                                variant="outlined"
                                startIcon={<AttachFile />}
                                size="small"
                                component="label"
                                sx={{ borderRadius: 1, borderColor: '#d1d5db', color: '#374151', fontSize: '12px', textTransform: 'none' }}
                            >
                                Upload File
                                <input type="file" multiple hidden onChange={(e) => setAttachedFiles(Array.from(e.target.files))} />
                            </Button>
                            <Typography variant="caption" sx={{ display: 'block', color: '#9ca3af', mt: 0.5, fontSize: '11px' }}>
                                You can upload a maximum of 10 files, 10MB each
                            </Typography>
                            {attachedFiles.length > 0 && (
                                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {attachedFiles.map((f, i) => (
                                        <Chip key={i} label={f.name} size="small" onDelete={() => setAttachedFiles(attachedFiles.filter((_, j) => j !== i))} />
                                    ))}
                                </Box>
                            )}
                        </Box>

                        {/* Payment Received */}
                        <FormControlLabel
                            control={
                                <Checkbox
                                    size="small"
                                    checked={form.payment_received}
                                    onChange={(e) => setForm({ ...form, payment_received: e.target.checked })}
                                />
                            }
                            label={<Typography sx={{ fontSize: '13px', color: '#374151' }}>I have received the payment</Typography>}
                        />

                        {/* Bank Account */}
                        <Box sx={{ mt: 2 }}>
                            <Typography sx={{ fontSize: '13px', color: '#374151', fontWeight: 600, mb: 1 }}>Bank Account</Typography>
                            <FormControl fullWidth size="small" sx={fieldSx}>
                                <Select value={form.bank_account_id} displayEmpty onChange={(e) => setForm({ ...form, bank_account_id: e.target.value })}>
                                    <MenuItem value="">None</MenuItem>
                                    {bankAccounts.filter(b => b.is_active).map(b => <MenuItem key={b.id} value={b.id}>{b.bank_name} - {b.account_number}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Box>
                    </Grid>

                    {/* Right: Calculation Summary */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
                            {/* Sub Total */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 3, py: 1.5, borderBottom: '1px solid #f3f4f6' }}>
                                <Typography sx={{ fontSize: '13px', color: '#374151' }}>Sub Total</Typography>
                                <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>{formatCurrency(form.sub_total)}</Typography>
                            </Box>

                            {/* Shipping Charges */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 1, borderBottom: '1px solid #f3f4f6' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Typography sx={{ fontSize: '13px', color: '#374151' }}>Shipping Charges</Typography>
                                    <Info fontSize="inherit" sx={{ color: '#9ca3af', fontSize: '14px' }} />
                                </Box>
                                <TextField size="small" type="number" sx={{ width: '120px', ...fieldSx }}
                                    value={form.shipping_charges}
                                    onChange={(e) => setForm({ ...form, shipping_charges: e.target.value })}
                                    InputProps={{ sx: { height: '32px', fontSize: '13px' } }}
                                />
                            </Box>

                            {/* CGST */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 1, borderBottom: '1px solid #f3f4f6' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography sx={{ fontSize: '13px', color: '#374151' }}>CGST [{form.cgst_percent}%]</Typography>
                                    <TextField size="small" type="number" sx={{ width: '55px', ...fieldSx }}
                                        value={form.cgst_percent}
                                        onChange={(e) => setForm({ ...form, cgst_percent: e.target.value })}
                                        InputProps={{ sx: { height: '28px', fontSize: '12px' } }}
                                    />
                                </Box>
                                <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>{formatCurrency(form.cgst)}</Typography>
                            </Box>

                            {/* SGST */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 1, borderBottom: '1px solid #f3f4f6' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography sx={{ fontSize: '13px', color: '#374151' }}>SGST [{form.sgst_percent}%]</Typography>
                                    <TextField size="small" type="number" sx={{ width: '55px', ...fieldSx }}
                                        value={form.sgst_percent}
                                        onChange={(e) => setForm({ ...form, sgst_percent: e.target.value })}
                                        InputProps={{ sx: { height: '28px', fontSize: '12px' } }}
                                    />
                                </Box>
                                <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>{formatCurrency(form.sgst)}</Typography>
                            </Box>

                            {/* Discount */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 1, borderBottom: '1px solid #f3f4f6' }}>
                                <Typography sx={{ fontSize: '13px', color: '#374151' }}>Discount</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <TextField size="small" type="number" sx={{ width: '80px', ...fieldSx }}
                                        value={form.discount}
                                        onChange={(e) => setForm({ ...form, discount: e.target.value })}
                                        InputProps={{ sx: { height: '32px', fontSize: '13px' } }}
                                    />
                                    <FormControl size="small" sx={{ minWidth: 65, ...fieldSx }}>
                                        <Select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                                            sx={{ height: '32px', fontSize: '12px' }}>
                                            <MenuItem value="%">%</MenuItem>
                                            <MenuItem value="₹">₹</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <Info fontSize="inherit" sx={{ color: '#9ca3af', fontSize: '14px' }} />
                                </Box>
                            </Box>

                            {/* TDS / TCS */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 1, borderBottom: '1px solid #f3f4f6' }}>
                                <RadioGroup row value={form.tds_tcs} onChange={(e) => setForm({ ...form, tds_tcs: e.target.value })}>
                                    <FormControlLabel value="TDS" control={<Radio size="small" />} label={<Typography sx={{ fontSize: '13px' }}>TDS</Typography>} />
                                    <FormControlLabel value="TCS" control={<Radio size="small" />} label={<Typography sx={{ fontSize: '13px' }}>TCS</Typography>} />
                                </RadioGroup>
                                <FormControl size="small" sx={{ minWidth: 140, ...fieldSx }}>
                                    <Select value={form.tds_tcs_tax} displayEmpty onChange={(e) => setForm({ ...form, tds_tcs_tax: e.target.value })}
                                        sx={{ height: '32px', fontSize: '12px' }}>
                                        <MenuItem value=""><em style={{ color: '#9ca3af' }}>Select a Tax</em></MenuItem>
                                        <MenuItem value="TDS1">TDS @ 1%</MenuItem>
                                        <MenuItem value="TDS2">TDS @ 2%</MenuItem>
                                        <MenuItem value="TCS1">TCS @ 1%</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>

                            {/* Adjustment */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 1, borderBottom: '1px solid #f3f4f6' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Typography sx={{ fontSize: '13px', color: '#374151' }}>Adjustment</Typography>
                                    <Info fontSize="inherit" sx={{ color: '#9ca3af', fontSize: '14px' }} />
                                </Box>
                                <TextField size="small" type="number" sx={{ width: '120px', ...fieldSx }}
                                    value={form.adjustment}
                                    onChange={(e) => setForm({ ...form, adjustment: e.target.value })}
                                    InputProps={{ sx: { height: '32px', fontSize: '13px' } }}
                                />
                            </Box>

                            {/* Round Off */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 3, py: 1.5, borderBottom: '1px solid #f3f4f6' }}>
                                <Typography sx={{ fontSize: '13px', color: '#374151' }}>Round Off</Typography>
                                <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>{form.rounding}</Typography>
                            </Box>

                            {/* Grand Total */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 3, py: 2, bgcolor: '#fff5f5' }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: 800, color: '#8a0303' }}>Total (₹)</Typography>
                                <Typography sx={{ fontSize: '22px', fontWeight: 800, color: '#8a0303' }}>{formatCurrency(form.grand_total)}</Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>

                {/* Form Actions */}
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    <Button
                        variant="contained"
                        onClick={() => handleSubmit(false)}
                        disabled={saving}
                        sx={{ borderRadius: 1, bgcolor: '#8a0303', fontSize: '13px', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#4a0000' } }}
                    >
                        {saving ? 'Saving...' : id ? 'Update Proforma' : 'Save and Send'}
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => handleSubmit(true)}
                        disabled={saving}
                        sx={{ borderRadius: 1, borderColor: '#d1d5db', color: '#374151', fontSize: '13px', textTransform: 'none', fontWeight: 600 }}
                    >
                        Save as Draft
                    </Button>
                    <Button
                        variant="text"
                        onClick={() => navigate('/proforma')}
                        sx={{ borderRadius: 1, color: '#374151', fontSize: '13px', textTransform: 'none' }}
                    >
                        Cancel
                    </Button>
                </Box>
            </Box>

            <Dialog open={shippingDialogOpen} onClose={() => setShippingDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Shipping Address</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {selectedClient && selectedClient.address && (
                            <Button 
                                variant="outlined" 
                                size="small" 
                                onClick={handleCopyBillingAddress}
                                sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
                            >
                                Copy Billing Address
                            </Button>
                        )}
                        <TextField
                            label="Shipping Address"
                            multiline
                            rows={4}
                            fullWidth
                            variant="outlined"
                            value={tempShippingAddress}
                            onChange={(e) => setTempShippingAddress(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShippingDialogOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
                    <Button onClick={handleSaveShippingAddress} variant="contained" sx={{ bgcolor: '#8a0303', '&:hover': { bgcolor: '#4a0000' }, textTransform: 'none' }}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default NewProformaPage;
