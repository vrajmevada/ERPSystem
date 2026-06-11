import React from 'react';
import { Typography, Box, Stack } from '@mui/material';
import MainCard from 'components/MainCard';
import TruckOutlined from '@ant-design/icons/TruckOutlined';

export default function SuppliersPage() {
  return (
    <MainCard title="Suppliers">
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <TruckOutlined style={{ fontSize: '64px', color: '#1890ff' }} />
          <Typography variant="h4">Suppliers Management</Typography>
          <Typography variant="body1" color="text.secondary">
            Manage vendor profiles, supply lines, and supplier contact details here. This module is under active development.
          </Typography>
        </Stack>
      </Box>
    </MainCard>
  );
}
