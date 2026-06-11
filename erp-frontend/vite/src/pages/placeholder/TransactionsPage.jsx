import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Box,
  Button,
  IconButton,
  TextField,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Chip
} from '@mui/material';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import SwapOutlined from '@ant-design/icons/SwapOutlined';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import FolderOpenOutlined from '@ant-design/icons/FolderOpenOutlined';

import MainCard from 'components/MainCard';
import {
  getInventoryTransactions,
  createInventoryTransaction
} from 'api/inventoryTransactions';
import { getStockItems } from 'api/stockItems';
import useAuth from 'hooks/useAuth';

// Enum mapping for Transaction Types
const TRANSACTION_TYPES = {
  1: { label: 'Purchase', color: 'success' },
  2: { label: 'Sale', color: 'primary' },
  3: { label: 'Damage', color: 'error' },
  4: { label: 'Adjustment', color: 'warning' }
};

export default function TransactionsPage() {
  const { user } = useAuth();
  const role = user?.role?.trim().toLowerCase();
  const canOperate = role === 'admin' || role === 'manager' || role === 'operator';

  const [transactions, setTransactions] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [stockItemLookup, setStockItemLookup] = useState({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Dialog & Form states
  const [open, setOpen] = useState(false);
  const [stockItemId, setStockItemId] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [quantityChange, setQuantityChange] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Snackbar notifications state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load stock items for the dropdown & name mapping
      const stockResult = await getStockItems('', 1, 500);
      const items = stockResult.items || [];
      setStockItems(items);

      // Create a quick lookup map (id -> stockItem)
      const lookup = {};
      items.forEach((item) => {
        lookup[item.id] = item;
      });
      setStockItemLookup(lookup);

      // Load transaction history
      const txData = await getInventoryTransactions();
      setTransactions(txData || []);
    } catch (error) {
      console.error('Failed to load transaction data:', error);
      showNotification('Failed to load transaction history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleOpenAddDialog = () => {
    setStockItemId('');
    setTransactionType('');
    setQuantityChange('');
    setSubmitError('');
    setFieldErrors({});
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const validateForm = () => {
    const errors = {};
    if (!stockItemId) {
      errors.stockItemId = 'Stock Item is required';
    }

    if (!transactionType) {
      errors.transactionType = 'Transaction Type is required';
    }

    const qty = parseInt(quantityChange, 10);
    if (isNaN(qty) || qty === 0) {
      errors.quantityChange = 'A non-zero quantity change is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveTransaction = async () => {
    if (!validateForm()) return;

    try {
      setSubmitError('');
      const payload = {
        stockItemId: parseInt(stockItemId, 10),
        quantityChange: parseInt(quantityChange, 10),
        transactionType: parseInt(transactionType, 10)
      };

      await createInventoryTransaction(payload);
      showNotification('Transaction recorded successfully', 'success');
      setOpen(false);
      loadData();
    } catch (error) {
      console.error('Error recording transaction:', error);
      setSubmitError(
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        'Failed to record transaction'
      );
      showNotification('Failed to record transaction', 'error');
    }
  };

  // Local client-side search by Product Name or Warehouse Name
  const filteredTransactions = transactions.filter((tx) => {
    const stockItem = stockItemLookup[tx.stockItemId];
    if (!stockItem) return false;
    const productName = stockItem.productName?.toLowerCase() || '';
    const warehouseName = stockItem.warehouseName?.toLowerCase() || '';
    const query = search.toLowerCase();
    return productName.includes(query) || warehouseName.includes(query);
  });

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    {
      field: 'productName',
      headerName: 'Product Name',
      flex: 1.2,
      valueGetter: (value, row) => stockItemLookup[row.stockItemId]?.productName || `Item #${row.stockItemId}`
    },
    {
      field: 'warehouseName',
      headerName: 'Warehouse',
      flex: 1.2,
      valueGetter: (value, row) => stockItemLookup[row.stockItemId]?.warehouseName || '-'
    },
    {
      field: 'transactionType',
      headerName: 'Type',
      width: 150,
      renderCell: (params) => {
        const config = TRANSACTION_TYPES[params.row.transactionType];
        return config ? (
          <Chip label={config.label} color={config.color} size="small" variant="light" />
        ) : (
          <Chip label={`Type ${params.row.transactionType}`} size="small" />
        );
      }
    },
    {
      field: 'quantityChange',
      headerName: 'Qty Change',
      width: 130,
      renderCell: (params) => {
        const change = params.row.quantityChange;
        const color = change > 0 ? '#52c41a' : '#ff4d4f';
        const prefix = change > 0 ? '+' : '';
        return (
          <Typography sx={{ fontWeight: 'bold', color, height: '100%', display: 'flex', alignItems: 'center' }}>
            {prefix}{change}
          </Typography>
        );
      }
    },
    {
      field: 'transactionDate',
      headerName: 'Date & Time',
      flex: 1,
      valueFormatter: (value) => value ? new Date(value).toLocaleString() : ''
    }
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
          <Grid item>
            <Typography variant="h2" sx={{ mb: 0.5 }}>
              Inventory Transactions
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Track product movements, transfers, stock adjustments, and history
            </Typography>
          </Grid>
          <Grid item>
            {canOperate && (
              <Button
                variant="contained"
                startIcon={<PlusOutlined />}
                onClick={handleOpenAddDialog}
              >
                Record Transaction
              </Button>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <MainCard content={false} sx={{ borderLeft: '4px solid #1890ff' }}>
            <Box sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack spacing={0.5}>
                  <Typography variant="h6" color="textSecondary">
                    Total Transactions
                  </Typography>
                  <Typography variant="h3">
                    {transactions.length}
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    backgroundColor: 'primary.lighter',
                    color: 'primary.main'
                  }}
                >
                  <SwapOutlined style={{ fontSize: '24px' }} />
                </Box>
              </Stack>
            </Box>
          </MainCard>
        </Grid>
      </Grid>

      {/* Search & Actions Bar inside MainCard */}
      <MainCard title="Transaction Ledger">
        <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
          <TextField
            placeholder="Search by Product or Warehouse"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: (
                <SearchOutlined style={{ color: '#bfbfbf', marginRight: 8 }} />
              ),
              endAdornment: search && (
                <IconButton onClick={() => setSearch('')} size="small" sx={{ p: 0.5 }}>
                  <CloseOutlined />
                </IconButton>
              )
            }}
          />
        </Stack>

        {/* DataGrid & Empty State */}
        <Box sx={{ height: 500, width: '100%' }}>
          {filteredTransactions.length === 0 && !loading ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                border: '1px dashed #d9d9d9',
                borderRadius: 1,
                p: 4,
                textAlign: 'center'
              }}
            >
              <FolderOpenOutlined style={{ fontSize: '48px', color: '#bfbfbf' }} />
              <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
                No transactions found
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                {search
                  ? 'No transactions match your search criteria.'
                  : 'Record your first transaction to get started.'}
              </Typography>
              {!search && canOperate && (
                <Button variant="contained" onClick={handleOpenAddDialog} startIcon={<PlusOutlined />}>
                  Record first transaction
                </Button>
              )}
            </Box>
          ) : (
            <DataGrid
              rows={filteredTransactions}
              columns={columns}
              loading={loading}
              pageSizeOptions={[5, 10, 25]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10, page: 0 }
                }
              }}
              disableRowSelectionOnClick
            />
          )}
        </Box>
      </MainCard>

      {/* Record Transaction Dialog */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Record Inventory Transaction</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}

            {/* Stock Item Selection */}
            <FormControl fullWidth error={Boolean(fieldErrors.stockItemId)} required>
              <InputLabel id="stock-item-select-label">Stock Item</InputLabel>
              <Select
                labelId="stock-item-select-label"
                value={stockItemId}
                label="Stock Item"
                onChange={(e) => setStockItemId(e.target.value)}
              >
                {stockItems.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.productName} ({item.warehouseName}) - Qty: {item.quantity}
                  </MenuItem>
                ))}
              </Select>
              {fieldErrors.stockItemId && (
                <FormHelperText>{fieldErrors.stockItemId}</FormHelperText>
              )}
            </FormControl>

            {/* Transaction Type */}
            <FormControl fullWidth error={Boolean(fieldErrors.transactionType)} required>
              <InputLabel id="transaction-type-select-label">Transaction Type</InputLabel>
              <Select
                labelId="transaction-type-select-label"
                value={transactionType}
                label="Transaction Type"
                onChange={(e) => setTransactionType(e.target.value)}
              >
                <MenuItem value={1}>Purchase (+)</MenuItem>
                <MenuItem value={2}>Sale (-)</MenuItem>
                <MenuItem value={3}>Damage (-)</MenuItem>
                <MenuItem value={4}>Adjustment (+/-)</MenuItem>
              </Select>
              {fieldErrors.transactionType && (
                <FormHelperText>{fieldErrors.transactionType}</FormHelperText>
              )}
            </FormControl>

            {/* Quantity Change */}
            <TextField
              label="Quantity Change"
              type="number"
              value={quantityChange}
              onChange={(e) => setQuantityChange(e.target.value)}
              error={Boolean(fieldErrors.quantityChange)}
              helperText={
                fieldErrors.quantityChange || 'Positive to add stock, negative to subtract stock.'
              }
              required
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveTransaction} variant="contained">
            Record
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Alert Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
