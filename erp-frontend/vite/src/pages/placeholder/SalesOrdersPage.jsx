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
import FileDoneOutlined from '@ant-design/icons/FileDoneOutlined';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import TruckOutlined from '@ant-design/icons/TruckOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';

import MainCard from 'components/MainCard';
import {
  getSalesOrders,
  createSalesOrder,
  confirmSalesOrder,
  shipSalesOrder
} from 'api/salesOrders';
import { getCustomers } from 'api/customers';
import { getWarehouses } from 'api/warehouses';
import { getProducts } from 'api/products';
import { getStockItems } from 'api/stockItems';
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
  2: { label: 'Confirmed', color: 'primary' },
  'Confirmed': { label: 'Confirmed', color: 'primary' },
  3: { label: 'Shipped', color: 'success' },
  'Shipped': { label: 'Shipped', color: 'success' },
  4: { label: 'Cancelled', color: 'error' },
  'Cancelled': { label: 'Cancelled', color: 'error' }
};

export default function SalesOrdersPage() {
  const { user } = useAuth();
  const role = user?.role?.trim().toLowerCase();
  const canOperate = role === 'admin' || role === 'manager' || role === 'operator';

  const [rows, setRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);

  // Pagination & Search
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // Metadata dropdowns
  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [stockItems, setStockItems] = useState([]);

  // Dialog & Form states
  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState('');
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
      const result = await getSalesOrders(debouncedSearch, page + 1, pageSize);
      setRows(result.items || []);
      setTotalRows(result.totalCount || 0);
    } catch (error) {
      console.error('Failed to load sales orders:', error);
      showNotification('Failed to load sales orders', 'error');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, pageSize]);

  // Load dropdown lists on mount
  const loadMetadata = async () => {
    try {
      const custResult = await getCustomers('', 1, 200);
      setCustomers(custResult.items || []);

      const whData = await getWarehouses();
      setWarehouses(whData || []);

      const prodResult = await getProducts('', 1, 200);
      setProducts(prodResult.items || []);

      const stockResult = await getStockItems('', 1, 500);
      setStockItems(stockResult.items || []);
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

  const handleOpenAddDialog = async () => {
    setCustomerId('');
    setWarehouseId('');
    setOrderItems([{ productId: '', quantity: 1, unitPrice: 0.0 }]);
    setSubmitError('');
    setFieldErrors({});
    setOpen(true);
    try {
      const stockResult = await getStockItems('', 1, 500);
      setStockItems(stockResult.items || []);
    } catch (err) {
      console.error('Failed to refresh stock metadata:', err);
    }
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
    if (!customerId) errors.customerId = 'Customer is required';
    if (!warehouseId) errors.warehouseId = 'Warehouse is required';

    const itemErrors = [];
    orderItems.forEach((item, index) => {
      let rowErrors = {};
      if (!item.productId) {
        rowErrors.productId = 'Product is required';
      }
      if (!item.quantity || item.quantity <= 0) {
        rowErrors.quantity = 'Qty > 0';
      }
      if (item.unitPrice === undefined || item.unitPrice < 0) {
        rowErrors.unitPrice = 'Price >= 0';
      }

      // Inventory Validation
      if (warehouseId && item.productId) {
        const matchingStock = stockItems.find(
          (s) => s.productId === item.productId && s.warehouseId === warehouseId
        );
        const available = matchingStock ? matchingStock.quantity : 0;
        if (item.quantity > available) {
          rowErrors.quantity = `❌ Insufficient Stock. Available: ${available}. Requested: ${item.quantity}`;
        }
      }

      if (Object.keys(rowErrors).length > 0) {
        itemErrors[index] = rowErrors;
      }
    });

    const hasItemErrors = itemErrors.some((err) => err && Object.keys(err).length > 0);
    if (hasItemErrors) {
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
        customerId: parseInt(customerId, 10),
        warehouseId: parseInt(warehouseId, 10),
        items: orderItems.map((item) => ({
          productId: parseInt(item.productId, 10),
          quantity: parseInt(item.quantity, 10),
          unitPrice: parseFloat(item.unitPrice)
        }))
      };

      await createSalesOrder(payload);
      showNotification('Sales Order created successfully', 'success');
      setOpen(false);
      loadData();
    } catch (error) {
      console.error('Error creating sales order:', error);
      setSubmitError(
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        'Failed to create sales order'
      );
      showNotification('Failed to create sales order', 'error');
    }
  };

  const handleConfirmOrder = async (id) => {
    try {
      await confirmSalesOrder(id);
      showNotification('Sales Order confirmed successfully', 'success');
      loadData();
    } catch (error) {
      console.error('Failed to confirm sales order:', error);
      showNotification(
        error.response?.data?.message || 'Failed to confirm order',
        'error'
      );
    }
  };

  const handleShipOrder = async (id) => {
    try {
      await shipSalesOrder(id);
      showNotification('Sales Order shipped successfully', 'success');
      loadData();
    } catch (error) {
      console.error('Failed to ship sales order:', error);
      showNotification(
        error.response?.data?.message || 'Failed to ship order',
        'error'
      );
    }
  };

  // Calculate order items summary total
  const orderTotal = orderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice || 0), 0);

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'orderNumber', headerName: 'Order Number', flex: 1 },
    { field: 'customerName', headerName: 'Customer', flex: 1.2 },
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
        const showConfirm = (status === 1 || status === 'Draft') && canOperate;
        const showShip = (status === 2 || status === 'Confirmed') && canOperate;

        if (!showConfirm && !showShip) {
          return <Typography variant="caption" color="textSecondary">—</Typography>;
        }

        return (
          <Stack direction="row" spacing={1} alignItems="center" height="100%">
            {showConfirm && (
              <Tooltip title="Confirm Order">
                <IconButton color="primary" size="small" onClick={() => handleConfirmOrder(params.row.id)}>
                  <CheckCircleOutlined />
                </IconButton>
              </Tooltip>
            )}
            {showShip && (
              <Tooltip title="Ship Order">
                <IconButton color="success" size="small" onClick={() => handleShipOrder(params.row.id)}>
                  <TruckOutlined />
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
              Sales Orders
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Create, confirm, and track customer sales orders and shipments
            </Typography>
          </Grid>
          <Grid item>
            {canOperate && (
              <Button
                variant="contained"
                startIcon={<PlusOutlined />}
                onClick={handleOpenAddDialog}
              >
                New Sales Order
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
                    Total Sales Orders
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
                  <FileDoneOutlined style={{ fontSize: '24px' }} />
                </Box>
              </Stack>
            </Box>
          </MainCard>
        </Grid>
      </Grid>

      {/* Search & Actions Bar inside MainCard */}
      <MainCard title="Sales Orders List">
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
              <FileDoneOutlined style={{ fontSize: '48px', color: '#bfbfbf' }} />
              <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
                No sales orders found
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                {search
                  ? 'No orders match your search criteria.'
                  : 'Create your first sales order to get started.'}
              </Typography>
              {!search && canOperate && (
                <Button variant="contained" onClick={handleOpenAddDialog} startIcon={<PlusOutlined />}>
                  New Sales Order
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

      {/* New Sales Order Dialog */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>New Sales Order</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}

            <Grid container spacing={2}>
              {/* Customer Dropdown */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={Boolean(fieldErrors.customerId)} required>
                  <InputLabel id="customer-select-label">Customer</InputLabel>
                  <Select
                    labelId="customer-select-label"
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
                  {fieldErrors.customerId && (
                    <FormHelperText>{fieldErrors.customerId}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Warehouse Dropdown */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={Boolean(fieldErrors.warehouseId)} required>
                  <InputLabel id="warehouse-select-label">Warehouse (Dispatch Location)</InputLabel>
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
            {orderItems.map((item, index) => {
              const matchingStock = stockItems.find(
                (s) => s.productId === item.productId && s.warehouseId === warehouseId
              );
              const available = warehouseId && item.productId ? (matchingStock ? matchingStock.quantity : 0) : null;

              return (
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
                        {products.map((p) => {
                          const pStock = stockItems.find((s) => s.productId === p.id && s.warehouseId === warehouseId);
                          const pAvailable = warehouseId ? (pStock ? pStock.quantity : 0) : null;
                          return (
                            <MenuItem key={p.id} value={p.id}>
                              {p.name} (${Number(p.price).toFixed(2)}) {pAvailable !== null ? `[Stock: ${pAvailable}]` : ''}
                            </MenuItem>
                          );
                        })}
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
                      helperText={fieldErrors.items?.[index]?.quantity || (available !== null ? `Available: ${available}` : '')}
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
            );
          })}

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
