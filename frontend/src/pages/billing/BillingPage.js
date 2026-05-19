import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, TextField, Typography, Pagination, Dialog, DialogTitle,
    DialogContent, DialogActions, Alert, Grid, Tooltip, CardContent, Button,
    MenuItem, Select, FormControl, InputLabel, Divider,
} from '@mui/material';
import { Add, Edit, Delete, Search, Print, Visibility, Send } from '@mui/icons-material';
import { billingService, taskService, clientService, stockService, companyProfileService } from '../../services';
import api from '../../services/api';
import { formatDate, formatCurrency, BILLING_STATUSES } from '../../utils/constants';
import StatusChip from '../../components/common/StatusChip';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const emptyItem = { product_id: '', quantity: 1, rate: 0, mrp: 0, hsn_code: '', amount: 0 };
const emptyForm = {
    client_id: '',
    bank_account_id: '',
    invoice_number: '',
    invoice_prefix: 'ESSAR',
    invoice_no: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date().toISOString().split('T')[0],
    po_no: '',
    status: 'pending',
    items: [{ ...emptyItem }],
    sub_total: 0,
    cgst: 0,
    sgst: 0,
    rounding: 0,
    amount: 0, // This is grand_total
    notes: '',
    terms_conditions: '1. Payment terms: 100% Advance\n2. Validity: 15 days\n3. Delivery: Within 7 working days',
    cgst_percent: 9,
    sgst_percent: 9,
    billing_type: 'fixed'
};

const BillingPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [statusFilter, setStatusFilter] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    
    // Dependencies
    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [companyProfile, setCompanyProfile] = useState(null);
    const { user } = useAuth();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await billingService.getAll({ page, limit: 10, status: statusFilter });
            setItems(res.data.data);
            setTotalPages(res.data.totalPages || 1);
            setTotal(res.data.count || res.data.data.length);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [page, statusFilter]);

    useEffect(() => { 
        fetchData(); 
    }, [fetchData]);

    useEffect(() => {
        Promise.all([
            clientService.getAll({ limit: 1000 }),
            stockService.getProducts(),
            api.get('/bank-accounts'),
            companyProfileService.get()
        ]).then(([c, p, b, comp]) => {
            setClients(c.data.data || []);
            setProducts(p.data.data || []);
            setBankAccounts(b.data.data || []);
            if (comp.data.data) setCompanyProfile(comp.data.data);
        }).catch(err => console.error("Error loading dependencies", err));
    }, []);

    const handleOpen = (item = null) => {
        setEditItem(item);
        if (item) {
            setForm({
                ...item,
                invoice_date: item.invoice_date ? item.invoice_date.split('T')[0] : '',
                due_date: item.due_date ? item.due_date.split('T')[0] : '',
                items: Array.isArray(item.items) && item.items.length ? item.items.map(i => ({
                    ...i,
                    quantity: i.quantity || i.qty || 0,
                    rate: i.rate || i.price || 0,
                    amount: i.amount || i.total || 0
                })) : [{ ...emptyItem }],
                cgst_percent: item.cgst_percent || 9,
                sgst_percent: item.sgst_percent || 9
            });
        } else {
            setForm(emptyForm);
        }
        setError('');
        setOpenDialog(true);
    };

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
            }
        } else {
            newItems[index][field] = value;
        }

        // Recalculate amount
        const qty = parseFloat(newItems[index].quantity) || 0;
        const rate = parseFloat(newItems[index].rate) || 0;
        newItems[index].amount = qty * rate;

        setForm({ ...form, items: newItems });
    };

    useEffect(() => {
        const sub_total = form.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        const cgst = sub_total * ((parseFloat(form.cgst_percent) || 0) / 100);
        const sgst = sub_total * ((parseFloat(form.sgst_percent) || 0) / 100);
        const total = sub_total + cgst + sgst;
        const roundedTotal = Math.round(total);
        const rounding = roundedTotal - total;
        
        setForm(f => ({ 
            ...f, 
            sub_total, 
            cgst, 
            sgst, 
            rounding: parseFloat(rounding.toFixed(2)), 
            amount: roundedTotal 
        }));
    }, [form.items, form.cgst_percent, form.sgst_percent]);

    const handleSubmit = async () => {
        if (!form.client_id) return setError('Client is required');
        if (!form.items.length || (!form.items[0].product_id && !form.items[0].name)) return setError('At least one item is required');
        
        setSaving(true);
        try {
            if (editItem) await billingService.update(editItem.id, form);
            else await billingService.create(form);
            setOpenDialog(false);
            fetchData();
        } catch (err) { setError(err.response?.data?.message || 'Failed to save'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this Invoice?')) return;
        try { 
            await billingService.delete(id); 
            fetchData(); 
        }
        catch { alert('Failed to delete'); }
    };

    const handlePrint = (item, shouldPrint = true) => {
        const bank = item.bank_account || bankAccounts.find(b => b.id === item.bank_account_id);
        const companyName = companyProfile?.company_name || 'Essar Automation';
        const logoUrl = companyProfile?.logo ? `${(process.env.REACT_APP_API_URL || '/api')}/uploads/${companyProfile.logo}` : '';
        const address = [companyProfile?.address_line_1, companyProfile?.address_line_2, companyProfile?.city, companyProfile?.state, companyProfile?.pin_code].filter(Boolean).join(', ');
        const contactInfo = [companyProfile?.phone ? `Phone: ${companyProfile.phone}` : '', companyProfile?.email ? `Email: ${companyProfile.email}` : ''].filter(Boolean).join(' | ');

        const printContent = `
            <html>
            <head>
                <title>Tax Invoice - ${item.invoice_number}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #333; }
                    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #065f46; padding-bottom: 20px; margin-bottom: 30px; }
                    .header-left { display: flex; align-items: center; gap: 15px; }
                    .logo { max-height: 80px; max-width: 200px; object-fit: contain; }
                    .invoice-title { color: #065f46; font-size: 28px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
                    .company-name { font-size: 22px; font-weight: bold; margin: 0; color: #1e293b; }
                    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; }
                    .box { background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
                    .box h4 { margin-top: 0; color: #64748b; font-size: 14px; text-transform: uppercase; margin-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; }
                    th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
                    th { background-color: #f1f5f9; color: #475569; font-weight: 600; text-transform: uppercase; font-size: 12px; }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }
                    .totals { width: 300px; float: right; margin-bottom: 30px; }
                    .totals table { margin: 0; }
                    .totals th { background: transparent; text-align: right; border: none; padding: 8px; }
                    .totals td { text-align: right; font-weight: bold; border: none; padding: 8px; }
                    .totals .grand-total { font-size: 18px; color: #065f46; border-top: 2px solid #e2e8f0; }
                    .clearfix::after { content: ""; clear: both; display: table; }
                    .footer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 40px; }
                    .terms { font-size: 12px; color: #475569; }
                    .terms pre { font-family: inherit; white-space: pre-wrap; margin: 0; }
                    .signature { text-align: center; margin-top: 50px; }
                    .signature-line { width: 200px; border-bottom: 1px solid #000; margin: 0 auto 10px auto; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="header-left">
                        ${logoUrl ? `<img src="${logoUrl}" class="logo" alt="Company Logo" />` : ''}
                        <div>
                            <h1 class="company-name">${companyName}</h1>
                            ${address ? `<p style="margin: 5px 0 0 0; color: #64748b; font-size: 12px; max-width: 300px;">${address}</p>` : '<p style="margin: 5px 0 0 0; color: #64748b;">Industrial Solutions Provider</p>'}
                            ${contactInfo ? `<p style="margin: 3px 0 0 0; color: #64748b; font-size: 12px;">${contactInfo}</p>` : ''}
                            ${companyProfile?.service_tax_no ? `<p style="margin: 3px 0 0 0; color: #64748b; font-size: 12px;">GSTIN/Tax No: ${companyProfile.service_tax_no}</p>` : ''}
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="invoice-title">TAX INVOICE</div>
                        <p style="margin: 5px 0 0 0;"><strong># ${item.invoice_number}</strong></p>
                    </div>
                </div>
                
                <div class="details-grid">
                    <div class="box">
                        <h4>Billed To:</h4>
                        <strong>${item.client?.patient_name || '-'}</strong><br>
                        ${item.client?.phone ? `Phone: ${item.client.phone}<br>` : ''}
                        ${item.client?.email ? `Email: ${item.client.email}` : ''}
                    </div>
                    <div class="box">
                        <h4>Invoice Details:</h4>
                        <table style="border: none; margin: 0;">
                            <tr><td style="border: none; padding: 4px 0; color: #64748b;">Date:</td><td style="border: none; padding: 4px 0; text-align: right; font-weight: 500;">${new Date(item.invoice_date).toLocaleDateString()}</td></tr>
                            <tr><td style="border: none; padding: 4px 0; color: #64748b;">Due Date:</td><td style="border: none; padding: 4px 0; text-align: right; font-weight: 500;">${item.due_date ? new Date(item.due_date).toLocaleDateString() : '-'}</td></tr>
                            <tr><td style="border: none; padding: 4px 0; color: #64748b;">PO Number:</td><td style="border: none; padding: 4px 0; text-align: right; font-weight: 500;">${item.po_no || '-'}</td></tr>
                        </table>
                    </div>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th width="5%">Sl No</th>
                            <th width="40%">Item Description</th>
                            <th width="15%">HSN/SAC</th>
                            <th width="10%" class="text-center">Qty</th>
                            <th width="15%" class="text-right">Rate</th>
                            <th width="15%" class="text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(item.items || []).map((i, idx) => `
                            <tr>
                                <td class="text-center">${idx + 1}</td>
                                <td>${i.name || i.product?.name || '-'}</td>
                                <td>${i.hsn_code || '-'}</td>
                                <td class="text-center">${i.quantity || i.qty}</td>
                                <td class="text-right">${formatCurrency(i.rate || i.price)}</td>
                                <td class="text-right">${formatCurrency(i.amount || i.total)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="clearfix">
                    <div class="totals">
                        <table>
                            <tr><th>Sub Total:</th><td>${formatCurrency(item.sub_total)}</td></tr>
                            <tr><th>CGST:</th><td>${formatCurrency(item.cgst)}</td></tr>
                            <tr><th>SGST:</th><td>${formatCurrency(item.sgst)}</td></tr>
                            <tr><th>Rounding:</th><td>${item.rounding}</td></tr>
                            <tr class="grand-total"><th>Grand Total:</th><td>${formatCurrency(item.amount)}</td></tr>
                        </table>
                    </div>
                </div>
                
                <div class="footer-grid">
                    <div>
                        <div class="box terms" style="margin-bottom: 20px;">
                            <h4>Terms & Conditions</h4>
                            <pre>${item.terms_conditions || '-'}</pre>
                        </div>
                        ${bank ? `
                        <div class="box terms">
                            <h4>Bank Details</h4>
                            <strong>${bank.bank_name}</strong><br>
                            A/C Name: ${bank.account_name}<br>
                            A/C No: ${bank.account_number}<br>
                            IFSC: ${bank.ifsc_code}
                        </div>
                        ` : ''}
                    </div>
                    <div class="signature">
                        <div class="signature-line"></div>
                        <strong>Authorized Signatory</strong><br>
                        <span style="color: #64748b; font-size: 12px;">For ${companyName}</span>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        
        if (shouldPrint) {
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
        }
    };

    return (
        <Box>
            <PageHeader title="Billing & Invoices" subtitle="Manage Tax Invoices"
                action={() => handleOpen()} actionLabel="New Invoice" />
            
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ pb: '16px !important' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <FormControl size="small" fullWidth>
                                <InputLabel>Filter by Status</InputLabel>
                                <Select value={statusFilter} label="Filter by Status" onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                                    <MenuItem value="">All Statuses</MenuItem>
                                    {BILLING_STATUSES.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card>
                <TableContainer>
                    {loading ? <LoadingSpinner height="300px" /> : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Invoice Number</TableCell>
                                    <TableCell>Client</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {items.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5, color: 'text.secondary' }}>No Invoices found</TableCell></TableRow>
                                ) : items.map((item, i) => (
                                    <TableRow key={item.id} hover>
                                        <TableCell><Typography variant="body2" fontWeight={700} color="primary">{item.invoice_number}</Typography></TableCell>
                                        <TableCell>{item.client?.patient_name || '-'}</TableCell>
                                        <TableCell>{formatDate(item.invoice_date)}</TableCell>
                                        <TableCell><Typography fontWeight={700}>{formatCurrency(item.amount)}</Typography></TableCell>
                                        <TableCell><StatusChip status={item.status} /></TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="View"><IconButton size="small" onClick={() => handlePrint(item, false)} color="primary"><Visibility fontSize="small" /></IconButton></Tooltip>
                                            <Tooltip title="Print/PDF"><IconButton size="small" onClick={() => handlePrint(item, true)} color="secondary"><Print fontSize="small" /></IconButton></Tooltip>
                                            <Tooltip title="Edit"><IconButton size="small" onClick={() => handleOpen(item)} color="info"><Edit fontSize="small" /></IconButton></Tooltip>
                                            {user?.role === 'admin' && (
                                                <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(item.id)} color="error"><Delete fontSize="small" /></IconButton></Tooltip>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </TableContainer>
                {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <Pagination count={totalPages} page={page} onChange={(e, val) => setPage(val)} color="primary" />
                    </Box>
                )}
            </Card>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3, height: '90vh' } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, borderBottom: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                    <Typography variant="h5" fontWeight={800} color="#0f172a">
                        {editItem ? `Edit Invoice: ${editItem.invoice_number}` : 'New Tax Invoice'}
                    </Typography>
                    {editItem && <StatusChip status={form.status} />}
                </Box>
                
                <DialogContent sx={{ p: 4, bgcolor: '#f8fafc' }}>
                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    {/* Header Section */}
                    <Card sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Client</InputLabel>
                                    <Select value={form.client_id} label="Client" onChange={(e) => setForm({ ...form, client_id: e.target.value })}>
                                        {clients.map(c => <MenuItem key={c.id} value={c.id}>{c.patient_name}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField fullWidth size="small" type="date" label="Invoice Date" InputLabelProps={{ shrink: true }} value={form.invoice_date} onChange={(e) => setForm({ ...form, invoice_date: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField fullWidth size="small" type="date" label="Due Date" InputLabelProps={{ shrink: true }} value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField fullWidth size="small" label="PO Number" value={form.po_no} onChange={(e) => setForm({ ...form, po_no: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Status</InputLabel>
                                    <Select value={form.status} label="Status" onChange={(e) => setForm({ ...form, status: e.target.value })}>
                                        {BILLING_STATUSES.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Card>

                    {/* Items Section */}
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#1e293b' }}>Items</Typography>
                    <TableContainer component={Card} sx={{ mb: 2, borderRadius: 3, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                        <Table size="small">
                            <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                                <TableRow>
                                    <TableCell width="50">No</TableCell>
                                    <TableCell>Select Item</TableCell>
                                    <TableCell width="120">HSN/SAC</TableCell>
                                    <TableCell width="120">Quantity</TableCell>
                                    <TableCell width="150">Rate</TableCell>
                                    <TableCell width="150">Amount</TableCell>
                                    <TableCell width="50"></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {form.items.map((item, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell align="center">{idx + 1}</TableCell>
                                        <TableCell>
                                            <FormControl fullWidth size="small" variant="standard">
                                                <Select value={item.product_id || ''} displayEmpty onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)}>
                                                    <MenuItem value=""><em>Search Item...</em></MenuItem>
                                                    {products.map(p => <MenuItem key={p.id} value={p.id}>{p.name} (MRP: ₹{p.mrp})</MenuItem>)}
                                                </Select>
                                            </FormControl>
                                            {!item.product_id && (
                                                <TextField fullWidth size="small" variant="standard" placeholder="Or enter manually" value={item.name || ''} onChange={(e) => handleItemChange(idx, 'name', e.target.value)} />
                                            )}
                                        </TableCell>
                                        <TableCell><TextField fullWidth size="small" variant="standard" value={item.hsn_code} onChange={(e) => handleItemChange(idx, 'hsn_code', e.target.value)} /></TableCell>
                                        <TableCell><TextField fullWidth size="small" type="number" variant="standard" value={item.quantity || item.qty} onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} /></TableCell>
                                        <TableCell><TextField fullWidth size="small" type="number" variant="standard" value={item.rate || item.price} onChange={(e) => handleItemChange(idx, 'rate', e.target.value)} /></TableCell>
                                        <TableCell><Typography variant="body2" fontWeight={700}>{formatCurrency(item.amount || item.total)}</Typography></TableCell>
                                        <TableCell align="center">
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
                    <Button startIcon={<Add />} onClick={handleAddItem} variant="outlined" sx={{ mb: 4, borderRadius: 2 }}>Add New Row</Button>

                    {/* Footer / Calculations Section */}
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Card sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>Bank & Terms</Typography>
                                <FormControl fullWidth size="small" sx={{ mb: 3 }}>
                                    <InputLabel>Bank Account</InputLabel>
                                    <Select value={form.bank_account_id} label="Bank Account" onChange={(e) => setForm({ ...form, bank_account_id: e.target.value })}>
                                        <MenuItem value="">None</MenuItem>
                                        {bankAccounts.filter(b => b.is_active).map(b => <MenuItem key={b.id} value={b.id}>{b.bank_name} - {b.account_number}</MenuItem>)}
                                    </Select>
                                </FormControl>
                                <TextField fullWidth multiline rows={4} label="Terms & Conditions" value={form.terms_conditions} onChange={(e) => setForm({ ...form, terms_conditions: e.target.value })} />
                            </Card>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <Card sx={{ p: 3, borderRadius: 3, bgcolor: '#fff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0' }}>
                                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>Calculation Summary</Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography color="text.secondary">Subtotal</Typography>
                                    <Typography fontWeight={600}>{formatCurrency(form.sub_total)}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography color="text.secondary">CGST (%)</Typography>
                                        <TextField size="small" type="number" sx={{ width: '80px', '& .MuiInputBase-input': { p: 0.5, textAlign: 'center' } }} value={form.cgst_percent} onChange={(e) => setForm({ ...form, cgst_percent: e.target.value })} />
                                    </Box>
                                    <Typography fontWeight={600}>{formatCurrency(form.cgst)}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography color="text.secondary">SGST (%)</Typography>
                                        <TextField size="small" type="number" sx={{ width: '80px', '& .MuiInputBase-input': { p: 0.5, textAlign: 'center' } }} value={form.sgst_percent} onChange={(e) => setForm({ ...form, sgst_percent: e.target.value })} />
                                    </Box>
                                    <Typography fontWeight={600}>{formatCurrency(form.sgst)}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography color="text.secondary">Rounding</Typography>
                                    <Typography fontWeight={600}>{form.rounding}</Typography>
                                </Box>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h6" fontWeight={800} color="#065f46">Grand Total</Typography>
                                    <Typography variant="h5" fontWeight={800} color="#065f46">{formatCurrency(form.amount)}</Typography>
                                </Box>
                            </Card>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: '1px solid #e2e8f0', bgcolor: '#fff' }}>
                    <Button onClick={() => setOpenDialog(false)} variant="outlined" sx={{ color: 'text.secondary', borderColor: '#cbd5e1' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={saving} startIcon={<Send />} sx={{ bgcolor: '#065f46', px: 4, py: 1.5, borderRadius: 2, '&:hover': { bgcolor: '#044e39' } }}>
                        {saving ? 'Saving...' : editItem ? 'Update Invoice' : 'Generate Tax Invoice'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BillingPage;
