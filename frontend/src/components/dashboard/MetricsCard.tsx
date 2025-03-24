import { ReactNode } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import Card from '@/components/common/Card';

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: number;
  loading?: boolean;
  onClick?: () => void;
  height?: number | string;
  color?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
}

const MetricsCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  loading = false,
  onClick,
  height = 160,
  color = 'primary',
}: MetricsCardProps) => {
  const theme = useTheme();
  
  const getColorValue = () => {
    switch (color) {
      case 'primary':
        return theme.palette.primary.main;
      case 'secondary':
        return theme.palette.secondary.main;
      case 'info':
        return theme.palette.info.main;
      case 'success':
        return theme.palette.success.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'error':
        return theme.palette.error.main;
      default:
        return theme.palette.primary.main;
    }
  };
  
  const colorValue = getColorValue();
  
  return (
    <Card
      loading={loading}
      height={height}
      onClick={onClick}
      hoverable={!!onClick}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h4" color={colorValue} sx={{ my: 1, fontWeight: 500 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
          {trend !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              {trend > 0 ? (
                <ArrowUpwardIcon fontSize="small" color="success" />
              ) : (
                <ArrowDownwardIcon fontSize="small" color="error" />
              )}
              <Typography variant="body2" color={trend > 0 ? 'success.main' : 'error.main'} sx={{ ml: 0.5 }}>
                {Math.abs(trend)}%
              </Typography>
            </Box>
          )}
        </Box>
        {icon && (
          <Box 
            sx={{ 
              backgroundColor: `${colorValue}20`, 
              p: 1.5, 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colorValue
            }}
          >
            {icon}
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default MetricsCard;