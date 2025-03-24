import { forwardRef, ReactNode } from 'react';
import { 
  Alert as MuiAlert, 
  AlertProps as MuiAlertProps,
  Snackbar,
  SnackbarProps,
  AlertTitle,
  Box
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface AlertProps extends MuiAlertProps {
  title?: string;
  action?: ReactNode;
}

// Custom styled alert
const StyledAlert = forwardRef<HTMLDivElement, AlertProps>(
  function StyledAlert(props, ref) {
    const { title, action, children, ...alertProps } = props;

    const getIcon = () => {
      switch (props.severity) {
        case 'success':
          return <CheckCircleOutlineIcon fontSize="inherit" />;
        case 'error':
          return <ErrorOutlineIcon fontSize="inherit" />;
        case 'warning':
          return <WarningAmberIcon fontSize="inherit" />;
        case 'info':
          return <InfoOutlinedIcon fontSize="inherit" />;
        default:
          return <InfoOutlinedIcon fontSize="inherit" />;
      }
    };

    return (
      <MuiAlert
        ref={ref}
        variant="filled"
        icon={getIcon()}
        {...alertProps}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>{children}</div>
          {action && <Box sx={{ ml: 2 }}>{action}</Box>}
        </Box>
      </MuiAlert>
    );
  }
);

// SnackbarAlert combines Alert with Snackbar for notifications
interface SnackbarAlertProps extends SnackbarProps {
  severity?: 'success' | 'info' | 'warning' | 'error';
  title?: string;
  message: ReactNode;
}

export const SnackbarAlert = ({ 
  severity = 'info', 
  title, 
  message, 
  ...snackbarProps 
}: SnackbarAlertProps) => {
  return (
    <Snackbar {...snackbarProps}>
      <StyledAlert severity={severity} title={title}>
        {message}
      </StyledAlert>
    </Snackbar>
  );
};


const Alert = StyledAlert;
export default Alert;