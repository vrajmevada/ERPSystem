import React from 'react';
import { List, ListItem, Typography, Divider, Box, Stack } from '@mui/material';
import MainCard from 'components/MainCard';

export default function PerformanceIndicatorsCard({ lowStockCount }) {
  const items = [
    { label: 'Monthly Recurring Revenue', value: '₹ 74K' },
    { label: 'Avg. Revenue per Employee', value: '₹ 25K' },
    { label: 'Low Stock Items', value: lowStockCount ?? '0' },
    { label: 'Day Payable Outstanding (DPO)', value: '9 Days' },
    { label: 'Day Sales Outstanding (DSO)', value: '12 Days' },
    { label: 'Inventory Turn Over Ratio', value: '6' }
  ];

  return (
    <MainCard title="Performance Indicators" sx={{ height: '100%' }}>
      <Box sx={{ px: 2, py: 1 }}>
        <List disablePadding>
          {items.map((item, index) => (
            <React.Fragment key={item.label}>
              <ListItem
                disableGutters
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  py: 1.75
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  {/* Small grey dot matching the mock */}
                  <Box sx={{ width: 6, height: 6, bgcolor: '#d9d9d9', borderRadius: '50%', flexShrink: 0 }} />
                  <Typography variant="body1" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                    {item.label}
                  </Typography>
                </Stack>
                <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                  {item.value}
                </Typography>
              </ListItem>
              {index < items.length - 1 && <Divider sx={{ opacity: 0.6 }} />}
            </React.Fragment>
          ))}
        </List>
      </Box>
    </MainCard>
  );
}
