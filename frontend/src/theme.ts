import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#404040',
      light: '#606060',
      dark: '#202020',
    },
    secondary: {
      main: '#303030',
      light: '#505050',
      dark: '#101010',
    },
    background: {
      default: '#0a0a0a',
      paper: '#111111',
    },
    surface: {
      main: '#1a1a1a',
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#808080',
    },
    success: {
      main: '#606060',
    },
    error: {
      main: '#707070',
    },
    warning: {
      main: '#505050',
    },
    info: {
      main: '#404040',
    },
    divider: '#252525',
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 2,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 2,
          padding: '6px 12px',
          minHeight: 'unset',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          backgroundColor: '#202020',
          border: '1px solid #303030',
          '&:hover': {
            backgroundColor: '#303030',
            transform: 'none',
          },
        },
        outlined: {
          border: '1px solid #303030',
          '&:hover': {
            backgroundColor: '#1a1a1a',
            border: '1px solid #404040',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#111111',
          border: '1px solid #252525',
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0a0a0a',
          border: 'none',
          borderRight: '1px solid #252525',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: '#1a1a1a',
            '& fieldset': {
              borderColor: '#303030',
            },
            '&:hover fieldset': {
              borderColor: '#404040',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#505050',
            },
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          padding: '8px 16px',
          '&:hover': {
            backgroundColor: '#1a1a1a',
          },
          '&.Mui-selected': {
            backgroundColor: '#202020',
            '&:hover': {
              backgroundColor: '#252525',
            },
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontSize: '0.875rem',
          fontWeight: 500,
          minHeight: 40,
          padding: '6px 12px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#111111',
          border: '1px solid #252525',
          borderRadius: 2,
          boxShadow: 'none',
          transition: 'none',
          '&:hover': {
            transform: 'none',
            boxShadow: 'none',
            borderColor: '#303030',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '12px',
          '&:last-child': {
            paddingBottom: '12px',
          },
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '48px !important',
          padding: '0 8px !important',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: '6px',
          '&:hover': {
            backgroundColor: '#1a1a1a',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#252525',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0a0a0a',
          boxShadow: 'none',
          borderBottom: '1px solid #252525',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#111111',
          border: '1px solid #252525',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '12px',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '8px 12px',
        },
      },
    },
  },
});

// Extend the theme to include custom colors
declare module '@mui/material/styles' {
  interface Palette {
    surface: {
      main: string;
    };
  }
  interface PaletteOptions {
    surface?: {
      main: string;
    };
  }
}
