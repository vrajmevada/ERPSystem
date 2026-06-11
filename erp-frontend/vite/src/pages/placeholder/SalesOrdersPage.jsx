import React from 'react';
import { Typography, Box, Stack } from '@mui/material';
import MainCard from 'components/MainCard';
import FileDoneOutlined from '@ant-design/icons/FileDoneOutlined';

export default function SalesOrdersPage() {
  return (
    <MainCard title="Sales Orders">
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <FileDoneOutlined style={{ fontSize: '64px', color: '#1890ff' }} />
          <Typography variant="h4">Sales Orders</Typography>
          <Typography variant="body1" color="text.secondary">
            Create and track customer sales orders and shipments here. This module is under active development.
          </Typography>
        </Stack>
      </Box>
    </MainCard>
  );
}
