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
  Paper,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import CloseCircleOutlined from '@ant-design/icons/CloseCircleOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import CarOutlined from '@ant-design/icons/CarOutlined';
import SendOutlined from '@ant-design/icons/SendOutlined';

import MainCard from 'components/MainCard';
import {
  getDeliveryChallans,
  getDeliveryChallanById,
  createDeliveryChallan,
  shipDeliveryChallan,
  cancelDeliveryChallan
} from 'api/deliveryChallans';
import { getCustomers } from 'api/customers';
import { getWarehouses } from 'api/warehouses';
import { getProducts } from 'api/products';
import useAuth from 'hooks/useAuth';

const STATUS_CONFIG = {
  'Draft': { label: 'Draft', color: 'default' },
  'Shipped': { label: 'Shipped', color: 'success' },
  'Cancelled': { label: 'Cancelled', color: 'error' }
};

export default function DeliveryChallansPage() {
  const { user } = useAuth();
  const role = user?.role?.trim().toLowerCase();
  const canOperate = role === 'admin' || role === 'manager' || role === 'operator';
  const canApprove = role === 'admin' || role === 'manager';

  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Dropdowns
  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  // Create Dialog states
  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [fromWarehouseId, setFromWarehouseId] = useState('');
  const [challanDate, setChallanDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');
  
  // Logistics Info
  const [dispatchDocNo, setDispatchDocNo] = useState('');
  const [dispatchThrough, setDispatchThrough] = useState('');
  const [destination, setDestination] = useState('');
  const [termsOfDelivery, setTermsOfDelivery] = useState('');
  const [lrNo, setLrNo] = useState('');
  const [lrDt, setLrDt] = useState('');
  const [transporterName, setTransporterName] = useState('');
  const [isLrReceived, setIsLrReceived] = useState(false);
  const [contactPerson, setContactPerson] = useState('');

  // Lines
  const [lines, setLines] = useState([{ productId: '', quantity: 1, unitPrice: 0, discountPercentage: 0, notes: '' }]);
  const [submitError, setSubmitError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Details Dialog states
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState(null);

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
      const data = await getDeliveryChallans();
      setChallans(Array.isArray(data) ? data : (data && Array.isArray(data.items) ? data.items : []));
    } catch (error) {
      console.error('Failed to load delivery challans:', error);
      showNotification('Failed to load delivery challans', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadMetadata = async () => {
    try {
      const custs = await getCustomers('', 1, 500);
      setCustomers(Array.isArray(custs) ? custs : (custs && Array.isArray(custs.items) ? custs.items : []));

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
    setCustomerId('');
    setFromWarehouseId('');
    setChallanDate(new Date().toISOString().split('T')[0]);
    setRemarks('');
    setDispatchDocNo('');
    setDispatchThrough('');
    setDestination('');
    setTermsOfDelivery('');
    setLrNo('');
    setLrDt('');
    setTransporterName('');
    setIsLrReceived(false);
    setContactPerson('');
    setLines([{ productId: '', quantity: 1, unitPrice: 0, discountPercentage: 0, notes: '' }]);
    setSubmitError('');
    setFieldErrors({});
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleAddLineRow = () => {
    setLines((prev) => [...prev, { productId: '', quantity: 1, unitPrice: 0, discountPercentage: 0, notes: '' }]);
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
    if (!customerId) errors.customerId = 'Customer is required';
    if (!fromWarehouseId) errors.fromWarehouseId = 'From warehouse is required';
    if (!challanDate) errors.challanDate = 'Challan date is required';

    const itemErrors = [];
    lines.forEach((item, index) => {
      if (!item.productId) {
        itemErrors[index] = { productId: 'Product is required' };
      }
      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        itemErrors[index] = { ...itemErrors[index], quantity: 'Qty > 0' };
      }
      const price = parseFloat(item.unitPrice);
      if (isNaN(price) || price < 0) {
        itemErrors[index] = { ...itemErrors[index], unitPrice: 'Price >= 0' };
      }
      const disc = parseFloat(item.discountPercentage);
      if (isNaN(disc) || disc < 0 || disc > 100) {
        itemErrors[index] = { ...itemErrors[index], discountPercentage: 'Discount 0-100' };
      }
    });

    if (itemErrors.length > 0) {
      errors.items = itemErrors;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveChallan = async () => {
    if (!validateForm()) return;

    try {
      setSubmitError('');
      const payload = {
        customerId: parseInt(customerId, 10),
        fromWarehouseId: parseInt(fromWarehouseId, 10),
        challanDate: new Date(challanDate).toISOString(),
        remarks: remarks.trim(),
        dispatchDocNo: dispatchDocNo.trim(),
        dispatchThrough: dispatchThrough.trim(),
        destination: destination.trim(),
        termsOfDelivery: termsOfDelivery.trim(),
        lrNo: lrNo.trim(),
        lrDt: lrDt ? new Date(lrDt).toISOString() : null,
        transporterName: transporterName.trim(),
        isLrReceived,
        contactPerson: contactPerson.trim(),
        lines: lines.map((l) => ({
          productId: parseInt(l.productId, 10),
          quantity: parseInt(l.quantity, 10),
          unitPrice: parseFloat(l.unitPrice),
          discountPercentage: parseFloat(l.discountPercentage),
          notes: l.notes.trim()
        }))
      };

      await createDeliveryChallan(payload);
      showNotification('Delivery Challan created successfully', 'success');
      setOpen(false);
      loadData();
    } catch (error) {
      console.error('Error creating delivery challan:', error);
      setSubmitError(
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        'Failed to create delivery challan'
      );
      showNotification('Failed to create delivery challan', 'error');
    }
  };

  const handleViewDetails = async (row) => {
    try {
      const details = await getDeliveryChallanById(row.id);
      setSelectedChallan(details);
      setDetailOpen(true);
    } catch (error) {
      console.error('Failed to fetch details:', error);
      showNotification('Failed to load details', 'error');
    }
  };

  const handleShip = async (id) => {
    try {
      await shipDeliveryChallan(id);
      showNotification('Delivery Challan shipped. Inventory deducted successfully.', 'success');
      loadData();
      if (detailOpen && selectedChallan?.id === id) {
        setDetailOpen(false);
      }
    } catch (error) {
      console.error('Failed to ship challan:', error);
      showNotification(
        error.response?.data?.message || 'Failed to ship delivery challan',
        'error'
      );
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelDeliveryChallan(id);
      showNotification('Delivery Challan cancelled. Inventory restored successfully.', 'success');
      loadData();
      if (detailOpen && selectedChallan?.id === id) {
        setDetailOpen(false);
      }
    } catch (error) {
      console.error('Failed to cancel challan:', error);
      showNotification(
        error.response?.data?.message || 'Failed to cancel delivery challan',
        'error'
      );
    }
  };

  const filteredChallans = challans.filter(
    (c) =>
      c.challanNumber?.toLowerCase().includes(search.toLowerCase()) ||
      c.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      c.fromWarehouseName?.toLowerCase().includes(search.toLowerCase()) ||
      c.remarks?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'challanNumber', headerName: 'Challan No', flex: 1.2 },
    { field: 'customerName', headerName: 'Customer', flex: 1.2 },
    { field: 'fromWarehouseName', headerName: 'From Warehouse', flex: 1.2 },
    {
      field: 'challanDate',
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
        const showShip = status === 'Draft' && canOperate;
        const showCancel = status === 'Shipped' && canApprove;

        return (
          <Stack direction="row" spacing={0.5} alignItems="center" height="100%">
            <Tooltip title="View Details">
              <IconButton color="secondary" size="small" onClick={() => handleViewDetails(params.row)}>
                <EyeOutlined />
              </IconButton>
            </Tooltip>
            {showShip && (
              <Tooltip title="Ship Challan">
                <IconButton color="success" size="small" onClick={() => handleShip(params.row.id)}>
                  <SendOutlined />
                </IconButton>
              </Tooltip>
            )}
            {showCancel && (
              <Tooltip title="Cancel Challan">
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
              Delivery Challans
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Manage product deliveries, LR documents, and warehouse shipment releases
            </Typography>
          </Grid>
          <Grid item>
            {canOperate && (
              <Button
                variant="contained"
                startIcon={<PlusOutlined />}
                onClick={handleOpenAddDialog}
              >
                New Delivery Challan
              </Button>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* Grid */}
      <MainCard title="All Delivery Challans">
        <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
          <TextField
            placeholder="Search by Challan No, Customer or Warehouse"
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
          {filteredChallans.length === 0 && !loading ? (
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
              <CarOutlined style={{ fontSize: '48px', color: '#bfbfbf' }} />
              <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
                No delivery challans found
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                {search
                  ? 'No records match your search criteria.'
                  : 'Record customer shipments and delivery challans.'}
              </Typography>
            </Box>
          ) : (
            <DataGrid
              rows={filteredChallans}
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
        <DialogTitle>New Delivery Challan</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}

            <Typography variant="h5">General Info</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth error={Boolean(fieldErrors.customerId)} required>
                  <InputLabel id="cust-label">Customer</InputLabel>
                  <Select
                    labelId="cust-label"
                    value={customerId}
                    label="Customer"
                    onChange={(e) => setCustomerId(e.target.value)}
                  >
                    {customers.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.customerId && <FormHelperText>{fieldErrors.customerId}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormControl fullWidth error={Boolean(fieldErrors.fromWarehouseId)} required>
                  <InputLabel id="wh-from-label">From Warehouse</InputLabel>
                  <Select
                    labelId="wh-from-label"
                    value={fromWarehouseId}
                    label="From Warehouse"
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

              <Grid item xs={12} sm={4}>
                <TextField
                  label="Challan Date"
                  type="date"
                  value={challanDate}
                  onChange={(e) => setChallanDate(e.target.value)}
                  error={Boolean(fieldErrors.challanDate)}
                  helperText={fieldErrors.challanDate}
                  InputLabelProps={{ shrink: true }}
                  required
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="Contact Person"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
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

            <Divider />
            <Typography variant="h5">Logistics & Dispatch Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Dispatch Doc No"
                  value={dispatchDocNo}
                  onChange={(e) => setDispatchDocNo(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Dispatch Through"
                  value={dispatchThrough}
                  onChange={(e) => setDispatchThrough(e.target.value)}
                  placeholder="e.g. Road, Air, Rail"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="Terms of Delivery"
                  value={termsOfDelivery}
                  onChange={(e) => setTermsOfDelivery(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="LR Number"
                  value={lrNo}
                  onChange={(e) => setLrNo(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="LR Date"
                  type="date"
                  value={lrDt}
                  onChange={(e) => setLrDt(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={8}>
                <TextField
                  label="Transporter Name"
                  value={transporterName}
                  onChange={(e) => setTransporterName(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isLrReceived}
                      onChange={(e) => setIsLrReceived(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="LR Received"
                />
              </Grid>
            </Grid>

            <Divider />
            <Typography variant="h5">Challan Items</Typography>

            {lines.map((item, index) => (
              <Grid container spacing={2} key={index} alignItems="center">
                <Grid item xs={12} sm={4}>
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

                <Grid item xs={12} sm={2}>
                  <TextField
                    label="Unit Price"
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) =>
                      handleLineFieldChange(index, 'unitPrice', parseFloat(e.target.value) || 0)
                    }
                    error={Boolean(fieldErrors.items?.[index]?.unitPrice)}
                    helperText={fieldErrors.items?.[index]?.unitPrice}
                    required
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} sm={1.5}>
                  <TextField
                    label="Disc %"
                    type="number"
                    value={item.discountPercentage}
                    onChange={(e) =>
                      handleLineFieldChange(index, 'discountPercentage', parseFloat(e.target.value) || 0)
                    }
                    error={Boolean(fieldErrors.items?.[index]?.discountPercentage)}
                    helperText={fieldErrors.items?.[index]?.discountPercentage}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} sm={1.5}>
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
          <Button onClick={handleSaveChallan} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details View Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h3">Delivery Challan Details: {selectedChallan?.challanNumber}</Typography>
          {selectedChallan && (
            <Chip
              label={STATUS_CONFIG[selectedChallan.status]?.label}
              color={STATUS_CONFIG[selectedChallan.status]?.color}
              size="small"
            />
          )}
        </DialogTitle>
        <DialogContent dividers>
          {selectedChallan && (
            <Stack spacing={3}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="textSecondary">Customer</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{selectedChallan.customerName}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="textSecondary">From Warehouse</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{selectedChallan.fromWarehouseName}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="textSecondary">Challan Date</Typography>
                  <Typography variant="body1">{new Date(selectedChallan.challanDate).toLocaleDateString()}</Typography>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="textSecondary">Contact Person</Typography>
                  <Typography variant="body1">{selectedChallan.contactPerson || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Typography variant="subtitle2" color="textSecondary">Remarks</Typography>
                  <Typography variant="body1">{selectedChallan.remarks || 'No remarks provided'}</Typography>
                </Grid>
              </Grid>

              <Divider />
              <Typography variant="h5">Logistics Details</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <Typography variant="subtitle2" color="textSecondary">Dispatch Doc No</Typography>
                  <Typography variant="body1">{selectedChallan.dispatchDocNo || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="subtitle2" color="textSecondary">Dispatch Through</Typography>
                  <Typography variant="body1">{selectedChallan.dispatchThrough || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="subtitle2" color="textSecondary">Destination</Typography>
                  <Typography variant="body1">{selectedChallan.destination || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="subtitle2" color="textSecondary">Terms of Delivery</Typography>
                  <Typography variant="body1">{selectedChallan.termsOfDelivery || '—'}</Typography>
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Typography variant="subtitle2" color="textSecondary">LR Number</Typography>
                  <Typography variant="body1">{selectedChallan.lrNo || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="subtitle2" color="textSecondary">LR Date</Typography>
                  <Typography variant="body1">{selectedChallan.lrDt ? new Date(selectedChallan.lrDt).toLocaleDateString() : '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="subtitle2" color="textSecondary">Transporter Name</Typography>
                  <Typography variant="body1">{selectedChallan.transporterName || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="subtitle2" color="textSecondary">LR Status</Typography>
                  <Chip label={selectedChallan.isLrReceived ? "LR Received" : "LR Pending"} size="small" color={selectedChallan.isLrReceived ? "success" : "default"} />
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
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Discount %</TableCell>
                      <TableCell align="right">Discount Amt</TableCell>
                      <TableCell align="right">Total Amt</TableCell>
                      <TableCell>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(selectedChallan?.lines || []).map((l) => (
                      <TableRow key={l.id}>
                        <TableCell>{l.lineNo}</TableCell>
                        <TableCell>{l.productName}</TableCell>
                        <TableCell align="right">{l.quantity}</TableCell>
                        <TableCell align="right">${l.unitPrice.toFixed(2)}</TableCell>
                        <TableCell align="right">{l.discountPercentage}%</TableCell>
                        <TableCell align="right">${l.discountAmount.toFixed(2)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>${l.totalAmount.toFixed(2)}</TableCell>
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
          {selectedChallan?.status === 'Draft' && canOperate && (
            <Button
              variant="contained"
              color="success"
              startIcon={<SendOutlined />}
              onClick={() => handleShip(selectedChallan.id)}
            >
              Ship Delivery
            </Button>
          )}
          {selectedChallan?.status === 'Shipped' && canApprove && (
            <Button
              variant="contained"
              color="error"
              startIcon={<CloseCircleOutlined />}
              onClick={() => handleCancel(selectedChallan.id)}
            >
              Cancel Challan
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
