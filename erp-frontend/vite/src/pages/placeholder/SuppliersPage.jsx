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
  DialogContentText,
  DialogActions,
  Alert,
  Snackbar,
  Grid,
  Typography
} from '@mui/material';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import TruckOutlined from '@ant-design/icons/TruckOutlined';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import ShopOutlined from '@ant-design/icons/ShopOutlined';

import MainCard from 'components/MainCard';
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier
} from 'api/suppliers';
import useAuth from 'hooks/useAuth';

// Simple debounce helper
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

export default function SuppliersPage() {
  const { user } = useAuth();
  const role = user?.role?.trim().toLowerCase();
  const canWrite = role === 'admin' || role === 'manager';

  const [rows, setRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);

  // Pagination & Search states
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // Dialog & Form states
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [editSupplierId, setEditSupplierId] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Delete Confirmation Dialog states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  // Snackbar notifications state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const loadSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getSuppliers(debouncedSearch, page + 1, pageSize);
      setRows(result.items || []);
      setTotalRows(result.totalCount || 0);
    } catch (error) {
      console.error('Failed to load suppliers:', error);
      showNotification('Failed to load suppliers', 'error');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, pageSize]);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

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
    setEditSupplierId(null);
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setSubmitError('');
    setFieldErrors({});
    setOpen(true);
  };

  const handleOpenEditDialog = (supplier) => {
    setEditSupplierId(supplier.id);
    setName(supplier.name);
    setEmail(supplier.email || '');
    setPhone(supplier.phone || '');
    setAddress(supplier.address || '');
    setSubmitError('');
    setFieldErrors({});
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const validateForm = () => {
    const errors = {};
    if (!name.trim()) {
      errors.name = 'Supplier name is required';
    } else if (name.length > 150) {
      errors.name = 'Supplier name cannot exceed 150 characters';
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = 'Please enter a valid email address';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveSupplier = async () => {
    if (!validateForm()) return;

    try {
      setSubmitError('');
      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim()
      };

      if (editSupplierId) {
        await updateSupplier(editSupplierId, payload);
        showNotification('Supplier updated successfully', 'success');
      } else {
        await createSupplier(payload);
        showNotification('Supplier created successfully', 'success');
      }
      setOpen(false);
      loadSuppliers();
    } catch (error) {
      console.error('Error saving supplier:', error);
      setSubmitError(
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        'Failed to save supplier'
      );
      showNotification('Failed to save supplier', 'error');
    }
  };

  const handleOpenDeleteConfirm = (supplier) => {
    setSupplierToDelete(supplier);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setSupplierToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!supplierToDelete) return;

    try {
      await deleteSupplier(supplierToDelete.id);
      showNotification('Supplier deleted successfully', 'success');
      handleCloseDeleteConfirm();
      loadSuppliers();
    } catch (error) {
      console.error('Error deleting supplier:', error);
      showNotification(
        error.response?.data?.message || 'Failed to delete supplier',
        'error'
      );
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'name', headerName: 'Supplier Name', flex: 1.2 },
    { field: 'email', headerName: 'Email Address', flex: 1.2 },
    { field: 'phone', headerName: 'Phone Number', width: 150 },
    { field: 'address', headerName: 'Address', flex: 1.5 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center" height="100%">
          {canWrite ? (
            <>
              <IconButton
                color="primary"
                size="small"
                onClick={() => handleOpenEditDialog(params.row)}
              >
                <EditOutlined />
              </IconButton>
              <IconButton
                color="error"
                size="small"
                onClick={() => handleOpenDeleteConfirm(params.row)}
              >
                <DeleteOutlined />
              </IconButton>
            </>
          ) : (
            <Typography variant="caption" color="textSecondary">Read-only</Typography>
          )}
        </Stack>
      )
    }
  ];

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
          <Grid item>
            <Typography variant="h2" sx={{ mb: 0.5 }}>
              Suppliers
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Manage vendor profiles, supply lines, and supplier contact details
            </Typography>
          </Grid>
          <Grid item>
            {canWrite && (
              <Button
                variant="contained"
                startIcon={<PlusOutlined />}
                onClick={handleOpenAddDialog}
              >
                Add Supplier
              </Button>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* Statistics Card */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <MainCard content={false} sx={{ borderLeft: '4px solid #1890ff' }}>
            <Box sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack spacing={0.5}>
                  <Typography variant="h6" color="textSecondary">
                    Total Suppliers
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
                  <TruckOutlined style={{ fontSize: '24px' }} />
                </Box>
              </Stack>
            </Box>
          </MainCard>
        </Grid>
      </Grid>

      {/* Search & Actions Bar inside MainCard */}
      <MainCard title="Supplier Directory">
        <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
          <TextField
            placeholder="Search Suppliers"
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
              <ShopOutlined style={{ fontSize: '48px', color: '#bfbfbf' }} />
              <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
                No suppliers found
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                {search
                  ? 'No suppliers match your search criteria.'
                  : 'Create your first supplier to get started.'}
              </Typography>
              {!search && canWrite && (
                <Button variant="contained" onClick={handleOpenAddDialog} startIcon={<PlusOutlined />}>
                  Create your first supplier
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

      {/* Add/Edit Supplier Dialog */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{editSupplierId ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <TextField
              label="Supplier Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={Boolean(fieldErrors.name)}
              helperText={fieldErrors.name}
              required
              fullWidth
              autoFocus
            />
            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={Boolean(fieldErrors.email)}
              helperText={fieldErrors.email}
              fullWidth
            />
            <TextField
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              fullWidth
            />
            <TextField
              label="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              multiline
              rows={2}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveSupplier} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteConfirm} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Supplier</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete &quot;{supplierToDelete?.name}&quot;?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDeleteConfirm}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notifications */}
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
