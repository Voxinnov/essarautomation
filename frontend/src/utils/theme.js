import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#8a0303',
            light: '#c13b2b',
            dark: '#5a0000',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#455a64',
            light: '#718792',
            dark: '#1c313a',
            contrastText: '#ffffff',
        },
        success: { main: '#2e7d32' },
        warning: { main: '#f57c00' },
        error: { main: '#c62828' },
        background: {
            default: '#f0f2f5',
            paper: '#ffffff',
        },
        text: {
            primary: '#1a1a2e',
            secondary: '#546e7a',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", Arial, sans-serif',
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 600 },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    boxShadow: 'none',
                    '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(0,0,0,0.05)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: { borderRadius: 16 },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    backgroundColor: '#f5f5f5',
                    fontWeight: 600,
                    color: '#1a1a2e',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: { fontWeight: 600, borderRadius: 8 },
            },
        },
        MuiFormControl: {
            defaultProps: {
                fullWidth: true, // Force full width by default
            },
            styleOverrides: {
                root: {
                    width: '100%',
                    minWidth: 120,
                },
            },
        },
        MuiSelect: {
            defaultProps: {
                fullWidth: true,
            },
            styleOverrides: {
                root: {
                    width: '100%',
                },
            },
        },
    },
});

export default theme;
