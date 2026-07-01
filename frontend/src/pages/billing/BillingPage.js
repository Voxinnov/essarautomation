import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Typography, Pagination, Tooltip, CardContent, Button,
    FormControl, InputLabel, Select, MenuItem, Grid
} from '@mui/material';
import { Edit, Delete, Print, Visibility } from '@mui/icons-material';
import { billingService, companyProfileService } from '../../services';
import api from '../../services/api';
import { formatDate, formatCurrency, BILLING_STATUSES } from '../../utils/constants';
import StatusChip from '../../components/common/StatusChip';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';



const BillingPage = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [statusFilter, setStatusFilter] = useState('');

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

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        Promise.all([
            api.get('/bank-accounts'),
            companyProfileService.get()
        ]).then(([b, comp]) => {
            setBankAccounts(b.data.data || []);
            if (comp.data.data) setCompanyProfile(comp.data.data);
        }).catch(err => console.error("Error loading dependencies", err));
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this Invoice?')) return;
        try { await billingService.delete(id); fetchData(); }
        catch { alert('Failed to delete'); }
    };

    const handlePrint = (item, shouldPrint = true) => {
        const bank = item.bank_account || bankAccounts.find(b => b.id === item.bank_account_id);
        const companyName = companyProfile?.company_name || 'ESSAR ENGINEERS';
        const addressText = companyProfile?.address_line_1 
            ? `${companyProfile.address_line_1}, ${companyProfile.address_line_2 || ''}, ${companyProfile.city || ''}, ${companyProfile.state || ''} - ${companyProfile.pin_code || ''}`
            : '2/214B, 1ST FLOOR, M.L.A. ROAD, PUTHIAKAVU, TRIPUNITHURA, ERNAKULAM, KERALA 682307';
        
        const dlText = companyProfile?.company_name?.toLowerCase().includes('essar') 
            ? 'DL(20B)KL-EKM-145973, (21B)145974(20)KL-EKM-169674, (21)169675'
            : '';

        const numberToWords = (num) => {
            if (!num || isNaN(num)) return 'Zero';
            const parts = String(parseFloat(num).toFixed(2)).split('.');
            const whole = parseInt(parts[0]);
            const fraction = parseInt(parts[1]);
            
            const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
                          'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
            const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
            
            const convertLessThanOneThousand = (n) => {
                if (n === 0) return '';
                let str = '';
                if (n >= 100) {
                    str += ones[Math.floor(n / 100)] + ' Hundred ';
                    n %= 100;
                }
                if (n >= 20) {
                    str += tens[Math.floor(n / 10)] + ' ';
                    n %= 10;
                }
                if (n > 0) {
                    str += ones[n] + ' ';
                }
                return str.trim();
            };
            
            const convert = (n) => {
                if (n === 0) return 'Zero';
                let wordStr = '';
                if (n >= 10000000) {
                    wordStr += convertLessThanOneThousand(Math.floor(n / 10000000)) + ' Crore ';
                    n %= 10000000;
                }
                if (n >= 100000) {
                    wordStr += convertLessThanOneThousand(Math.floor(n / 100000)) + ' Lakh ';
                    n %= 100000;
                }
                if (n >= 1000) {
                    wordStr += convertLessThanOneThousand(Math.floor(n / 1000)) + ' Thousand ';
                    n %= 1000;
                }
                if (n > 0) {
                    wordStr += convertLessThanOneThousand(n);
                }
                return wordStr.trim();
            };
            
            let result = 'Indian Rupee ' + convert(whole);
            if (fraction > 0) {
                result += ' and ' + convertLessThanOneThousand(fraction) + ' Paise';
            }
            result += ' Only';
            return result;
        };

        const printContent = `
            <html>
            <head>
                <title>Tax Invoice - ${item.invoice_number}</title>
                <style>
                    body { 
                        font-family: Arial, Helvetica, sans-serif; 
                        padding: 10px; 
                        color: #000; 
                        font-size: 10px; 
                        line-height: 1.3; 
                    }
                    .invoice-container { 
                        border: 1.5px solid #000; 
                        padding: 12px; 
                        width: 100%; 
                        box-sizing: border-box; 
                    }
                    .header-table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin-bottom: 10px; 
                    }
                    .header-table td { 
                        border: none !important; 
                        padding: 0 !important; 
                    }
                    .logo-box { 
                        border: 1px solid #000; 
                        padding: 2px; 
                        display: inline-block; 
                        width: 58px; 
                        height: 58px; 
                        text-align: center; 
                        box-sizing: border-box; 
                    }
                    .logo-box-inner { 
                        border: 1.5px solid #000; 
                        width: 100%; 
                        height: 100%; 
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        font-size: 32px; 
                        font-weight: bold; 
                        color: #000; 
                        line-height: 1; 
                    }
                    .company-title { 
                        font-size: 17px; 
                        font-weight: bold; 
                        margin: 0 0 3px 0; 
                        text-transform: uppercase;
                        letter-spacing: 0.5px; 
                    }
                    .company-desc { 
                        font-size: 9px; 
                        color: #000; 
                        margin: 0; 
                        line-height: 1.3; 
                    }
                    .badge-box { 
                        border: 1px solid #000; 
                        padding: 5px 10px; 
                        text-align: center; 
                        width: 130px; 
                        box-sizing: border-box; 
                        font-size: 11px; 
                        font-weight: bold; 
                        float: right;
                    }
                    .badge-title { 
                        border-bottom: 1px solid #000; 
                        padding-bottom: 2px; 
                        margin-bottom: 2px; 
                    }
                    .inv-no-text { 
                        float: right; 
                        clear: right; 
                        font-size: 10px; 
                        font-weight: bold; 
                        margin-top: 6px; 
                    }
                    .grid-table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        border: 1.5px solid #000; 
                        margin-bottom: 10px; 
                    }
                    .grid-table td { 
                        border: 1px solid #000; 
                        padding: 6px; 
                        vertical-align: top; 
                    }
                    .inner-meta-table { 
                        width: 100%; 
                        border-collapse: collapse; 
                    }
                    .inner-meta-table td { 
                        border: none !important; 
                        padding: 3px 0 !important; 
                        font-size: 9.5px;
                    }
                    .inner-meta-table td.label { 
                        font-weight: bold; 
                        width: 90px; 
                    }
                    .section-title {
                        font-weight: bold; 
                        font-size: 10px; 
                        text-transform: uppercase; 
                        margin-bottom: 4px; 
                        border-bottom: 1px solid #000; 
                        padding-bottom: 2px;
                    }
                    .items-table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        border: 1.5px solid #000; 
                        margin-bottom: 10px; 
                    }
                    .items-table th, .items-table td { 
                        border: 1px solid #000; 
                        padding: 6px 5px; 
                        font-size: 9.5px; 
                        text-align: left;
                    }
                    .items-table th { 
                        background-color: #f3f4f6; 
                        font-weight: bold; 
                        text-transform: uppercase; 
                    }
                    .items-table td.text-right, .items-table th.text-right { 
                        text-align: right; 
                    }
                    .items-table td.text-center, .items-table th.text-center { 
                        text-align: center; 
                    }
                    .footer-table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        border: 1.5px solid #000;
                    }
                    .footer-table td { 
                        border: 1px solid #000; 
                        vertical-align: top; 
                        padding: 8px; 
                    }
                    .inner-totals-table { 
                        width: 100%; 
                        border-collapse: collapse; 
                    }
                    .inner-totals-table td { 
                        border: none !important; 
                        padding: 3.5px 0 !important; 
                        font-size: 9.5px;
                    }
                    .inner-totals-table tr.total-row td { 
                        border-top: 1px solid #000 !important; 
                        font-weight: bold; 
                        font-size: 10.5px; 
                        padding-top: 5px !important; 
                    }
                    .inner-totals-table tr.balance-row td { 
                        font-weight: bold; 
                        font-size: 10.5px; 
                    }
                </style>
            </head>
            <body>
                <div class="invoice-container">
                    <table class="header-table">
                        <tr>
                            <td style="width: 70px;">
                                <div class="logo-box">
                                    <div class="logo-box-inner">E</div>
                                </div>
                            </td>
                            <td>
                                <div class="company-title">${companyName}</div>
                                <div class="company-desc">
                                    ${addressText}<br>
                                    ${dlText ? `${dlText}<br>` : ''}
                                    PH: ${companyProfile?.phone || '+91 75589 13177'} | Email: ${companyProfile?.email || 'info@essarengineers.co.in'}<br>
                                    GSTIN: ${companyProfile?.service_tax_no || '32ATLPR3307D1ZZ'}
                                </div>
                            </td>
                            <td style="width: 200px; text-align: right; vertical-align: top;">
                                <div class="badge-box">
                                    <div class="badge-title">ORIGINAL</div>
                                    <div>INVOICE</div>
                                </div>
                                <div class="inv-no-text">INV NO: ${item.invoice_number}</div>
                            </td>
                        </tr>
                    </table>

                    <table class="grid-table">
                        <tr>
                            <td style="width: 40%; padding: 0;">
                                <table class="inner-meta-table" style="width: 100%; height: 100%;">
                                    <tr>
                                        <td class="label" style="padding-left: 8px !important; border-bottom: 1px solid #000 !important; border-right: 1px solid #000 !important;">INVOICE DATE</td>
                                        <td style="padding-left: 8px !important; border-bottom: 1px solid #000 !important;">: ${new Date(item.invoice_date).toLocaleDateString('en-IN')}</td>
                                    </tr>
                                    <tr>
                                        <td class="label" style="padding-left: 8px !important; border-bottom: 1px solid #000 !important; border-right: 1px solid #000 !important;">TERMS</td>
                                        <td style="padding-left: 8px !important; border-bottom: 1px solid #000 !important;">: ${item.payment_terms || item.terms || 'Due on Receipt'}</td>
                                    </tr>
                                    <tr>
                                        <td class="label" style="padding-left: 8px !important; border-bottom: 1px solid #000 !important; border-right: 1px solid #000 !important;">DUE DATE</td>
                                        <td style="padding-left: 8px !important; border-bottom: 1px solid #000 !important;">: ${item.due_date ? new Date(item.due_date).toLocaleDateString('en-IN') : '-'}</td>
                                    </tr>
                                    <tr>
                                        <td class="label" style="padding-left: 8px !important; border-right: 1px solid #000 !important;">P.O / REF</td>
                                        <td style="padding-left: 8px !important;">: ${item.order_number || item.po_no || '-'}</td>
                                    </tr>
                                </table>
                            </td>
                            <td style="width: 30%;">
                                <div class="section-title">BILL TO:</div>
                                <strong>${item.client?.patient_name || '-'}</strong><br>
                                ${item.client?.address ? `${item.client.address.replace(/\n/g, '<br>')}<br>` : ''}
                                ${item.client?.phone ? `Phone: ${item.client.phone}<br>` : ''}
                                ${item.client?.email ? `Email: ${item.client.email}` : ''}
                            </td>
                            <td style="width: 30%;">
                                <div class="section-title">SHIP TO:</div>
                                ${item.shipping_address ? `
                                    <strong>${item.client?.patient_name || '-'}</strong><br>
                                    ${item.shipping_address.replace(/\n/g, '<br>')}<br>
                                    ${item.client?.phone ? `Phone: ${item.client.phone}<br>` : ''}
                                ` : `
                                    <em>Same as billing address</em>
                                `}
                            </td>
                        </tr>
                    </table>

                    <table class="items-table">
                        <thead>
                            <tr>
                                <th class="text-center" style="width: 5%;">SL.NO</th>
                                <th style="width: 45%;">ITEM</th>
                                <th class="text-right" style="width: 10%;">MRP</th>
                                <th class="text-center" style="width: 12%;">HSN/SAC</th>
                                <th class="text-center" style="width: 8%;">QTY</th>
                                <th class="text-right" style="width: 10%;">RATE</th>
                                <th class="text-right" style="width: 10%;">AMOUNT</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(item.items || []).map((i, idx) => `
                                <tr>
                                    <td class="text-center">${idx + 1}</td>
                                    <td>${i.name || i.product?.name || '-'}</td>
                                    <td class="text-right">${formatCurrency(i.mrp || 0).replace('₹', '')}</td>
                                    <td class="text-center">${i.hsn_code || '-'}</td>
                                    <td class="text-center">
                                        ${i.quantity || i.qty}<br>
                                        <span style="font-size: 8px; color: #555;">${i.unit || 'Nos'}</span>
                                    </td>
                                    <td class="text-right">${formatCurrency(i.rate || i.price).replace('₹', '')}</td>
                                    <td class="text-right">${formatCurrency(i.amount || i.total).replace('₹', '')}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <table class="footer-table">
                        <tr>
                            <td style="width: 60%;">
                                <div style="font-style: italic; margin-bottom: 8px;">
                                    <strong>Total In Words:</strong><br>
                                    ${numberToWords(item.amount)}
                                </div>

                                ${bank ? `
                                <div style="margin-bottom: 8px; border-top: 1px solid #ccc; padding-top: 5px; font-size: 8.5px; line-height: 1.2;">
                                    <strong>ACCOUNT NAME:</strong> ${bank.account_name || companyName.toUpperCase()}<br>
                                    <strong>ACCOUNT NO:</strong> ${bank.account_number}<br>
                                    <strong>BANK NAME:</strong> ${bank.bank_name}<br>
                                    <strong>IFSC CODE:</strong> ${bank.ifsc_code}<br>
                                    ${bank.branch ? `<strong>BRANCH:</strong> ${bank.branch}<br>` : ''}
                                    <span style="font-size: 7.5px; color: #333;">IFSC CODE : " THE FIFTH CHARACTER IS " 0 " ( ZERO ) "</span>
                                </div>
                                ` : ''}

                                <div style="font-size: 8.5px; border-top: 1px solid #ccc; padding-top: 5px; line-height: 1.2;">
                                    <strong>TERMS AND CONDITIONS:</strong><br>
                                    <div style="white-space: pre-wrap; font-family: inherit;">${item.terms_conditions || '1. Goods once sold will not be taken back.'}</div>
                                </div>

                                <div style="margin-top: 30px; font-weight: bold; font-size: 9px;">
                                    RECEIVER SIGNATURE
                                </div>
                            </td>
                            <td style="width: 40%; padding: 0;">
                                <table class="inner-totals-table" style="width: 100%; height: 100%; padding: 8px;">
                                    <tr>
                                        <td style="padding-left: 8px !important;">SUB TOTAL</td>
                                        <td style="text-align: right; padding-right: 8px !important;">${formatCurrency(item.sub_total).replace('₹', '')}</td>
                                    </tr>
                                    ${item.cgst ? `
                                    <tr>
                                        <td style="padding-left: 8px !important;">CGST (${item.cgst_percent || 9}%)</td>
                                        <td style="text-align: right; padding-right: 8px !important;">${formatCurrency(item.cgst).replace('₹', '')}</td>
                                    </tr>
                                    ` : ''}
                                    ${item.sgst ? `
                                    <tr>
                                        <td style="padding-left: 8px !important;">SGST (${item.sgst_percent || 9}%)</td>
                                        <td style="text-align: right; padding-right: 8px !important;">${formatCurrency(item.sgst).replace('₹', '')}</td>
                                    </tr>
                                    ` : ''}
                                    ${item.shipping_charges ? `
                                    <tr>
                                        <td style="padding-left: 8px !important;">SHIPPING CHARGES</td>
                                        <td style="text-align: right; padding-right: 8px !important;">${formatCurrency(item.shipping_charges).replace('₹', '')}</td>
                                    </tr>
                                    ` : ''}
                                    ${item.discount_total || item.discount ? `
                                    <tr>
                                        <td style="padding-left: 8px !important;">DISCOUNT</td>
                                        <td style="text-align: right; padding-right: 8px !important;">-${formatCurrency(item.discount_total || item.discount).replace('₹', '')}</td>
                                    </tr>
                                    ` : ''}
                                    ${item.rounding ? `
                                    <tr>
                                        <td style="padding-left: 8px !important;">ROUNDING</td>
                                        <td style="text-align: right; padding-right: 8px !important;">${formatCurrency(item.rounding).replace('₹', '')}</td>
                                    </tr>
                                    ` : ''}
                                    <tr class="total-row">
                                        <td style="padding-left: 8px !important;">TOTAL</td>
                                        <td style="text-align: right; padding-right: 8px !important;">${formatCurrency(item.amount).replace('₹', '')}</td>
                                    </tr>
                                    <tr class="balance-row">
                                        <td style="padding-left: 8px !important; color: #333;">BALANCE DUE</td>
                                        <td style="text-align: right; padding-right: 8px !important;">${formatCurrency(item.amount).replace('₹', '')}</td>
                                    </tr>
                                </table>

                                <div style="margin-top: 40px; text-align: right; padding: 8px; font-size: 9px;">
                                    <div style="width: 140px; border-bottom: 1.5px solid #000; margin-left: auto; margin-bottom: 4px;"></div>
                                    <strong>SIGNED AUTHORITY</strong><br>
                                    <span style="font-size: 8px; color: #555;">For ${companyName}</span>
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>
            </body>
            </html>
        `;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        if (shouldPrint) {
            setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
        }
    };

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

    const sectionLabel = (text) => (
        <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: '#e53e3e', fontWeight: 600, fontSize: '12px' }}>
            {text}
        </Typography>
    );

    const rowLabel = (text, required = false) => (
        <Typography sx={{ fontSize: '13px', color: '#374151', fontWeight: 500 }}>
            {required && <span style={{ color: '#e53e3e' }}>*</span>} {text}
        </Typography>
    );

    return (
        <Box>
            <PageHeader title="Billing & Invoices" subtitle="Manage Tax Invoices"
                action={() => navigate('/billing/new')} actionLabel="New Invoice" />

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
                                ) : items.map((item) => (
                                    <TableRow key={item.id} hover>
                                        <TableCell><Typography variant="body2" fontWeight={700} color="primary">{item.invoice_number}</Typography></TableCell>
                                        <TableCell>{item.client?.patient_name || '-'}</TableCell>
                                        <TableCell>{formatDate(item.invoice_date)}</TableCell>
                                        <TableCell><Typography fontWeight={700}>{formatCurrency(item.amount)}</Typography></TableCell>
                                        <TableCell><StatusChip status={item.status} /></TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="View"><IconButton size="small" onClick={() => handlePrint(item, false)} color="primary"><Visibility fontSize="small" /></IconButton></Tooltip>
                                            <Tooltip title="Print/PDF"><IconButton size="small" onClick={() => handlePrint(item, true)} color="secondary"><Print fontSize="small" /></IconButton></Tooltip>
                                            <Tooltip title="Edit"><IconButton size="small" onClick={() => navigate(`/billing/${item.id}/edit`)} color="info"><Edit fontSize="small" /></IconButton></Tooltip>
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
        </Box>
    );
};

export default BillingPage;
