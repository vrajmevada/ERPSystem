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
  Divider
} from '@mui/material';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import ShoppingCartOutlined from '@ant-design/icons/ShoppingCartOutlined';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import ImportOutlined from '@ant-design/icons/ImportOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';

import MainCard from 'components/MainCard';
import {
  getPurchaseOrders,
  createPurchaseOrder,
  receivePurchaseOrder,
  approvePurchaseOrder
} from 'api/purchaseOrders';
import { getSuppliers } from 'api/suppliers';
import { getWarehouses } from 'api/warehouses';
import { getProducts } from 'api/products';
import useAuth from 'hooks/useAuth';

// Debounce helper
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Status mappings
const STATUS_TYPES = {
  1: { label: 'Draft', color: 'default' },
  'Draft': { label: 'Draft', color: 'default' },
  2: { label: 'Approved', color: 'primary' },
  'Approved': { label: 'Approved', color: 'primary' },
  3: { label: 'Received', color: 'success' },
  'Received': { label: 'Received', color: 'success' },
  4: { label: 'Cancelled', color: 'error' },
  'Cancelled': { label: 'Cancelled', color: 'error' }
};

export default function PurchaseOrdersPage() {
  const { user } = useAuth();
  const role = user?.role?.trim().toLowerCase();
  const canOperate = role === 'admin' || role === 'manager' || role === 'operator';
  const canApprove = role === 'admin' || role === 'manager';

  const [rows, setRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);

  // Pagination & Search
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // Metadata dropdowns
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  // Dialog & Form states
  const [open, setOpen] = useState(false);
  const [supplierId, setSupplierId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [orderItems, setOrderItems] = useState([{ productId: '', quantity: 1, unitPrice: 0.0 }]);
  const [submitError, setSubmitError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Snackbar notifications state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getPurchaseOrders(debouncedSearch, page + 1, pageSize);
      setRows(result.items || []);
      setTotalRows(result.totalCount || 0);
    } catch (error) {
      console.error('Failed to load purchase orders:', error);
      showNotification('Failed to load purchase orders', 'error');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, pageSize]);

  // Load dropdown lists on mount
  const loadMetadata = async () => {
    try {
      const supResult = await getSuppliers('', 1, 200);
      setSuppliers(supResult.items || []);

      const whData = await getWarehouses();
      setWarehouses(whData || []);

      const prodResult = await getProducts('', 1, 200);
      setProducts(prodResult.items || []);
    } catch (err) {
      console.error('Failed to load order metadata dropdowns:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadMetadata();
  }, []);

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
    setSupplierId('');
    setWarehouseId('');
    setOrderItems([{ productId: '', quantity: 1, unitPrice: 0.0 }]);
    setSubmitError('');
    setFieldErrors({});
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleAddItemRow = () => {
    setOrderItems((prev) => [...prev, { productId: '', quantity: 1, unitPrice: 0.0 }]);
  };

  const handleRemoveItemRow = (index) => {
    if (orderItems.length === 1) return; // Keep at least one row
    setOrderItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemFieldChange = (index, field, value) => {
    setOrderItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      // Auto-populate unit price if product is selected
      if (field === 'productId') {
        const selectedProduct = products.find((p) => p.id === value);
        if (selectedProduct) {
          updated[index].unitPrice = selectedProduct.price || 0.0;
        }
      }
      return updated;
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!supplierId) errors.supplierId = 'Supplier is required';
    if (!warehouseId) errors.warehouseId = 'Warehouse is required';

    const itemErrors = [];
    orderItems.forEach((item, index) => {
      if (!item.productId) {
        itemErrors[index] = { productId: 'Product is required' };
      }
      if (!item.quantity || item.quantity <= 0) {
        itemErrors[index] = { ...itemErrors[index], quantity: 'Qty > 0' };
      }
      if (item.unitPrice === undefined || item.unitPrice < 0) {
        itemErrors[index] = { ...itemErrors[index], unitPrice: 'Price >= 0' };
      }
    });

    if (itemErrors.length > 0) {
      errors.items = itemErrors;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveOrder = async () => {
    if (!validateForm()) return;

    try {
      setSubmitError('');
      const payload = {
        supplierId: parseInt(supplierId, 10),
        warehouseId: parseInt(warehouseId, 10),
        items: orderItems.map((item) => ({
          productId: parseInt(item.productId, 10),
          quantity: parseInt(item.quantity, 10),
          unitPrice: parseFloat(item.unitPrice)
        }))
      };

      await createPurchaseOrder(payload);
      showNotification('Purchase Order created successfully', 'success');
      setOpen(false);
      loadData();
    } catch (error) {
      console.error('Error creating purchase order:', error);
      setSubmitError(
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        'Failed to create purchase order'
      );
      showNotification('Failed to create purchase order', 'error');
    }
  };

  const handleApproveOrder = async (id) => {
    try {
      await approvePurchaseOrder(id);
      showNotification('Purchase Order approved successfully', 'success');
      loadData();
    } catch (error) {
      console.error('Failed to approve purchase order:', error);
      showNotification(
        error.response?.data?.message || 'Failed to approve order',
        'error'
      );
    }
  };

  const handleReceiveOrder = async (id) => {
    try {
      await receivePurchaseOrder(id);
      showNotification('Purchase Order received successfully', 'success');
      loadData();
    } catch (error) {
      console.error('Failed to receive purchase order:', error);
      showNotification(
        error.response?.data?.message || 'Failed to receive order',
        'error'
      );
    }
  };

  // Calculate order items summary total
  const orderTotal = orderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice || 0), 0);

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'orderNumber', headerName: 'Order Number', flex: 1 },
    { field: 'supplierName', headerName: 'Supplier', flex: 1.2 },
    {
      field: 'orderDate',
      headerName: 'Order Date',
      flex: 1,
      valueFormatter: (value) => value ? new Date(value).toLocaleDateString() : ''
    },
    {
      field: 'itemCount',
      headerName: 'Items',
      width: 100,
      valueGetter: (value, row) => row.items?.length || 0
    },
    {
      field: 'totalPrice',
      headerName: 'Total Price',
      width: 150,
      renderCell: (params) => {
        const total = params.row.items?.reduce(
          (sum, item) => sum + (item.unitPrice * item.quantity),
          0
        ) || 0;
        return <Typography sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>${total.toFixed(2)}</Typography>;
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => {
        const config = STATUS_TYPES[params.row.status];
        return config ? (
          <Chip label={config.label} color={config.color} size="small" variant="light" />
        ) : (
          <Chip label={`Status ${params.row.status}`} size="small" />
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
        const showApprove = (status === 1 || status === 'Draft') && canApprove;
        const showReceive = (status === 2 || status === 'Approved') && canOperate;
        
        if (!showApprove && !showReceive) {
          return <Typography variant="caption" color="textSecondary">—</Typography>;
        }

        return (
          <Stack direction="row" spacing={1} alignItems="center" height="100%">
            {showApprove && (
              <Tooltip title="Approve Order">
                <IconButton color="success" size="small" onClick={() => handleApproveOrder(params.row.id)}>
                  <CheckCircleOutlined />
                </IconButton>
              </Tooltip>
            )}
            {showReceive && (
              <Tooltip title="Receive Shipment">
                <IconButton color="primary" size="small" onClick={() => handleReceiveOrder(params.row.id)}>
                  <ImportOutlined />
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
              Purchase Orders
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Create, approve, and track purchase shipments with suppliers
            </Typography>
          </Grid>
          <Grid item>
            {canOperate && (
              <Button
                variant="contained"
                startIcon={<PlusOutlined />}
                onClick={handleOpenAddDialog}
              >
                New Purchase Order
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
                    Total Purchase Orders
                  </Typography>
                  <Typography variant="h3">
                    {totalRows}
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
                  <ShoppingCartOutlined style={{ fontSize: '24px' }} />
                </Box>
              </Stack>
            </Box>
          </MainCard>
        </Grid>
      </Grid>

      {/* Search & Actions Bar inside MainCard */}
      <MainCard title="Purchase Orders List">
        <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
          <TextField
            placeholder="Search Orders..."
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
          {rows.length === 0 && !loading ? (
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
              <ShoppingCartOutlined style={{ fontSize: '48px', color: '#bfbfbf' }} />
              <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
                No purchase orders found
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                {search
                  ? 'No orders match your search criteria.'
                  : 'Create your first purchase order to get started.'}
              </Typography>
              {!search && canOperate && (
                <Button variant="contained" onClick={handleOpenAddDialog} startIcon={<PlusOutlined />}>
                  New Purchase Order
                </Button>
              )}
            </Box>
          ) : (
            <DataGrid
              rows={rows}
              columns={columns}
              rowCount={totalRows}
              loading={loading}
              paginationMode="server"
              paginationModel={{
                page,
                pageSize
              }}
              onPaginationModelChange={(model) => {
                setPage(model.page);
                setPageSize(model.pageSize);
              }}
              pageSizeOptions={[5, 10, 25]}
              disableRowSelectionOnClick
            />
          )}
        </Box>
      </MainCard>

      {/* New Purchase Order Dialog */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>New Purchase Order</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}

            <Grid container spacing={2}>
              {/* Supplier Dropdown */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={Boolean(fieldErrors.supplierId)} required>
                  <InputLabel id="supplier-select-label">Supplier</InputLabel>
                  <Select
                    labelId="supplier-select-label"
                    value={supplierId}
                    label="Supplier"
                    onChange={(e) => setSupplierId(e.target.value)}
                  >
                    {suppliers.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.supplierId && (
                    <FormHelperText>{fieldErrors.supplierId}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Warehouse Dropdown */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={Boolean(fieldErrors.warehouseId)} required>
                  <InputLabel id="warehouse-select-label">Warehouse (Delivery Location)</InputLabel>
                  <Select
                    labelId="warehouse-select-label"
                    value={warehouseId}
                    label="Warehouse"
                    onChange={(e) => setWarehouseId(e.target.value)}
                  >
                    {warehouses.map((w) => (
                      <MenuItem key={w.id} value={w.id}>
                        {w.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.warehouseId && (
                    <FormHelperText>{fieldErrors.warehouseId}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>

            <Divider />
            <Typography variant="h5">Order Items</Typography>

            {/* Order Items List */}
            {orderItems.map((item, index) => (
              <Grid container spacing={2} key={index} alignItems="center">
                {/* Product Select */}
                <Grid item xs={12} sm={5}>
                  <FormControl
                    fullWidth
                    error={Boolean(fieldErrors.items?.[index]?.productId)}
                    required
                  >
                    <InputLabel id={`product-select-label-${index}`}>Product</InputLabel>
                    <Select
                      labelId={`product-select-label-${index}`}
                      value={item.productId}
                      label="Product"
                      onChange={(e) => handleItemFieldChange(index, 'productId', e.target.value)}
                    >
                      {products.map((p) => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.name} (${Number(p.price).toFixed(2)})
                        </MenuItem>
                      ))}
                    </Select>
                    {fieldErrors.items?.[index]?.productId && (
                      <FormHelperText>{fieldErrors.items?.[index]?.productId}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Quantity */}
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Quantity"
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemFieldChange(index, 'quantity', parseInt(e.target.value, 10) || 0)
                    }
                    error={Boolean(fieldErrors.items?.[index]?.quantity)}
                    helperText={fieldErrors.items?.[index]?.quantity}
                    required
                    fullWidth
                  />
                </Grid>

                {/* Unit Price */}
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Unit Price"
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) =>
                      handleItemFieldChange(index, 'unitPrice', parseFloat(e.target.value) || 0.0)
                    }
                    error={Boolean(fieldErrors.items?.[index]?.unitPrice)}
                    helperText={fieldErrors.items?.[index]?.unitPrice}
                    required
                    fullWidth
                  />
                </Grid>

                {/* Remove Row Button */}
                <Grid item xs={12} sm={1}>
                  <IconButton
                    color="error"
                    disabled={orderItems.length === 1}
                    onClick={() => handleRemoveItemRow(index)}
                  >
                    <DeleteOutlined />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Button variant="outlined" startIcon={<PlusOutlined />} onClick={handleAddItemRow}>
                Add Item
              </Button>
              <Typography variant="h4" color="primary">
                Order Total: ${orderTotal.toFixed(2)}
              </Typography>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveOrder} variant="contained">
            Create Order
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
