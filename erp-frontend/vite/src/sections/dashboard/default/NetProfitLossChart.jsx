import React from 'react';
import { useTheme } from '@mui/material/styles';
import { LineChart } from '@mui/x-charts/LineChart';
import { chartsGridClasses, lineClasses, axisClasses } from '@mui/x-charts';

const monthlyLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const defaultMonthlyData = [50, 45, 75, 30, 55, 40, 75, 55, 30, 50, 72, 60];

export default function NetProfitLossChart({ data = defaultMonthlyData }) {
  const theme = useTheme();
  const lineColor = theme.palette.primary.main;

  return (
    <LineChart
      grid={{ horizontal: true, vertical: false }}
      xAxis={[{ scaleType: 'point', data: monthlyLabels, tickSize: 0, disableLine: true }]}
      yAxis={[{ tickSize: 0, disableLine: true, valueFormatter: (value) => `${value}L` }]}
      height={300}
      margin={{ top: 20, bottom: 20, right: 10, left: 35 }}
      series={[{
        type: 'line',
        data: data,
        showMark: false,
        area: true,
        id: 'profit-loss',
        color: lineColor,
        curve: 'catmullRom'
      }]}
      sx={{
        [`& .${chartsGridClasses.line}`]: { 
          strokeDasharray: '4 4', 
          stroke: theme.palette.divider 
        },
        [`& .${lineClasses.line}`]: {
          stroke: lineColor,
          strokeWidth: 2.5
        },
        [`& .${lineClasses.area}`]: {
          '&[data-series-id="profit-loss"]': { fill: "url('#profitGradient')", opacity: 0.15 }
        },
        [`& .${axisClasses.root}.${axisClasses.directionX} .${axisClasses.tick}`]: { stroke: 'transparent' },
        [`& .${axisClasses.root}.${axisClasses.directionY} .${axisClasses.tick}`]: { stroke: 'transparent' },
        [`& .${axisClasses.root} .${axisClasses.tickLabel}`]: {
          fill: theme.palette.text.secondary,
          fontSize: '0.75rem'
        }
      }}
    >
      <defs>
        <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity={0.4} />
          <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
        </linearGradient>
      </defs>
    </LineChart>
  );
}
