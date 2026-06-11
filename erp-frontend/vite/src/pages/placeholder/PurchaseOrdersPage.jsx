import React from 'react';
import { Typography, Box, Stack } from '@mui/material';
import MainCard from 'components/MainCard';
import ShoppingCartOutlined from '@ant-design/icons/ShoppingCartOutlined';

export default function PurchaseOrdersPage() {
  return (
    <MainCard title="Purchase Orders">
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <ShoppingCartOutlined style={{ fontSize: '64px', color: '#1890ff' }} />
          <Typography variant="h4">Purchase Orders</Typography>
          <Typography variant="body1" color="text.secondary">
            Create and track purchase orders with suppliers here. This module is under active development.
          </Typography>
        </Stack>
      </Box>
    </MainCard>
  );
}
