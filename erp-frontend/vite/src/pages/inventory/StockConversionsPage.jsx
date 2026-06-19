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
  Chip,
  Tooltip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import CloseCircleOutlined from '@ant-design/icons/CloseCircleOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import BlockOutlined from '@ant-design/icons/BlockOutlined';

import MainCard from 'components/MainCard';
import {
  getStockConversions,
  getStockConversionById,
  createStockConversion,
  approveStockConversion,
  cancelStockConversion
} from 'api/stockConversions';
import { getWarehouses } from 'api/warehouses';
import { getProducts } from 'api/products';
import useAuth from 'hooks/useAuth';

const STATUS_CONFIG = {
  'Draft': { label: 'Draft', color: 'default' },
  'Approved': { label: 'Approved', color: 'success' },
  'Cancelled': { label: 'Cancelled', color: 'error' }
};

export default function StockConversionsPage() {
  const { user } = useAuth();
  const role = user?.role?.trim().toLowerCase();
  const canOperate = role === 'admin' || role === 'manager' || role === 'operator';
  const canApprove = role === 'admin' || role === 'manager';

  const [conversions, setConversions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Dropdowns
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  // Create Dialog states
  const [open, setOpen] = useState(false);
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');

  // Dual line arrays
  const [sourceLines, setSourceLines] = useState([{ productId: '', warehouseId: '', quantity: 1 }]);
  const [destLines, setDestLines] = useState([{ productId: '', warehouseId: '', quantity: 1 }]);

  const [submitError, setSubmitError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Details Dialog states
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedConversion, setSelectedConversion] = useState(null);

  // Snackbar alert state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadData();
    loadMetadata();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getStockConversions();
      setConversions(Array.isArray(data) ? data : (data && Array.isArray(data.items) ? data.items : []));
    } catch (error) {
      console.error('Failed to load stock conversions:', error);
      showNotification('Failed to load stock conversions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadMetadata = async () => {
    try {
      const whs = await getWarehouses();
      setWarehouses(Array.isArray(whs) ? whs : (whs && Array.isArray(whs.items) ? whs.items : []));

      const prods = await getProducts('', 1, 500);
      setProducts(Array.isArray(prods) ? prods : (prods && Array.isArray(prods.items) ? prods.items : []));
    } catch (err) {
      console.error('Failed to load metadata:', err);
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
    setTransactionDate(new Date().toISOString().split('T')[0]);
    setRemarks('');
    setSourceLines([{ productId: '', warehouseId: '', quantity: 1 }]);
    setDestLines([{ productId: '', warehouseId: '', quantity: 1 }]);
    setSubmitError('');
    setFieldErrors({});
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  // Add/Remove Source Rows
  const handleAddSourceLine = () => {
    setSourceLines((prev) => [...prev, { productId: '', warehouseId: '', quantity: 1 }]);
  };
  const handleRemoveSourceLine = (index) => {
    if (sourceLines.length === 1) return;
    setSourceLines((prev) => prev.filter((_, idx) => idx !== index));
  };
  const handleSourceFieldChange = (index, field, value) => {
    setSourceLines((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Add/Remove Destination Rows
  const handleAddDestLine = () => {
    setDestLines((prev) => [...prev, { productId: '', warehouseId: '', quantity: 1 }]);
  };
  const handleRemoveDestLine = (index) => {
    if (destLines.length === 1) return;
    setDestLines((prev) => prev.filter((_, idx) => idx !== index));
  };
  const handleDestFieldChange = (index, field, value) => {
    setDestLines((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!transactionDate) errors.transactionDate = 'Transaction date is required';

    const srcErrors = [];
    sourceLines.forEach((item, index) => {
      if (!item.productId) srcErrors[index] = { productId: 'Required' };
      if (!item.warehouseId) srcErrors[index] = { ...srcErrors[index], warehouseId: 'Required' };
      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty <= 0) srcErrors[index] = { ...srcErrors[index], quantity: 'Qty > 0' };
    });

    const destErrors = [];
    destLines.forEach((item, index) => {
      if (!item.productId) destErrors[index] = { productId: 'Required' };
      if (!item.warehouseId) destErrors[index] = { ...destErrors[index], warehouseId: 'Required' };
      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty <= 0) destErrors[index] = { ...destErrors[index], quantity: 'Qty > 0' };
    });

    if (srcErrors.length > 0) errors.source = srcErrors;
    if (destErrors.length > 0) errors.dest = destErrors;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveConversion = async () => {
    if (!validateForm()) return;

    try {
      setSubmitError('');
      const payload = {
        transactionDate: new Date(transactionDate).toISOString(),
        remarks: remarks.trim(),
        sourceLines: sourceLines.map((l) => ({
          productId: parseInt(l.productId, 10),
          warehouseId: parseInt(l.warehouseId, 10),
          quantity: parseInt(l.quantity, 10)
        })),
        destinationLines: destLines.map((l) => ({
          productId: parseInt(l.productId, 10),
          warehouseId: parseInt(l.warehouseId, 10),
          quantity: parseInt(l.quantity, 10)
        }))
      };

      await createStockConversion(payload);
      showNotification('Stock conversion created successfully', 'success');
      setOpen(false);
      loadData();
    } catch (error) {
      console.error('Error creating stock conversion:', error);
      setSubmitError(
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        'Failed to create stock conversion'
      );
      showNotification('Failed to create stock conversion', 'error');
    }
  };

  const handleViewDetails = async (row) => {
    try {
      const details = await getStockConversionById(row.id);
      setSelectedConversion(details);
      setDetailOpen(true);
    } catch (error) {
      console.error('Failed to fetch details:', error);
      showNotification('Failed to load details', 'error');
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveStockConversion(id);
      showNotification('Stock conversion approved. Inventory adjusted.', 'success');
      loadData();
      if (detailOpen && selectedConversion?.id === id) {
        setDetailOpen(false);
      }
    } catch (error) {
      console.error('Failed to approve conversion:', error);
      showNotification(
        error.response?.data?.message || 'Failed to approve stock conversion',
        'error'
      );
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelStockConversion(id);
      showNotification('Stock conversion cancelled. Inventory reversed.', 'success');
      loadData();
      if (detailOpen && selectedConversion?.id === id) {
        setDetailOpen(false);
      }
    } catch (error) {
      console.error('Failed to cancel conversion:', error);
      showNotification(
        error.response?.data?.message || 'Failed to cancel stock conversion',
        'error'
      );
    }
  };

  const filteredConversions = conversions.filter(
    (c) =>
      c.voucherNumber?.toLowerCase().includes(search.toLowerCase()) ||
      c.remarks?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'voucherNumber', headerName: 'Voucher Number', flex: 1.2 },
    {
      field: 'transactionDate',
      headerName: 'Transaction Date',
      width: 130,
      valueFormatter: (value) => (value ? new Date(value).toLocaleDateString() : '')
    },
    {
      field: 'sources',
      headerName: 'Source Items',
      width: 120,
      valueGetter: (value, row) => row.sourceLines?.length || 0
    },
    {
      field: 'destinations',
      headerName: 'Produced Items',
      width: 120,
      valueGetter: (value, row) => row.destinationLines?.length || 0
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const config = STATUS_CONFIG[params.row.status];
        return config ? (
          <Chip label={config.label} color={config.color} size="small" variant="light" />
        ) : (
          <Chip label={params.row.status} size="small" />
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => {
        const status = params.row.status;
        const showApprove = status === 'Draft' && canApprove;
        const showCancel = status === 'Approved' && canApprove;

        return (
          <Stack direction="row" spacing={0.5} alignItems="center" height="100%">
            <Tooltip title="View Details">
              <IconButton color="secondary" size="small" onClick={() => handleViewDetails(params.row)}>
                <EyeOutlined />
              </IconButton>
            </Tooltip>
            {showApprove && (
              <Tooltip title="Approve Conversion">
                <IconButton color="success" size="small" onClick={() => handleApprove(params.row.id)}>
                  <CheckCircleOutlined />
                </IconButton>
              </Tooltip>
            )}
            {showCancel && (
              <Tooltip title="Cancel Conversion">
                <IconButton color="error" size="small" onClick={() => handleCancel(params.row.id)}>
                  <CloseCircleOutlined />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        );
      }
    }
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
          <Grid item>
            <Typography variant="h2" sx={{ mb: 0.5 }}>
              Stock Conversion
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Deconstruct raw materials to produce finished/converted stock items
            </Typography>
          </Grid>
          <Grid item>
            {canOperate && (
              <Button
                variant="contained"
                startIcon={<PlusOutlined />}
                onClick={handleOpenAddDialog}
              >
                New Stock Conversion
              </Button>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* Grid */}
      <MainCard title="Stock Conversions list">
        <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
          <TextField
            placeholder="Search by Voucher Number or Remarks"
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
          {filteredConversions.length === 0 && !loading ? (
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
              <BlockOutlined style={{ fontSize: '48px', color: '#bfbfbf' }} />
              <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
                No stock conversions found
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                {search
                  ? 'No records match your search criteria.'
                  : 'Start converting inventory items.'}
              </Typography>
            </Box>
          ) : (
            <DataGrid
              rows={filteredConversions}
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

      {/* Create Dialog */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>New Stock Conversion</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
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
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  label="Remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              {/* SOURCE SIDE */}
              <Grid item xs={12} md={6}>
                <MainCard title="Source Materials (Consumed)">
                  <Stack spacing={2}>
                    {sourceLines.map((item, index) => (
                      <Grid container spacing={1} key={`src-${index}`} alignItems="center">
                        <Grid item xs={12} sm={5}>
                          <FormControl fullWidth size="small" required error={Boolean(fieldErrors.source?.[index]?.productId)}>
                            <InputLabel>Product</InputLabel>
                            <Select
                              value={item.productId}
                              label="Product"
                              onChange={(e) => handleSourceFieldChange(index, 'productId', e.target.value)}
                            >
                              {products.map((p) => (
                                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                          <FormControl fullWidth size="small" required error={Boolean(fieldErrors.source?.[index]?.warehouseId)}>
                            <InputLabel>Warehouse</InputLabel>
                            <Select
                              value={item.warehouseId}
                              label="Warehouse"
                              onChange={(e) => handleSourceFieldChange(index, 'warehouseId', e.target.value)}
                            >
                              {warehouses.map((w) => (
                                <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={2}>
                          <TextField
                            label="Qty"
                            type="number"
                            size="small"
                            value={item.quantity}
                            onChange={(e) => handleSourceFieldChange(index, 'quantity', parseInt(e.target.value, 10) || 0)}
                            error={Boolean(fieldErrors.source?.[index]?.quantity)}
                            required
                            fullWidth
                          />
                        </Grid>

                        <Grid item xs={12} sm={1}>
                          <IconButton
                            color="error"
                            disabled={sourceLines.length === 1}
                            onClick={() => handleRemoveSourceLine(index)}
                            size="small"
                          >
                            <DeleteOutlined />
                          </IconButton>
                        </Grid>
                      </Grid>
                    ))}
                    <Box>
                      <Button variant="outlined" size="small" startIcon={<PlusOutlined />} onClick={handleAddSourceLine}>
                        Add Consumed Item
                      </Button>
                    </Box>
                  </Stack>
                </MainCard>
              </Grid>

              {/* DESTINATION SIDE */}
              <Grid item xs={12} md={6}>
                <MainCard title="Destination Products (Produced)">
                  <Stack spacing={2}>
                    {destLines.map((item, index) => (
                      <Grid container spacing={1} key={`dest-${index}`} alignItems="center">
                        <Grid item xs={12} sm={5}>
                          <FormControl fullWidth size="small" required error={Boolean(fieldErrors.dest?.[index]?.productId)}>
                            <InputLabel>Product</InputLabel>
                            <Select
                              value={item.productId}
                              label="Product"
                              onChange={(e) => handleDestFieldChange(index, 'productId', e.target.value)}
                            >
                              {products.map((p) => (
                                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                          <FormControl fullWidth size="small" required error={Boolean(fieldErrors.dest?.[index]?.warehouseId)}>
                            <InputLabel>Warehouse</InputLabel>
                            <Select
                              value={item.warehouseId}
                              label="Warehouse"
                              onChange={(e) => handleDestFieldChange(index, 'warehouseId', e.target.value)}
                            >
                              {warehouses.map((w) => (
                                <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={2}>
                          <TextField
                            label="Qty"
                            type="number"
                            size="small"
                            value={item.quantity}
                            onChange={(e) => handleDestFieldChange(index, 'quantity', parseInt(e.target.value, 10) || 0)}
                            error={Boolean(fieldErrors.dest?.[index]?.quantity)}
                            required
                            fullWidth
                          />
                        </Grid>

                        <Grid item xs={12} sm={1}>
                          <IconButton
                            color="error"
                            disabled={destLines.length === 1}
                            onClick={() => handleRemoveDestLine(index)}
                            size="small"
                          >
                            <DeleteOutlined />
                          </IconButton>
                        </Grid>
                      </Grid>
                    ))}
                    <Box>
                      <Button variant="outlined" size="small" startIcon={<PlusOutlined />} onClick={handleAddDestLine}>
                        Add Produced Item
                      </Button>
                    </Box>
                  </Stack>
                </MainCard>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveConversion} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details View Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h3">Conversion Details: {selectedConversion?.voucherNumber}</Typography>
          {selectedConversion && (
            <Chip
              label={STATUS_CONFIG[selectedConversion.status]?.label}
              color={STATUS_CONFIG[selectedConversion.status]?.color}
              size="small"
            />
          )}
        </DialogTitle>
        <DialogContent dividers>
          {selectedConversion && (
            <Stack spacing={3}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Transaction Date</Typography>
                  <Typography variant="body1">{new Date(selectedConversion.transactionDate).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Remarks</Typography>
                  <Typography variant="body1">{selectedConversion.remarks || 'No remarks provided'}</Typography>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h5" sx={{ mb: 1 }}>Consumed Items</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead sx={{ bgcolor: 'grey.50' }}>
                        <TableRow>
                          <TableCell>Product Name</TableCell>
                          <TableCell>Warehouse</TableCell>
                          <TableCell align="right">Qty</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(selectedConversion?.sourceLines || []).map((l) => (
                          <TableRow key={l.id}>
                            <TableCell>{l.productName}</TableCell>
                            <TableCell>{l.warehouseName}</TableCell>
                            <TableCell align="right">{l.quantity}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="h5" sx={{ mb: 1 }}>Produced Items</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead sx={{ bgcolor: 'grey.50' }}>
                        <TableRow>
                          <TableCell>Product Name</TableCell>
                          <TableCell>Warehouse</TableCell>
                          <TableCell align="right">Qty</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(selectedConversion?.destinationLines || []).map((l) => (
                          <TableRow key={l.id}>
                            <TableCell>{l.productName}</TableCell>
                            <TableCell>{l.warehouseName}</TableCell>
                            <TableCell align="right">{l.quantity}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {selectedConversion?.status === 'Draft' && canApprove && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleOutlined />}
              onClick={() => handleApprove(selectedConversion.id)}
            >
              Approve
            </Button>
          )}
          {selectedConversion?.status === 'Approved' && canApprove && (
            <Button
              variant="contained"
              color="error"
              startIcon={<CloseCircleOutlined />}
              onClick={() => handleCancel(selectedConversion.id)}
            >
              Cancel Conversion
            </Button>
          )}
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
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
