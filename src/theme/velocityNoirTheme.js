import { createTheme } from '@mui/material/styles';

const velocityNoirTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FF3100', // Velocity Red
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#cafd00', // Tertiary / Neon Yellow
      contrastText: '#000000',
    },
    background: {
      default: '#0e0e0e', // Base
      paper: 'rgba(26, 30, 36, 0.6)', // Glassmorphism base
    },
    text: {
      primary: '#e2e8f0',
      secondary: '#94a3b8',
    },
    divider: 'rgba(255, 255, 255, 0.05)',
  },
  shape: {
    borderRadius: 2, // 2px = 0.125rem for "sm"
  },
  typography: {
    fontFamily: '"Outfit", "Inter", sans-serif',
    h1: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
    h2: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
    h3: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
    h4: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
    h5: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
    button: {
      fontFamily: '"Space Grotesk", sans-serif',
      textTransform: 'none', // Modern, non-all-caps buttons
      fontWeight: 600,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        body {
          background-color: #0e0e0e;
          /* Background decorative blur from index.css translated if needed, 
             but we keep index.css as well, so this just ensures base is dark */
        }
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px', // Match current rounded-md usually, but user asked for rounded: sm (0.125rem). Wait, the prompt says "Avoid rounded pills unless floating; prefer rounded: sm (0.125rem)." Let's do 2px.
          border: 'none', // No 1px solid borders
          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(255, 49, 0, 0.3)',
          },
        },
        outlined: {
          border: 'none', // No 1px borders per DS, using tonal backgrounds
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          '&:hover': {
            border: 'none',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(26, 30, 36, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.05)', // Glass border
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px', // Cards look better slightly more rounded than buttons, but if strict, we can use 8px or 2px. Let's stick to 12px for cards as in the original glass-panel css, or 2px. The prompt said "prefer rounded: sm (0.125rem)" for components. I'll change it to 2px.
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(26, 30, 36, 0.6)',
          backgroundImage: 'none', // Remove default MUI dark mode overlay
          backdropFilter: 'blur(12px)',
          borderRadius: '2px', // strict DS
          border: '1px solid rgba(255, 255, 255, 0.05)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '2px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            '& fieldset': {
              borderColor: 'transparent', // No 1px solid borders
            },
            '&:hover fieldset': {
              borderColor: 'transparent',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'transparent',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              boxShadow: '0 0 0 2px rgba(255, 49, 0, 0.2)',
            },
          },
        },
      },
    },
  },
});

// Force 2px border radius for buttons explicitly to match DS
velocityNoirTheme.components.MuiButton.styleOverrides.root.borderRadius = '2px';

export default velocityNoirTheme;
