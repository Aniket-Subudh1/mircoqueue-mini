import { ReactNode } from 'react';
import { 
  Card as MuiCard, 
  CardContent, 
  CardHeader, 
  CardActions, 
  Typography, 
  IconButton,
  Box,
  Skeleton,
  Divider
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  loading?: boolean;
  footer?: ReactNode;
  height?: number | string;
  onClick?: () => void;
  hoverable?: boolean;
}

const Card = ({
  title,
  subtitle,
  children,
  action,
  loading = false,
  footer,
  height,
  onClick,
  hoverable = false,
}: CardProps) => {
  const cardStyle = {
    height: height ? height : 'auto',
    cursor: onClick || hoverable ? 'pointer' : 'default',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': (onClick || hoverable) ? {
      transform: 'translateY(-4px)',
      boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
    } : {},
  };

  return (
    <MuiCard
      sx={cardStyle}
      onClick={onClick}
    >
      {(title || subtitle) && (
        <CardHeader
          title={
            loading ? (
              <Skeleton animation="wave" height={20} width="80%" />
            ) : (
              title
            )
          }
          subheader={
            loading ? (
              <Skeleton animation="wave" height={18} width="40%" />
            ) : (
              subtitle
            )
          }
          action={
            action && (
              <Box>
                {action}
              </Box>
            )
          }
        />
      )}
      <CardContent>
        {loading ? (
          <Box sx={{ px: 2, py: 1 }}>
            <Skeleton animation="wave" height={16} width="100%" />
            <Skeleton animation="wave" height={16} width="90%" />
            <Skeleton animation="wave" height={16} width="60%" />
          </Box>
        ) : (
          children
        )}
      </CardContent>
      {footer && (
        <>
          <Divider />
          <CardActions>
            {footer}
          </CardActions>
        </>
      )}
    </MuiCard>
  );
};

export default Card;