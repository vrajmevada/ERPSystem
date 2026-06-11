import React, { useState } from 'react';
import { Box, Typography, Stack, FormControl, Select, MenuItem } from '@mui/material';
import MainCard from 'components/MainCard';
import ArrowUpOutlined from '@ant-design/icons/ArrowUpOutlined';

const datasets = {
  receivable: {
    title: 'Receivable Summary',
    subtitle: 'Total Unpaid Invoice',
    'this-year': {
      total: '₹ 2,50,000.00',
      percentage: '7%',
      segments: [
        { label: 'Current', value: '₹ 1,57,500', percentage: 63, color: '#1677ff' },
        { label: 'Overdue', value: '₹ 92,500', percentage: 37, color: '#ff9c6e' }
      ]
    },
    'last-year': {
      total: '₹ 1,85,000.00',
      percentage: '4%',
      segments: [
        { label: 'Current', value: '₹ 1,15,000', percentage: 62, color: '#1677ff' },
        { label: 'Overdue', value: '₹ 70,000', percentage: 38, color: '#ff9c6e' }
      ]
    }
  },
  payable: {
    title: 'Payable Summary',
    subtitle: 'Total Unpaid Amount',
    'this-year': {
      total: '₹ 18,80,000.00',
      percentage: '9%',
      segments: [
        { label: 'Bills', value: '₹ 6,50,000', percentage: 35, color: '#1677ff' },
        { label: 'Advance', value: '₹ 2,30,000', percentage: 12, color: '#ff9c6e' },
        { label: 'Payroll', value: '₹ 10,00,000', percentage: 53, color: '#fadb14' }
      ]
    },
    'last-year': {
      total: '₹ 14,20,000.00',
      percentage: '6%',
      segments: [
        { label: 'Bills', value: '₹ 4,80,000', percentage: 34, color: '#1677ff' },
        { label: 'Advance', value: '₹ 1,80,000', percentage: 13, color: '#ff9c6e' },
        { label: 'Payroll', value: '₹ 7,60,000', percentage: 53, color: '#fadb14' }
      ]
    }
  }
};

export default function SegmentedSummaryCard({ type = 'receivable' }) {
  const [range, setRange] = useState('this-year');
  const data = datasets[type];
  const currentData = data[range];

  return (
    <MainCard
      title={data.title}
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
        {/* Subtitle label */}
        <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
          {data.subtitle}
        </Typography>

        {/* Large amount and trend indicator */}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
          <Typography variant="h3" fontWeight="bold">
            {currentData.total}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.25} sx={{ color: 'error.main' }}>
            <ArrowUpOutlined style={{ fontSize: '0.85rem', color: 'inherit' }} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'inherit' }}>
              {currentData.percentage}
            </Typography>
          </Stack>
        </Stack>

        {/* Segmented Horizontal Bar with Gaps */}
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            height: 14,
            borderRadius: '6px',
            overflow: 'hidden',
            bgcolor: 'grey.100',
            mb: 2.5
          }}
        >
          {currentData.segments.map((seg, idx) => (
            <Box
              key={idx}
              sx={{
                width: `${seg.percentage}%`,
                height: '100%',
                bgcolor: seg.color,
                ...(idx < currentData.segments.length - 1 && {
                  borderRight: (theme) => `3px solid ${theme.vars.palette.background.paper}`
                })
              }}
            />
          ))}
        </Box>

        {/* Legends / Labels */}
        <Stack direction="row" flexWrap="wrap" sx={{ gap: 2 }}>
          {currentData.segments.map((seg, idx) => (
            <Stack key={idx} direction="row" alignItems="center" spacing={1}>
              <Box sx={{ width: 8, height: 8, bgcolor: seg.color, borderRadius: '50%' }} />
              <Typography variant="body2" color="text.secondary">
                {seg.label} :{' '}
                <Typography variant="body2" component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {seg.value}
                </Typography>
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    </MainCard>
  );
}
