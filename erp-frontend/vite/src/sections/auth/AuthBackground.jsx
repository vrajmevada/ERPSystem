// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';

// ==============================|| AUTH BLUR BACK SVG ||============================== //

export default function AuthBackground() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'absolute',
        filter: 'blur(50px)',
        zIndex: -1,
        bottom: 0,
        left: 0,
        top: 0,
        right: 0,
        overflow: 'hidden',
        transform: 'inherit'
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 400 800" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Soft, modern ambient glowing circles */}
        <circle cx="50" cy="220" r="140" fill={theme.vars.palette.primary.light} opacity="0.35" />
        <circle cx="350" cy="480" r="180" fill={theme.vars.palette.primary.main} opacity="0.15" />
        <circle cx="100" cy="720" r="120" fill={theme.vars.palette.primary.dark} opacity="0.25" />
      </svg>
    </Box>
  );
}
