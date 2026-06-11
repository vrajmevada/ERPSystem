// material-ui
import { useTheme } from '@mui/material/styles';

// ==============================|| LOGO SVG ||============================== //

export default function LogoMain() {
  const theme = useTheme();
  return (
    <svg width="150" height="35" viewBox="0 0 150 35" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 3D Isometric Cube Icon (Left side) */}
      {/* Floated Top face */}
      <path d="M17.5 3 L27.5 9 L17.5 15 L7.5 9 Z" fill={theme.vars.palette.primary.light} />
      {/* Left face */}
      <path d="M7.5 11 L17.5 17 L17.5 29 L7.5 23 Z" fill={theme.vars.palette.primary.main} />
      {/* Right face */}
      <path d="M17.5 17 L27.5 11 L27.5 23 L17.5 29 Z" fill={theme.vars.palette.primary.dark} />
      
      {/* Accent Line/Dot on the Cube */}
      <circle cx="17.5" cy="11" r="2" fill="#ffffff" opacity="0.8" />

      {/* Brand Text */}
      <text
        x="38"
        y="23"
        fill={theme.vars.palette.text.primary}
        fontSize="16"
        fontWeight="800"
        fontFamily="inherit"
        letterSpacing="0.05em"
      >
        ERP SYSTEM
      </text>
    </svg>
  );
}
