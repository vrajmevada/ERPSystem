import React, { useState } from 'react';
import { Box, Typography, Stack, Chip, FormControl, Select, MenuItem } from '@mui/material';
import MainCard from 'components/MainCard';
import NetProfitLossChart from './NetProfitLossChart';
import ArrowUpOutlined from '@ant-design/icons/ArrowUpOutlined';

const dataSets = {
  'this-year': {
    total: '₹ 60,12,147.75',
    percentage: '15%',
    data: [50, 45, 75, 30, 55, 40, 75, 55, 30, 50, 72, 60]
  },
  'last-year': {
    total: '₹ 51,45,280.20',
    percentage: '12%',
    data: [42, 40, 68, 35, 50, 45, 70, 50, 35, 48, 65, 55]
  }
};

export default function NetProfitLossCard() {
  const [range, setRange] = useState('this-year');
  const currentData = dataSets[range];

  return (
    <MainCard
      title="Net Profit/Loss"
      secondary={
        <FormControl size="small" variant="standard" sx={{ m: 0 }}>
          <Select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            disableUnderline
            sx={{
              fontSize: '0.85rem',
              color: 'text.secondary',
              fontWeight: 500,
              cursor: 'pointer',
              bgcolor: 'transparent',
              '& .MuiSelect-select': { pr: 2.5, py: 0.5 }
            }}
          >
            <MenuItem value="this-year">This Year</MenuItem>
            <MenuItem value="last-year">Last Year</MenuItem>
          </Select>
        </FormControl>
      }
    >
      <Box sx={{ p: 2, pt: 0 }}>
        {/* Inner Label */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          Net Profit/Loss
        </Typography>

        {/* Large total and green badge */}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
          <Typography variant="h3" fontWeight="bold">
            {currentData.total}
          </Typography>
          <Chip
            icon={<ArrowUpOutlined style={{ color: '#52c41a', fontSize: '0.75rem' }} />}
            label={currentData.percentage}
            size="small"
            sx={{
              bgcolor: '#f6ffed',
              color: '#52c41a',
              border: '1px solid #b7eb8f',
              fontWeight: 'bold',
              height: 20,
              fontSize: '0.75rem',
              '& .MuiChip-icon': { ml: 0.5, mr: -0.25 }
            }}
          />
        </Stack>
        <NetProfitLossChart data={currentData.data} />
      </Box>
    </MainCard>
  );
}
