import React from 'react';
import { Typography, Box, Stack } from '@mui/material';
import MainCard from 'components/MainCard';
import UserOutlined from '@ant-design/icons/UserOutlined';

export default function CustomersPage() {
  return (
    <MainCard title="Customers">
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <UserOutlined style={{ fontSize: '64px', color: '#1890ff' }} />
          <Typography variant="h4">Customers Management</Typography>
          <Typography variant="body1" color="text.secondary">
            Manage customer records, contact information, and relationships here. This module is under active development.
          </Typography>
        </Stack>
      </Box>
    </MainCard>
  );
}
