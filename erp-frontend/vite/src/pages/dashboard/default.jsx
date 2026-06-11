import { useState, useEffect } from 'react';
import {
  getSalesSummary,
  getPurchaseSummary,
  getInventorySummary,
  getLowStock
} from 'api/dashboard';
import Alert from '@mui/material/Alert';

// material-ui
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

// project imports
import MainCard from 'components/MainCard';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';
import NetProfitLossCard from 'sections/dashboard/default/NetProfitLossCard';
import PerformanceIndicatorsCard from 'sections/dashboard/default/PerformanceIndicatorsCard';
import SegmentedSummaryCard from 'sections/dashboard/default/SegmentedSummaryCard';

// assets
import GiftOutlined from '@ant-design/icons/GiftOutlined';
import MessageOutlined from '@ant-design/icons/MessageOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';

import avatar1 from 'assets/images/users/avatar-1.png';
import avatar2 from 'assets/images/users/avatar-2.png';
import avatar3 from 'assets/images/users/avatar-3.png';
import avatar4 from 'assets/images/users/avatar-4.png';

// avatar style
const avatarSX = {
  width: 36,
  height: 36,
  fontSize: '1rem'
};

// action style
const actionSX = {
  mt: 0.75,
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',
  transform: 'none'
};

export default function DashboardDefault() {
  const [salesSummary, setSalesSummary] = useState(null);
  const [purchaseSummary, setPurchaseSummary] = useState(null);
  const [inventorySummary, setInventorySummary] = useState(null);
  const [error, setError] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [dateRange, setDateRange] = useState('this-year');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setError(null);
        const sales = await getSalesSummary();
        const purchases = await getPurchaseSummary();
        const inventory = await getInventorySummary();
        const lowStock = await getLowStock();

        setLowStockItems(lowStock);
        setSalesSummary(sales);
        setPurchaseSummary(purchases);
        setInventorySummary(inventory);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
      }
    };

    loadDashboard();
  }, []);

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/* Date Range & Page Title */}
      <Grid sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: -1 }} size={12}>
        <Typography variant="h5">Dashboard</Typography>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.85rem' }}>
            Date Range :
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              sx={{
                height: 32,
                fontSize: '0.85rem',
                bgcolor: 'background.paper',
                '& .MuiSelect-select': { py: 0.5, px: 1.5 }
              }}
            >
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="this-week">This Week</MenuItem>
              <MenuItem value="this-month">This Month</MenuItem>
              <MenuItem value="this-year">This Year</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Grid>

      {error && (
        <Grid size={12}>
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        </Grid>
      )}

      {/* Row 1: Net Profit/Loss & Performance Indicators */}
      <Grid size={{ xs: 12, md: 8 }}>
        <NetProfitLossCard />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <PerformanceIndicatorsCard lowStockCount={inventorySummary?.lowStockItems} />
      </Grid>

      {/* Row 2: Receivable Summary & Payable Summary */}
      <Grid size={{ xs: 12, md: 6 }}>
        <SegmentedSummaryCard type="receivable" />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <SegmentedSummaryCard type="payable" />
      </Grid>

      {/* Row 3: Analytic Stats summary cards */}
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <AnalyticEcommerce
            title="Sales Orders Count"
            count={salesSummary?.totalOrders ?? 0}
         />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <AnalyticEcommerce
             title="Purchase Orders Count" 
             count= {purchaseSummary?.totalOrders ?? 0} 
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <AnalyticEcommerce 
            title="Total Stock Items" 
            count={inventorySummary?.totalStockItems ?? 0}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <AnalyticEcommerce
            title="Low Stock Items"
            count={inventorySummary?.lowStockItems ?? 0}
        />
      </Grid>

      {/* Row 4: Low Stock Items List & Transaction History */}
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <MainCard title="Low Stock Items Detail">
          <Box sx={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: 400
              }}
            >
              <thead>
                <tr style={{ borderBottom: '1px solid #f0f0f0', color: '#8c8c8c' }}>
                  <th align="left" style={{ padding: '12px 8px', fontWeight: 'bold' }}>Product</th>
                  <th align="left" style={{ padding: '12px 8px', fontWeight: 'bold' }}>Warehouse</th>
                  <th align="left" style={{ padding: '12px 8px', fontWeight: 'bold' }}>Quantity</th>
                </tr>
              </thead>

              <tbody>
                {lowStockItems.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '24px 0', color: '#bfbfbf' }}>
                      No low stock alerts recorded.
                    </td>
                  </tr>
                ) : (
                  lowStockItems.map((item) => (
                    <tr key={item.productId} style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 'medium' }}>{item.productName}</td>
                      <td style={{ padding: '12px 8px', color: '#595959' }}>{item.warehouseName}</td>
                      <td style={{ padding: '12px 8px', color: '#ff4d4f', fontWeight: 'bold' }}>{item.quantity}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Box>
        </MainCard>
      </Grid>

      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Grid>
            <Typography variant="h5">Recent Transactions</Typography>
          </Grid>
        </Grid>
        <MainCard content={false}>
          <List
            component="nav"
            sx={{
              px: 0,
              py: 0,
              '& .MuiListItemButton-root': {
                py: 1.5,
                px: 2,
                '& .MuiAvatar-root': avatarSX,
                '& .MuiListItemSecondaryAction-root': { ...actionSX, position: 'relative' }
              }
            }}
          >
            <ListItem
              component={ListItemButton}
              divider
              secondaryAction={
                <Stack sx={{ alignItems: 'flex-end' }}>
                  <Typography variant="subtitle1" noWrap color="success.main">
                    + $1,430
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'secondary.main' }} noWrap>
                    78%
                  </Typography>
                </Stack>
              }
            >
              <ListItemAvatar>
                <Avatar sx={{ color: 'success.main', bgcolor: 'success.lighter' }}>
                  <GiftOutlined />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={<Typography variant="subtitle1">Order #002434</Typography>} secondary="Today, 2:00 AM" />
            </ListItem>
            <ListItem
              component={ListItemButton}
              divider
              secondaryAction={
                <Stack sx={{ alignItems: 'flex-end' }}>
                  <Typography variant="subtitle1" noWrap color="primary.main">
                    + $302
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'secondary.main' }} noWrap>
                    8%
                  </Typography>
                </Stack>
              }
            >
              <ListItemAvatar>
                <Avatar sx={{ color: 'primary.main', bgcolor: 'primary.lighter' }}>
                  <MessageOutlined />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={<Typography variant="subtitle1">Order #984947</Typography>} secondary="5 August, 1:45 PM" />
            </ListItem>
            <ListItem
              component={ListItemButton}
              secondaryAction={
                <Stack sx={{ alignItems: 'flex-end' }}>
                  <Typography variant="subtitle1" noWrap color="error.main">
                    - $682
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'secondary.main' }} noWrap>
                    16%
                  </Typography>
                </Stack>
              }
            >
              <ListItemAvatar>
                <Avatar sx={{ color: 'error.main', bgcolor: 'error.lighter' }}>
                  <SettingOutlined />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={<Typography variant="subtitle1">Order #988784</Typography>} secondary="7 hours ago" />
            </ListItem>
          </List>
        </MainCard>
        
        <MainCard sx={{ mt: 2.5 }}>
          <Stack sx={{ gap: 2 }}>
            <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Grid>
                <Stack>
                  <Typography variant="h5" noWrap>
                    Help & Support Chat
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'secondary.main' }} noWrap>
                    Typical response within 5 min
                  </Typography>
                </Stack>
              </Grid>
              <Grid>
                <AvatarGroup sx={{ '& .MuiAvatar-root': { width: 30, height: 30 } }}>
                  <Avatar alt="Remy Sharp" src={avatar1} />
                  <Avatar alt="Travis Howard" src={avatar2} />
                  <Avatar alt="Cindy Baker" src={avatar3} />
                  <Avatar alt="Agnes Walker" src={avatar4} />
                </AvatarGroup>
              </Grid>
            </Grid>
            <Button size="small" variant="contained" sx={{ textTransform: 'none', borderRadius: '8px' }}>
              Need Help?
            </Button>
          </Stack>
        </MainCard>
      </Grid>
    </Grid>
  );
}
