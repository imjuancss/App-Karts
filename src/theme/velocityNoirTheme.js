import { createTheme } from '@mui/material/styles';

const velocityNoirTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FF3100',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#cafd00',
      contrastText: '#000000',
    },
    background: {
      default: '#0A0A0A',
      paper: 'rgba(18, 18, 18, 0.6)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#8C8C8C',
    },
    divider: 'rgba(255, 255, 255, 0.04)',
  },
  shape: {
    borderRadius: 2,
  },
  typography: {
    fontFamily: '"Space Grotesk", sans-serif',
    h1: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, letterSpacing: '-0.02em' },
    h2: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, letterSpacing: '-0.02em' },
    h3: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, letterSpacing: '-0.02em' },
    h4: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, letterSpacing: '-0.02em' },
    h5: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, letterSpacing: '-0.02em' },
    h6: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, letterSpacing: '-0.02em' },
    button: {
      fontFamily: '"Space Grotesk", sans-serif',
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        body {
          background-color: #0A0A0A;
        }
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '2px',
          border: 'none',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 20px rgba(255, 49, 0, 0.3)',
          },
        },
        outlined: {
          border: 'none',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          '&:hover': {
            border: 'none',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            transform: 'translateY(-1px)',
            boxShadow: '0 0 20px rgba(255, 49, 0, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(18, 18, 18, 0.6)',
          backgroundImage: 'none',
          backdropFilter: 'blur(20px) saturate(1.2)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
          borderRadius: '2px',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(18, 18, 18, 0.6)',
          backgroundImage: 'none',
          backdropFilter: 'blur(20px)',
          borderRadius: '2px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '2px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.04)',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.08)',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'transparent',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              boxShadow: '0 0 0 2px rgba(255, 49, 0, 0.12), 0 0 20px rgba(255, 49, 0, 0.04)',
            },
          },
        },
      },
    },
  },
});

export default velocityNoirTheme;
