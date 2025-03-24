import { ReactNode } from 'react';
import { 
  Button as MuiButton, 
  ButtonProps as MuiButtonProps,
  CircularProgress,
  styled
} from '@mui/material';

interface ButtonProps extends MuiButtonProps {
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'start' | 'end';
}

const StyledButton = styled(MuiButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: 'none',
  '&:hover': {
    boxShadow: 'none',
  },
  '&.MuiButton-containedPrimary': {
    backgroundColor: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    }
  },
  '&.MuiButton-containedSecondary': {
    backgroundColor: theme.palette.secondary.main,
    '&:hover': {
      backgroundColor: theme.palette.secondary.dark,
    }
  },
  '&.MuiButton-outlinedPrimary': {
    borderColor: theme.palette.primary.main,
    '&:hover': {
      borderColor: theme.palette.primary.dark,
      backgroundColor: 'rgba(46, 125, 50, 0.04)',
    }
  },
  '&.MuiButton-sizeSmall': {
    padding: '4px 12px',
    fontSize: '0.8125rem',
  },
  '&.MuiButton-sizeMedium': {
    padding: '8px 20px',
    fontSize: '0.875rem',
  },
  '&.MuiButton-sizeLarge': {
    padding: '10px 24px',
    fontSize: '0.9375rem',
  },
}));

const Button = ({
  children,
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'start',
  ...props
}: ButtonProps) => {
  return (
    <StyledButton
      {...props}
      disabled={disabled || loading}
      startIcon={iconPosition === 'start' && !loading ? icon : undefined}
      endIcon={iconPosition === 'end' && !loading ? icon : undefined}
    >
      {loading ? (
        <>
          <CircularProgress
            size={24}
            thickness={4}
            sx={{ 
              color: 'inherit', 
              position: 'absolute',
              left: '50%',
              marginLeft: '-12px'
            }}
          />
          <span style={{ visibility: 'hidden' }}>{children}</span>
        </>
      ) : (
        children
      )}
    </StyledButton>
  );
};

export default Button;