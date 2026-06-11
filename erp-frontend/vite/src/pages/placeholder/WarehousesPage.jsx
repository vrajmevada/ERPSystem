import React from 'react';
import { Typography, Box, Stack } from '@mui/material';
import MainCard from 'components/MainCard';
import DatabaseOutlined from '@ant-design/icons/DatabaseOutlined';

export default function WarehousesPage() {
  return (
    <MainCard title="Warehouses">
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <DatabaseOutlined style={{ fontSize: '64px', color: '#1890ff' }} />
          <Typography variant="h4">Warehouses Management</Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor inventory levels, warehouse locations, and stock capacities here. This module is under active development.
          </Typography>
        </Stack>
      </Box>
    </MainCard>
  );
}
