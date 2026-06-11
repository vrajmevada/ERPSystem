import React from 'react';
import { Typography, Box, Stack } from '@mui/material';
import MainCard from 'components/MainCard';
import SwapOutlined from '@ant-design/icons/SwapOutlined';

export default function TransactionsPage() {
  return (
    <MainCard title="Transactions">
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <SwapOutlined style={{ fontSize: '64px', color: '#1890ff' }} />
          <Typography variant="h4">Inventory Transactions</Typography>
          <Typography variant="body1" color="text.secondary">
            Track product movements, transfers, stock adjustments, and history here. This module is under active development.
          </Typography>
        </Stack>
      </Box>
    </MainCard>
  );
}
