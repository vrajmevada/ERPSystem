import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { useLocation, matchPath } from 'react-router-dom';

// material-ui
import Collapse from '@mui/material/Collapse';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

// icons
import DownOutlined from '@ant-design/icons/DownOutlined';
import UpOutlined from '@ant-design/icons/UpOutlined';

// project import
import NavItem from './NavItem';
import { useGetMenuMaster } from 'api/menu';

export default function NavCollapse({ item, level }) {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  const { pathname } = useLocation();

  // Check if any child route is currently active
  const isSelected = item.children?.some((child) =>
    !!matchPath({ path: child.url, end: false }, pathname)
  );

  const [open, setOpen] = useState(isSelected);

  useEffect(() => {
    if (isSelected) {
      setOpen(true);
    }
  }, [pathname, isSelected]);

  const handleClick = (e) => {
    setOpen(!open);
  };

  const Icon = item.icon;
  const itemIcon = item.icon ? (
    <Icon style={{ fontSize: drawerOpen ? '1rem' : '1.25rem' }} />
  ) : (
    false
  );

  const textColor = 'text.primary';
  const iconSelectedColor = 'primary.main';

  return (
    <>
      <ListItemButton
        onClick={handleClick}
        selected={isSelected}
        sx={{
          zIndex: 1201,
          pl: drawerOpen ? `${level * 24}px` : 1.5,
          py: !drawerOpen && level === 1 ? 1.25 : 1,
          ...(drawerOpen && {
            '&:hover': { bgcolor: 'primary.lighter' },
            '&.Mui-selected': {
              bgcolor: 'primary.lighter',
              color: iconSelectedColor,
              '&:hover': { color: iconSelectedColor, bgcolor: 'primary.lighter' }
            }
          }),
          ...(!drawerOpen && {
            '&:hover': { bgcolor: 'transparent' },
            '&.Mui-selected': { '&:hover': { bgcolor: 'transparent' }, bgcolor: 'transparent' }
          })
        }}
      >
        {itemIcon && (
          <ListItemIcon
            sx={{
              minWidth: 28,
              color: isSelected ? iconSelectedColor : textColor,
              ...(!drawerOpen && {
                borderRadius: 1.5,
                width: 36,
                height: 36,
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': { bgcolor: 'secondary.lighter' }
              }),
              ...(!drawerOpen &&
                isSelected && {
                  bgcolor: 'primary.lighter',
                  '&:hover': { bgcolor: 'primary.lighter' }
                })
            }}
          >
            {itemIcon}
          </ListItemIcon>
        )}
        
        {drawerOpen && (
          <ListItemText
            primary={
              <Typography variant="h6" sx={{ color: isSelected ? iconSelectedColor : textColor, fontWeight: isSelected ? 500 : 400 }}>
                {item.title}
              </Typography>
            }
          />
        )}

        {drawerOpen && (
          open ? (
            <UpOutlined style={{ fontSize: '0.625rem', marginTop: '0.15rem' }} />
          ) : (
            <DownOutlined style={{ fontSize: '0.625rem', marginTop: '0.15rem' }} />
          )
        )}
      </ListItemButton>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding sx={{ pl: drawerOpen ? 1.5 : 0 }}>
          {item.children?.map((child) => (
            <NavItem key={child.id} item={child} level={level + 1} />
          ))}
        </List>
      </Collapse>
    </>
  );
}

NavCollapse.propTypes = {
  item: PropTypes.object,
  level: PropTypes.number
};
