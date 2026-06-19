import React, { useEffect, useState, useCallback } from 'react';
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
import FolderOpenOutlined from '@ant-design/icons/FolderOpenOutlined';
import ImportOutlined from '@ant-design/icons/ImportOutlined';

import MainCard from 'components/MainCard';
import {
  getMaterialInwards,
  getMaterialInwardById,
  createMaterialInward,
  approveMaterialInward,
  cancelMaterialInward
} from 'api/materialInwards';
import { getWarehouses } from 'api/warehouses';
import { getProducts } from 'api/products';
import useAuth from 'hooks/useAuth';

const STATUS_CONFIG = {
  'Draft': { label: 'Draft', color: 'default' },
  'Approved': { label: 'Approved', color: 'success' },
  'Cancelled': { label: 'Cancelled', color: 'error' }
};

export default function MaterialInwardsPage() {
  const { user } = useAuth();
  const role = user?.role?.trim().toLowerCase();
  const canOperate = role === 'admin' || role === 'manager' || role === 'operator';
  const canApprove = role === 'admin' || role === 'manager';

  const [inwards, setInwards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Dropdowns
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  // Create Dialog states
  const [open, setOpen] = useState(false);
  const [warehouseId, setWarehouseId] = useState('');
  const [inwardType, setInwardType] = useState('Others');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');
  const [lines, setLines] = useState([{ productId: '', quantity: 1, remarks: '' }]);
  const [submitError, setSubmitError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Details Dialog states
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedInward, setSelectedInward] = useState(null);

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
      const data = await getMaterialInwards();
      setInwards(Array.isArray(data) ? data : (data && Array.isArray(data.items) ? data.items : []));
    } catch (error) {
      console.error('Failed to load material inwards:', error);
      showNotification('Failed to load material inwards', 'error');
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
    setWarehouseId('');
    setInwardType('Others');
    setReferenceNumber('');
    setTransactionDate(new Date().toISOString().split('T')[0]);
    setRemarks('');
    setLines([{ productId: '', quantity: 1, remarks: '' }]);
    setSubmitError('');
    setFieldErrors({});
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleAddLineRow = () => {
    setLines((prev) => [...prev, { productId: '', quantity: 1, remarks: '' }]);
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
    if (!warehouseId) errors.warehouseId = 'Warehouse is required';
    if (!transactionDate) errors.transactionDate = 'Transaction date is required';

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

  const handleSaveInward = async () => {
    if (!validateForm()) return;

    try {
      setSubmitError('');
      const payload = {
        warehouseId: parseInt(warehouseId, 10),
        transactionDate: new Date(transactionDate).toISOString(),
        remarks: remarks.trim(),
        inwardType,
        referenceNumber: referenceNumber.trim(),
        lines: lines.map((l) => ({
          productId: parseInt(l.productId, 10),
          quantity: parseInt(l.quantity, 10),
          remarks: l.remarks.trim()
        }))
      };

      await createMaterialInward(payload);
      showNotification('Material Inward created successfully', 'success');
      setOpen(false);
      loadData();
    } catch (error) {
      console.error('Error creating material inward:', error);
      setSubmitError(
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        'Failed to create material inward'
      );
      showNotification('Failed to create material inward', 'error');
    }
  };

  const handleViewDetails = async (row) => {
    try {
      const details = await getMaterialInwardById(row.id);
      setSelectedInward(details);
      setDetailOpen(true);
    } catch (error) {
      console.error('Failed to fetch inward details:', error);
      showNotification('Failed to load details', 'error');
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveMaterialInward(id);
      showNotification('Material Inward approved and stock adjusted', 'success');
      loadData();
      if (detailOpen && selectedInward?.id === id) {
        setDetailOpen(false);
      }
    } catch (error) {
      console.error('Failed to approve inward:', error);
      showNotification(
        error.response?.data?.message || 'Failed to approve record',
        'error'
      );
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelMaterialInward(id);
      showNotification('Material Inward cancelled and stock reversed', 'success');
      loadData();
      if (detailOpen && selectedInward?.id === id) {
        setDetailOpen(false);
      }
    } catch (error) {
      console.error('Failed to cancel inward:', error);
      showNotification(
        error.response?.data?.message || 'Failed to cancel record',
        'error'
      );
    }
  };

  const filteredInwards = inwards.filter(
    (i) =>
      i.inwardNumber?.toLowerCase().includes(search.toLowerCase()) ||
      i.warehouseName?.toLowerCase().includes(search.toLowerCase()) ||
      i.referenceNumber?.toLowerCase().includes(search.toLowerCase()) ||
      i.inwardType?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'inwardNumber', headerName: 'Inward Number', flex: 1.2 },
    { field: 'warehouseName', headerName: 'Warehouse', flex: 1.2 },
    { field: 'inwardType', headerName: 'Inward Type', flex: 1 },
    { field: 'referenceNumber', headerName: 'Ref No', flex: 0.8 },
    {
      field: 'transactionDate',
      headerName: 'Date',
      width: 120,
      valueFormatter: (value) => (value ? new Date(value).toLocaleDateString() : '')
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
              <Tooltip title="Approve Inward">
                <IconButton color="success" size="small" onClick={() => handleApprove(params.row.id)}>
                  <CheckCircleOutlined />
                </IconButton>
              </Tooltip>
            )}
            {showCancel && (
              <Tooltip title="Cancel Inward">
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
              Material Inward
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Manage ad-hoc stock receipts and warehouse inward journals
            </Typography>
          </Grid>
          <Grid item>
            {canOperate && (
              <Button
                variant="contained"
                startIcon={<PlusOutlined />}
                onClick={handleOpenAddDialog}
              >
                New Material Inward
              </Button>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* Grid */}
      <MainCard title="Material Inward Receipts">
        <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
          <TextField
            placeholder="Search by Inward No, Warehouse, Type or Ref"
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
          {filteredInwards.length === 0 && !loading ? (
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
              <ImportOutlined style={{ fontSize: '48px', color: '#bfbfbf' }} />
              <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
                No material inwards found
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                {search
                  ? 'No records match your search criteria.'
                  : 'Start recording material receipts.'}
              </Typography>
            </Box>
          ) : (
            <DataGrid
              rows={filteredInwards}
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
        <DialogTitle>New Material Inward</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={Boolean(fieldErrors.warehouseId)} required>
                  <InputLabel id="wh-select-label">Destination Warehouse</InputLabel>
                  <Select
                    labelId="wh-select-label"
                    value={warehouseId}
                    label="Destination Warehouse"
                    onChange={(e) => setWarehouseId(e.target.value)}
                  >
                    {warehouses.map((w) => (
                      <MenuItem key={w.id} value={w.id}>
                        {w.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.warehouseId && <FormHelperText>{fieldErrors.warehouseId}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="inward-type-label">Inward Type</InputLabel>
                  <Select
                    labelId="inward-type-label"
                    value={inwardType}
                    label="Inward Type"
                    onChange={(e) => setInwardType(e.target.value)}
                  >
                    <MenuItem value="Vendor Return">Vendor Return</MenuItem>
                    <MenuItem value="Internal Receipt">Internal Receipt</MenuItem>
                    <MenuItem value="Sample Receipt">Sample Receipt</MenuItem>
                    <MenuItem value="Others">Others</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Reference Number"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
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
            <Typography variant="h5">Material Lines</Typography>

            {lines.map((item, index) => (
              <Grid container spacing={2} key={index} alignItems="center">
                <Grid item xs={12} sm={5}>
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

                <Grid item xs={12} sm={3}>
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
                    label="Line Remarks"
                    value={item.remarks}
                    onChange={(e) => handleLineFieldChange(index, 'remarks', e.target.value)}
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
          <Button onClick={handleSaveInward} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details View Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h3">Material Inward Details: {selectedInward?.inwardNumber}</Typography>
          {selectedInward && (
            <Chip
              label={STATUS_CONFIG[selectedInward.status]?.label}
              color={STATUS_CONFIG[selectedInward.status]?.color}
              size="small"
            />
          )}
        </DialogTitle>
        <DialogContent dividers>
          {selectedInward && (
            <Stack spacing={3}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Warehouse</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{selectedInward.warehouseName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Inward Type</Typography>
                  <Typography variant="body1">{selectedInward.inwardType}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Reference Number</Typography>
                  <Typography variant="body1">{selectedInward.referenceNumber || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Transaction Date</Typography>
                  <Typography variant="body1">{new Date(selectedInward.transactionDate).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Remarks</Typography>
                  <Typography variant="body1">{selectedInward.remarks || 'No remarks provided'}</Typography>
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
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell>Line Remarks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(selectedInward?.lines || []).map((l) => (
                      <TableRow key={l.id}>
                        <TableCell>{l.lineNo}</TableCell>
                        <TableCell>{l.productName}</TableCell>
                        <TableCell align="right">{l.quantity}</TableCell>
                        <TableCell>{l.remarks || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {selectedInward?.status === 'Draft' && canApprove && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleOutlined />}
              onClick={() => handleApprove(selectedInward.id)}
            >
              Approve
            </Button>
          )}
          {selectedInward?.status === 'Approved' && canApprove && (
            <Button
              variant="contained"
              color="error"
              startIcon={<CloseCircleOutlined />}
              onClick={() => handleCancel(selectedInward.id)}
            >
              Cancel Inward
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
