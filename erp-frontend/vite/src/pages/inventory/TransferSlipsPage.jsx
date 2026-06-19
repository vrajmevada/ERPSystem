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
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import SwapOutlined from '@ant-design/icons/SwapOutlined';
import SendOutlined from '@ant-design/icons/SendOutlined';

import MainCard from 'components/MainCard';
import {
  getTransferSlips,
  getTransferSlipById,
  createTransferSlip,
  shipTransferSlip,
  receiveTransferSlip
} from 'api/transferSlips';
import { getWarehouses } from 'api/warehouses';
import { getProducts } from 'api/products';
import useAuth from 'hooks/useAuth';

const STATUS_CONFIG = {
  'Draft': { label: 'Draft', color: 'default' },
  'Shipped': { label: 'Shipped', color: 'warning' },
  'Approved': { label: 'Received/Approved', color: 'success' },
  'Cancelled': { label: 'Cancelled', color: 'error' }
};

export default function TransferSlipsPage() {
  const { user } = useAuth();
  const role = user?.role?.trim().toLowerCase();
  const canOperate = role === 'admin' || role === 'manager' || role === 'operator';

  const [slips, setSlips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Dropdowns
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  // Create Dialog states
  const [open, setOpen] = useState(false);
  const [fromWarehouseId, setFromWarehouseId] = useState('');
  const [toWarehouseId, setToWarehouseId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [lines, setLines] = useState([{ productId: '', quantity: 1, notes: '' }]);
  const [submitError, setSubmitError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Details Dialog states
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState(null);

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
      const data = await getTransferSlips();
      setSlips(Array.isArray(data) ? data : (data && Array.isArray(data.items) ? data.items : []));
    } catch (error) {
      console.error('Failed to load transfer slips:', error);
      showNotification('Failed to load transfer slips', 'error');
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
    setFromWarehouseId('');
    setToWarehouseId('');
    setRemarks('');
    setLines([{ productId: '', quantity: 1, notes: '' }]);
    setSubmitError('');
    setFieldErrors({});
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleAddLineRow = () => {
    setLines((prev) => [...prev, { productId: '', quantity: 1, notes: '' }]);
  };

  const handleRemoveLineRow = (index) => {
    if (lines.length === 1) return;
    setLines((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleLineFieldChange = (index, field, value) => {
    setLines((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!fromWarehouseId) errors.fromWarehouseId = 'Source warehouse is required';
    if (!toWarehouseId) errors.toWarehouseId = 'Destination warehouse is required';
    if (fromWarehouseId && toWarehouseId && fromWarehouseId === toWarehouseId) {
      errors.toWarehouseId = 'Source and Destination warehouses cannot be the same';
    }

    const itemErrors = [];
    lines.forEach((item, index) => {
      if (!item.productId) {
        itemErrors[index] = { productId: 'Product is required' };
      }
      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        itemErrors[index] = { ...itemErrors[index], quantity: 'Qty > 0' };
      }
    });

    if (itemErrors.length > 0) {
      errors.items = itemErrors;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveSlip = async () => {
    if (!validateForm()) return;

    try {
      setSubmitError('');
      const payload = {
        fromWarehouseId: parseInt(fromWarehouseId, 10),
        toWarehouseId: parseInt(toWarehouseId, 10),
        remarks: remarks.trim(),
        lines: lines.map((l) => ({
          productId: parseInt(l.productId, 10),
          quantity: parseInt(l.quantity, 10),
          notes: l.notes.trim()
        }))
      };

      await createTransferSlip(payload);
      showNotification('Transfer Slip created successfully', 'success');
      setOpen(false);
      loadData();
    } catch (error) {
      console.error('Error creating transfer slip:', error);
      setSubmitError(
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        'Failed to create transfer slip'
      );
      showNotification('Failed to create transfer slip', 'error');
    }
  };

  const handleViewDetails = async (row) => {
    try {
      const details = await getTransferSlipById(row.id);
      setSelectedSlip(details);
      setDetailOpen(true);
    } catch (error) {
      console.error('Failed to fetch transfer slip details:', error);
      showNotification('Failed to load details', 'error');
    }
  };

  const handleShip = async (id) => {
    try {
      await shipTransferSlip(id);
      showNotification('Transfer slip inventory shipped successfully', 'success');
      loadData();
      if (detailOpen && selectedSlip?.id === id) {
        setDetailOpen(false);
      }
    } catch (error) {
      console.error('Failed to ship transfer slip:', error);
      showNotification(
        error.response?.data?.message || 'Failed to ship transfer slip',
        'error'
      );
    }
  };

  const handleReceive = async (id) => {
    try {
      await receiveTransferSlip(id);
      showNotification('Transfer slip received. Target stock updated.', 'success');
      loadData();
      if (detailOpen && selectedSlip?.id === id) {
        setDetailOpen(false);
      }
    } catch (error) {
      console.error('Failed to receive transfer slip:', error);
      showNotification(
        error.response?.data?.message || 'Failed to receive transfer slip',
        'error'
      );
    }
  };

  const filteredSlips = slips.filter(
    (s) =>
      s.slipNumber?.toLowerCase().includes(search.toLowerCase()) ||
      s.fromWarehouseName?.toLowerCase().includes(search.toLowerCase()) ||
      s.toWarehouseName?.toLowerCase().includes(search.toLowerCase()) ||
      s.remarks?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'slipNumber', headerName: 'Slip Number', flex: 1.2 },
    { field: 'fromWarehouseName', headerName: 'From Warehouse', flex: 1.2 },
    { field: 'toWarehouseName', headerName: 'To Warehouse', flex: 1.2 },
    {
      field: 'transferDate',
      headerName: 'Transfer Date',
      width: 120,
      valueFormatter: (value) => (value ? new Date(value).toLocaleDateString() : '')
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
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
        const showShip = status === 'Draft' && canOperate;
        const showReceive = status === 'Shipped' && canOperate;

        return (
          <Stack direction="row" spacing={0.5} alignItems="center" height="100%">
            <Tooltip title="View Details">
              <IconButton color="secondary" size="small" onClick={() => handleViewDetails(params.row)}>
                <EyeOutlined />
              </IconButton>
            </Tooltip>
            {showShip && (
              <Tooltip title="Ship Transfer">
                <IconButton color="primary" size="small" onClick={() => handleShip(params.row.id)}>
                  <SendOutlined />
                </IconButton>
              </Tooltip>
            )}
            {showReceive && (
              <Tooltip title="Receive Goods">
                <IconButton color="success" size="small" onClick={() => handleReceive(params.row.id)}>
                  <CheckCircleOutlined />
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
              Transfer Slips
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Manage inventory transfers and movements between warehouses
            </Typography>
          </Grid>
          <Grid item>
            {canOperate && (
              <Button
                variant="contained"
                startIcon={<PlusOutlined />}
                onClick={handleOpenAddDialog}
              >
                New Transfer Slip
              </Button>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* Grid */}
      <MainCard title="Warehouse Transfer Slips">
        <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
          <TextField
            placeholder="Search by Slip No, Warehouse or Remarks"
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
          {filteredSlips.length === 0 && !loading ? (
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
              <SwapOutlined style={{ fontSize: '48px', color: '#bfbfbf' }} />
              <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
                No transfer slips found
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                {search
                  ? 'No records match your search criteria.'
                  : 'Start warehouse-to-warehouse transfers.'}
              </Typography>
            </Box>
          ) : (
            <DataGrid
              rows={filteredSlips}
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
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>New Transfer Slip</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={Boolean(fieldErrors.fromWarehouseId)} required>
                  <InputLabel id="from-wh-label">Source Warehouse</InputLabel>
                  <Select
                    labelId="from-wh-label"
                    value={fromWarehouseId}
                    label="Source Warehouse"
                    onChange={(e) => setFromWarehouseId(e.target.value)}
                  >
                    {warehouses.map((w) => (
                      <MenuItem key={w.id} value={w.id}>
                        {w.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.fromWarehouseId && <FormHelperText>{fieldErrors.fromWarehouseId}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={Boolean(fieldErrors.toWarehouseId)} required>
                  <InputLabel id="to-wh-label">Destination Warehouse</InputLabel>
                  <Select
                    labelId="to-wh-label"
                    value={toWarehouseId}
                    label="Destination Warehouse"
                    onChange={(e) => setToWarehouseId(e.target.value)}
                  >
                    {warehouses.map((w) => (
                      <MenuItem key={w.id} value={w.id}>
                        {w.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.toWarehouseId && <FormHelperText>{fieldErrors.toWarehouseId}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>

            <Divider />
            <Typography variant="h5">Transfer Items</Typography>

            {lines.map((item, index) => (
              <Grid container spacing={2} key={index} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth
                    error={Boolean(fieldErrors.items?.[index]?.productId)}
                    required
                  >
                    <InputLabel id={`prod-select-${index}`}>Product</InputLabel>
                    <Select
                      labelId={`prod-select-${index}`}
                      value={item.productId}
                      label="Product"
                      onChange={(e) => handleLineFieldChange(index, 'productId', e.target.value)}
                    >
                      {products.map((p) => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {fieldErrors.items?.[index]?.productId && (
                      <FormHelperText>{fieldErrors.items?.[index]?.productId}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={2}>
                  <TextField
                    label="Quantity"
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleLineFieldChange(index, 'quantity', parseInt(e.target.value, 10) || 0)
                    }
                    error={Boolean(fieldErrors.items?.[index]?.quantity)}
                    helperText={fieldErrors.items?.[index]?.quantity}
                    required
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Line Notes"
                    value={item.notes}
                    onChange={(e) => handleLineFieldChange(index, 'notes', e.target.value)}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} sm={1}>
                  <IconButton
                    color="error"
                    disabled={lines.length === 1}
                    onClick={() => handleRemoveLineRow(index)}
                  >
                    <DeleteOutlined />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            <Box>
              <Button variant="outlined" startIcon={<PlusOutlined />} onClick={handleAddLineRow}>
                Add Item
              </Button>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveSlip} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details View Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h3">Transfer Slip Details: {selectedSlip?.slipNumber}</Typography>
          {selectedSlip && (
            <Chip
              label={STATUS_CONFIG[selectedSlip.status]?.label}
              color={STATUS_CONFIG[selectedSlip.status]?.color}
              size="small"
            />
          )}
        </DialogTitle>
        <DialogContent dividers>
          {selectedSlip && (
            <Stack spacing={3}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Source Warehouse</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{selectedSlip.fromWarehouseName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Destination Warehouse</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{selectedSlip.toWarehouseName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Transfer Date</Typography>
                  <Typography variant="body1">{new Date(selectedSlip.transferDate).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Remarks</Typography>
                  <Typography variant="body1">{selectedSlip.remarks || 'No remarks provided'}</Typography>
                </Grid>
              </Grid>

              <Divider />
              <Typography variant="h5">Items List</Typography>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      <TableCell>Line No</TableCell>
                      <TableCell>Product Name</TableCell>
                      <TableCell align="right">Qty Transferred</TableCell>
                      <TableCell align="right">Short Closed</TableCell>
                      <TableCell>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(selectedSlip?.lines || []).map((l) => (
                      <TableRow key={l.id}>
                        <TableCell>{l.lineNo}</TableCell>
                        <TableCell>{l.productName}</TableCell>
                        <TableCell align="right">{l.quantity}</TableCell>
                        <TableCell align="right">{l.shortClosedQuantity}</TableCell>
                        <TableCell>{l.notes || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {selectedSlip?.status === 'Draft' && canOperate && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<SendOutlined />}
              onClick={() => handleShip(selectedSlip.id)}
            >
              Ship Goods
            </Button>
          )}
          {selectedSlip?.status === 'Shipped' && canOperate && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleOutlined />}
              onClick={() => handleReceive(selectedSlip.id)}
            >
              Receive Goods
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
