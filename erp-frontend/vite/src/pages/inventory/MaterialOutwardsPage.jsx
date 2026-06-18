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
import FolderOpenOutlined from '@ant-design/icons/FolderOpenOutlined';
import ExportOutlined from '@ant-design/icons/ExportOutlined';

import MainCard from 'components/MainCard';
import {
  getMaterialOutwards,
  getMaterialOutwardById,
  createMaterialOutward,
  approveMaterialOutward,
  cancelMaterialOutward
} from 'api/materialOutwards';
import { getWarehouses } from 'api/warehouses';
import { getProducts } from 'api/products';
import useAuth from 'hooks/useAuth';

const STATUS_CONFIG = {
  'Draft': { label: 'Draft', color: 'default' },
  'Approved': { label: 'Approved', color: 'success' },
  'Cancelled': { label: 'Cancelled', color: 'error' }
};

export default function MaterialOutwardsPage() {
  const { user } = useAuth();
  const role = user?.role?.trim().toLowerCase();
  const canOperate = role === 'admin' || role === 'manager' || role === 'operator';
  const canApprove = role === 'admin' || role === 'manager';

  const [outwards, setOutwards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Dropdowns
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  // Create Dialog states
  const [open, setOpen] = useState(false);
  const [warehouseId, setWarehouseId] = useState('');
  const [outwardType, setOutwardType] = useState('Others');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');
  const [lines, setLines] = useState([{ productId: '', quantity: 1, remarks: '' }]);
  const [submitError, setSubmitError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Details Dialog states
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOutward, setSelectedOutward] = useState(null);

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
      const data = await getMaterialOutwards();
      setOutwards(data.items || []);
    } catch (error) {
      console.error('Failed to load material outwards:', error);
      showNotification('Failed to load material outwards', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadMetadata = async () => {
    try {
      const whs = await getWarehouses();
      setWarehouses(whs || []);

      const prods = await getProducts('', 1, 500);
      setProducts(prods.items || []);
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
    setOutwardType('Others');
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

  const handleSaveOutward = async () => {
    if (!validateForm()) return;

    try {
      setSubmitError('');
      const payload = {
        warehouseId: parseInt(warehouseId, 10),
        transactionDate: new Date(transactionDate).toISOString(),
        remarks: remarks.trim(),
        outwardType,
        referenceNumber: referenceNumber.trim(),
        lines: lines.map((l) => ({
          productId: parseInt(l.productId, 10),
          quantity: parseInt(l.quantity, 10),
          remarks: l.remarks.trim()
        }))
      };

      await createMaterialOutward(payload);
      showNotification('Material Outward created successfully', 'success');
      setOpen(false);
      loadData();
    } catch (error) {
      console.error('Error creating material outward:', error);
      setSubmitError(
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        'Failed to create material outward'
      );
      showNotification('Failed to create material outward', 'error');
    }
  };

  const handleViewDetails = async (row) => {
    try {
      const details = await getMaterialOutwardById(row.id);
      setSelectedOutward(details);
      setDetailOpen(true);
    } catch (error) {
      console.error('Failed to fetch outward details:', error);
      showNotification('Failed to load details', 'error');
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveMaterialOutward(id);
      showNotification('Material Outward approved and stock adjusted', 'success');
      loadData();
      if (detailOpen && selectedOutward?.id === id) {
        setDetailOpen(false);
      }
    } catch (error) {
      console.error('Failed to approve outward:', error);
      showNotification(
        error.response?.data?.message || 'Failed to approve record',
        'error'
      );
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelMaterialOutward(id);
      showNotification('Material Outward cancelled and stock reversed', 'success');
      loadData();
      if (detailOpen && selectedOutward?.id === id) {
        setDetailOpen(false);
      }
    } catch (error) {
      console.error('Failed to cancel outward:', error);
      showNotification(
        error.response?.data?.message || 'Failed to cancel record',
        'error'
      );
    }
  };

  const filteredOutwards = outwards.filter(
    (o) =>
      o.outwardNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.warehouseName?.toLowerCase().includes(search.toLowerCase()) ||
      o.referenceNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.outwardType?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'outwardNumber', headerName: 'Outward Number', flex: 1.2 },
    { field: 'warehouseName', headerName: 'Warehouse', flex: 1.2 },
    { field: 'outwardType', headerName: 'Outward Type', flex: 1 },
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
              <Tooltip title="Approve Outward">
                <IconButton color="success" size="small" onClick={() => handleApprove(params.row.id)}>
                  <CheckCircleOutlined />
                </IconButton>
              </Tooltip>
            )}
            {showCancel && (
              <Tooltip title="Cancel Outward">
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
              Material Outward
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Manage ad-hoc stock dispatches and warehouse outward journals
            </Typography>
          </Grid>
          <Grid item>
            {canOperate && (
              <Button
                variant="contained"
                startIcon={<PlusOutlined />}
                onClick={handleOpenAddDialog}
              >
                New Material Outward
              </Button>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* Grid */}
      <MainCard title="Material Outward Shipments">
        <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
          <TextField
            placeholder="Search by Outward No, Warehouse, Type or Ref"
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
          {filteredOutwards.length === 0 && !loading ? (
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
              <ExportOutlined style={{ fontSize: '48px', color: '#bfbfbf' }} />
              <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
                No material outwards found
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                {search
                  ? 'No records match your search criteria.'
                  : 'Start recording material dispatches.'}
              </Typography>
            </Box>
          ) : (
            <DataGrid
              rows={filteredOutwards}
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
        <DialogTitle>New Material Outward</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={Boolean(fieldErrors.warehouseId)} required>
                  <InputLabel id="wh-select-label">Source Warehouse</InputLabel>
                  <Select
                    labelId="wh-select-label"
                    value={warehouseId}
                    label="Source Warehouse"
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
                  <InputLabel id="outward-type-label">Outward Type</InputLabel>
                  <Select
                    labelId="outward-type-label"
                    value={outwardType}
                    label="Outward Type"
                    onChange={(e) => setOutwardType(e.target.value)}
                  >
                    <MenuItem value="Customer Sample">Customer Sample</MenuItem>
                    <MenuItem value="Scrap/Damage">Scrap/Damage</MenuItem>
                    <MenuItem value="Internal Issue">Internal Issue</MenuItem>
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
          <Button onClick={handleSaveOutward} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details View Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h3">Material Outward Details: {selectedOutward?.outwardNumber}</Typography>
          {selectedOutward && (
            <Chip
              label={STATUS_CONFIG[selectedOutward.status]?.label}
              color={STATUS_CONFIG[selectedOutward.status]?.color}
              size="small"
            />
          )}
        </DialogTitle>
        <DialogContent dividers>
          {selectedOutward && (
            <Stack spacing={3}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Warehouse</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{selectedOutward.warehouseName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Outward Type</Typography>
                  <Typography variant="body1">{selectedOutward.outwardType}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Reference Number</Typography>
                  <Typography variant="body1">{selectedOutward.referenceNumber || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Transaction Date</Typography>
                  <Typography variant="body1">{new Date(selectedOutward.transactionDate).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Remarks</Typography>
                  <Typography variant="body1">{selectedOutward.remarks || 'No remarks provided'}</Typography>
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
                    {selectedOutward.lines.map((l) => (
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
          {selectedOutward?.status === 'Draft' && canApprove && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleOutlined />}
              onClick={() => handleApprove(selectedOutward.id)}
            >
              Approve
            </Button>
          )}
          {selectedOutward?.status === 'Approved' && canApprove && (
            <Button
              variant="contained"
              color="error"
              startIcon={<CloseCircleOutlined />}
              onClick={() => handleCancel(selectedOutward.id)}
            >
              Cancel Outward
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
