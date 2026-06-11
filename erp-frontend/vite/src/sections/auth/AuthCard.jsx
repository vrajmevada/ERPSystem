import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'components/MainCard';

// ==============================|| AUTHENTICATION - CARD WRAPPER ||============================== //

export default function AuthCard({ children, ...other }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        maxWidth: { xs: 400, sm: 475 },
        margin: { xs: 2.5, md: 3 },
        background: 'rgba(255, 255, 255, 0.72)', // Semi-transparent glass background
        backdropFilter: 'blur(24px)', // Soft blur showing background details
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: '20px', // Premium rounded corners
        border: '1px solid rgba(255, 255, 255, 0.8)', // Border highlight
        boxShadow: '0 8px 32px 0 rgba(22, 119, 255, 0.08)', // Ambient glow shadow
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        '&:hover': {
          transform: 'translateY(-4px)', // Soft rise on hover
          boxShadow: '0 16px 48px 0 rgba(22, 119, 255, 0.15)',
          border: '1px solid rgba(22, 119, 255, 0.25)'
        },
        overflow: 'hidden'
      }}
      {...other}
    >
      <Box sx={{ p: { xs: 3, sm: 4, md: 5 } }}>{children}</Box>
    </Box>
  );
}

AuthCard.propTypes = { children: PropTypes.any, other: PropTypes.any };
