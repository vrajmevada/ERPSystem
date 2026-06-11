// material-ui
import { useTheme } from '@mui/material/styles';

// ==============================|| LOGO ICON SVG ||============================== //

export default function LogoIcon() {
  const theme = useTheme();

  return (
    <svg width="35" height="35" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Floated Top face */}
      <path d="M17.5 3 L27.5 9 L17.5 15 L7.5 9 Z" fill={theme.vars.palette.primary.light} />
      {/* Left face */}
      <path d="M7.5 11 L17.5 17 L17.5 29 L7.5 23 Z" fill={theme.vars.palette.primary.main} />
      {/* Right face */}
      <path d="M17.5 17 L27.5 11 L27.5 23 L17.5 29 Z" fill={theme.vars.palette.primary.dark} />
      
      {/* Accent Line/Dot on the Cube */}
      <circle cx="17.5" cy="11" r="2" fill="#ffffff" opacity="0.8" />
    </svg>
  );
}
