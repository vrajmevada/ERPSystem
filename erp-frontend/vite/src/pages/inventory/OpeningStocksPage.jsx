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
  FormHelperText
} from '@mui/material';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import DatabaseOutlined from '@ant-design/icons/DatabaseOutlined';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import FolderOpenOutlined from '@ant-design/icons/FolderOpenOutlined';

import MainCard from 'components/MainCard';
import { getOpeningStocks, createOpeningStock, deleteOpeningStock } from 'api/openingStocks';
import { getProducts } from 'api/products';
import { getWarehouses } from 'api/warehouses';
import useAuth from 'hooks/useAuth';

export default function OpeningStocksPage() {
  const { user } = useAuth();
  const role = user?.role?.trim().toLowerCase();
  const canWrite = role === 'admin' || role === 'manager';

  const [openingStocks, setOpeningStocks] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Dialog & Form states
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [rate, setRate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitError, setSubmitError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Delete Confirmation Dialog states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  // Snackbar notification state
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
      const stockData = await getOpeningStocks();
      setOpeningStocks(stockData.items || []);

      const prodData = await getProducts('', 1, 500);
      setProducts(prodData.items || []);

      const whData = await getWarehouses();
      setWarehouses(whData || []);
    } catch (error) {
      console.error('Failed to load opening stocks:', error);
      showNotification('Failed to load opening stock data', 'error');
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
    setProductId('');
    setWarehouseId('');
    setQuantity('');
    setRate('');
    setRemarks('');
    setTransactionDate(new Date().toISOString().split('T')[0]);
    setSubmitError('');
    setFieldErrors({});
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const validateForm = () => {
    const errors = {};
    if (!productId) errors.productId = 'Product is required';
    if (!warehouseId) errors.warehouseId = 'Warehouse is required';

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      errors.quantity = 'Quantity must be a positive integer';
    }

    const r = parseFloat(rate);
    if (isNaN(r) || r < 0) {
      errors.rate = 'Rate must be a non-negative number';
    }

    if (!transactionDate) {
      errors.transactionDate = 'Transaction date is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveOpeningStock = async () => {
    if (!validateForm()) return;

    try {
      setSubmitError('');
      const payload = {
        productId: parseInt(productId, 10),
        warehouseId: parseInt(warehouseId, 10),
        quantity: parseInt(quantity, 10),
        rate: parseFloat(rate),
        transactionDate: new Date(transactionDate).toISOString(),
        remarks: remarks.trim()
      };

      await createOpeningStock(payload);
      showNotification('Opening stock recorded successfully', 'success');
      setOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving opening stock:', error);
      setSubmitError(
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        'Failed to save opening stock'
      );
      showNotification('Failed to save opening stock', 'error');
    }
  };

  const handleOpenDeleteConfirm = (record) => {
    setRecordToDelete(record);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setRecordToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return;

    try {
      await deleteOpeningStock(recordToDelete.id);
      showNotification('Opening stock deleted and stock reversed successfully', 'success');
      handleCloseDeleteConfirm();
      loadData();
    } catch (error) {
      console.error('Error deleting opening stock:', error);
      showNotification(
        error.response?.data?.message || 'Failed to delete opening stock',
        'error'
      );
    }
  };

  const filteredStocks = openingStocks.filter(
    (o) =>
      o.productName?.toLowerCase().includes(search.toLowerCase()) ||
      o.warehouseName?.toLowerCase().includes(search.toLowerCase()) ||
      o.remarks?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'productName', headerName: 'Product Name', flex: 1.5 },
    { field: 'warehouseName', headerName: 'Warehouse', flex: 1.2 },
    { field: 'quantity', headerName: 'Quantity', width: 120 },
    {
      field: 'rate',
      headerName: 'Rate',
      width: 120,
      valueFormatter: (value) => (value != null ? `$${parseFloat(value).toFixed(2)}` : '')
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 130,
      valueFormatter: (value) => (value != null ? `$${parseFloat(value).toFixed(2)}` : '')
    },
    {
      field: 'transactionDate',
      headerName: 'Date',
      width: 130,
      valueFormatter: (value) => (value ? new Date(value).toLocaleDateString() : '')
    },
    { field: 'remarks', headerName: 'Remarks', flex: 1.5 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center" height="100%">
          {canWrite ? (
            <IconButton
              color="error"
              size="small"
              onClick={() => handleOpenDeleteConfirm(params.row)}
            >
              <DeleteOutlined />
            </IconButton>
          ) : (
            <Typography variant="caption" color="textSecondary">Read-only</Typography>
          )}
        </Stack>
      )
    }
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
          <Grid item>
            <Typography variant="h2" sx={{ mb: 0.5 }}>
              Opening Stock
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Initialize stock levels for products in warehouses
            </Typography>
          </Grid>
          <Grid item>
            {canWrite && (
              <Button
                variant="contained"
                startIcon={<PlusOutlined />}
                onClick={handleOpenAddDialog}
              >
                Add Opening Stock
              </Button>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* Grid */}
      <MainCard title="Opening Stock Ledger">
        <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
          <TextField
            placeholder="Search by Product, Warehouse, or Remarks"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ width: 350 }}
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

        <Box sx={{ height: 480, width: '100%' }}>
          {filteredStocks.length === 0 && !loading ? (
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
                No opening stock found
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                {search
                  ? 'No records match your search criteria.'
                  : 'Start adding opening stock for products.'}
              </Typography>
            </Box>
          ) : (
            <DataGrid
              rows={filteredStocks}
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

      {/* Add Dialog */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Add Opening Stock</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}

            <FormControl fullWidth error={Boolean(fieldErrors.productId)} required>
              <InputLabel id="product-label">Product</InputLabel>
              <Select
                labelId="product-label"
                value={productId}
                label="Product"
                onChange={(e) => setProductId(e.target.value)}
              >
                {products.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name} (Code: {item.code})
                  </MenuItem>
                ))}
              </Select>
              {fieldErrors.productId && <FormHelperText>{fieldErrors.productId}</FormHelperText>}
            </FormControl>

            <FormControl fullWidth error={Boolean(fieldErrors.warehouseId)} required>
              <InputLabel id="warehouse-label">Warehouse</InputLabel>
              <Select
                labelId="warehouse-label"
                value={warehouseId}
                label="Warehouse"
                onChange={(e) => setWarehouseId(e.target.value)}
              >
                {warehouses.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
              {fieldErrors.warehouseId && <FormHelperText>{fieldErrors.warehouseId}</FormHelperText>}
            </FormControl>

            <TextField
              label="Quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              error={Boolean(fieldErrors.quantity)}
              helperText={fieldErrors.quantity}
              required
              fullWidth
            />

            <TextField
              label="Rate"
              type="number"
              inputProps={{ step: '0.01' }}
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              error={Boolean(fieldErrors.rate)}
              helperText={fieldErrors.rate}
              required
              fullWidth
            />

            <TextField
              label="Transaction Date"
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              error={Boolean(fieldErrors.transactionDate)}
              helperText={fieldErrors.transactionDate}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />

            <TextField
              label="Remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveOpeningStock} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteConfirm} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Opening Stock Record</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this opening stock record for &quot;{recordToDelete?.productName}&quot;? This will reverse the initial inventory counts in warehouse &quot;{recordToDelete?.warehouseName}&quot;.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDeleteConfirm}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar alerts */}
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
