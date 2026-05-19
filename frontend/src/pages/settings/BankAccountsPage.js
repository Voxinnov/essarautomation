import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Switch, FormControlLabel
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import api from '../../services/api';

const BankAccountsPage = () => {
    const [accounts, setAccounts] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        bank_name: '', account_name: '', account_number: '',
        ifsc_code: '', branch: '', upi_id: '', is_active: true
    });
    const [qrFile, setQrFile] = useState(null);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const res = await api.get('/bank-accounts');
            setAccounts(res.data.data);
        } catch (error) {
            console.error('Error fetching bank accounts:', error);
        }
    };

    const handleOpen = (account = null) => {
        if (account) {
            setEditingId(account.id);
            setFormData({
                bank_name: account.bank_name,
                account_name: account.account_name,
                account_number: account.account_number,
                ifsc_code: account.ifsc_code,
                branch: account.branch || '',
                upi_id: account.upi_id || '',
                is_active: account.is_active
            });
            setQrFile(null);
        } else {
            setEditingId(null);
            setFormData({
                bank_name: '', account_name: '', account_number: '',
                ifsc_code: '', branch: '', upi_id: '', is_active: true
            });
            setQrFile(null);
        }
        setOpenDialog(true);
    };

    const handleClose = () => {
        setOpenDialog(false);
        setEditingId(null);
    };

    const handleSave = async () => {
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            if (qrFile) {
                data.append('qr_code', qrFile);
            }

            if (editingId) {
                await api.put(`/bank-accounts/${editingId}`, data, { headers: { 'Content-Type': 'multipart/form-data' }});
            } else {
                await api.post('/bank-accounts', data, { headers: { 'Content-Type': 'multipart/form-data' }});
            }
            fetchAccounts();
            handleClose();
        } catch (error) {
            console.error('Error saving bank account:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this bank account?')) {
            try {
                await api.delete(`/bank-accounts/${id}`);
                fetchAccounts();
            } catch (error) {
                console.error('Error deleting bank account:', error);
            }
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>Bank Accounts Management</Typography>
                <Button variant="contained" color="primary" startIcon={<Add />} onClick={() => handleOpen()}>
                    Add Bank Account
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Bank Name</TableCell>
                            <TableCell>Account Name</TableCell>
                            <TableCell>Account Number</TableCell>
                            <TableCell>IFSC Code</TableCell>
                            <TableCell>UPI ID</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {accounts.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>{row.bank_name}</TableCell>
                                <TableCell>{row.account_name}</TableCell>
                                <TableCell>{row.account_number}</TableCell>
                                <TableCell>{row.ifsc_code}</TableCell>
                                <TableCell>{row.upi_id}</TableCell>
                                <TableCell>{row.is_active ? 'Active' : 'Inactive'}</TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" color="primary" onClick={() => handleOpen(row)}><Edit /></IconButton>
                                    <IconButton size="small" color="error" onClick={() => handleDelete(row.id)}><Delete /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{editingId ? 'Edit Bank Account' : 'Add Bank Account'}</DialogTitle>
                <DialogContent>
                    <TextField fullWidth margin="dense" label="Bank Name" value={formData.bank_name} onChange={(e) => setFormData({...formData, bank_name: e.target.value})} required />
                    <TextField fullWidth margin="dense" label="Account Name" value={formData.account_name} onChange={(e) => setFormData({...formData, account_name: e.target.value})} required />
                    <TextField fullWidth margin="dense" label="Account Number" value={formData.account_number} onChange={(e) => setFormData({...formData, account_number: e.target.value})} required />
                    <TextField fullWidth margin="dense" label="IFSC Code" value={formData.ifsc_code} onChange={(e) => setFormData({...formData, ifsc_code: e.target.value})} required />
                    <TextField fullWidth margin="dense" label="Branch" value={formData.branch} onChange={(e) => setFormData({...formData, branch: e.target.value})} />
                    <TextField fullWidth margin="dense" label="UPI ID" value={formData.upi_id} onChange={(e) => setFormData({...formData, upi_id: e.target.value})} />
                    
                    <Box sx={{ mt: 2, mb: 1 }}>
                        <Typography variant="caption" color="textSecondary">Upload QR Code</Typography>
                        <input type="file" accept="image/*" style={{ display: 'block', marginTop: '8px' }} onChange={(e) => setQrFile(e.target.files[0])} />
                    </Box>

                    <FormControlLabel
                        control={<Switch checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} />}
                        label="Active Status"
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BankAccountsPage;
