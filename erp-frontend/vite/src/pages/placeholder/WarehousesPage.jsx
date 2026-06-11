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
import DatabaseOutlined from '@ant-design/icons/DatabaseOutlined';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import FolderOpenOutlined from '@ant-design/icons/FolderOpenOutlined';

import MainCard from 'components/MainCard';
import {
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse
} from 'api/warehouses';
import useAuth from 'hooks/useAuth';

export default function WarehousesPage() {
  const { user } = useAuth();
  const role = user?.role?.trim().toLowerCase();
  const canWrite = role === 'admin' || role === 'manager';

  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Dialog & Form states
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [editWarehouseId, setEditWarehouseId] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Delete Confirmation Dialog states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [warehouseToDelete, setWarehouseToDelete] = useState(null);

  // Snackbar notification state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadWarehouses();
  }, []);

  const loadWarehouses = async () => {
    setLoading(true);
    try {
      const data = await getWarehouses();
      setWarehouses(data || []);
    } catch (error) {
      console.error('Failed to fetch warehouses:', error);
      showNotification('Failed to load warehouses', 'error');
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
    setEditWarehouseId(null);
    setName('');
    setLocation('');
    setSubmitError('');
    setFieldErrors({});
    setOpen(true);
  };

  const handleOpenEditDialog = (warehouse) => {
    setEditWarehouseId(warehouse.id);
    setName(warehouse.name);
    setLocation(warehouse.location || '');
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
      errors.name = 'Warehouse name is required';
    } else if (name.length > 100) {
      errors.name = 'Warehouse name cannot exceed 100 characters';
    }

    if (!location.trim()) {
      errors.location = 'Location is required';
    } else if (location.length > 200) {
      errors.location = 'Location cannot exceed 200 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveWarehouse = async () => {
    if (!validateForm()) return;

    try {
      setSubmitError('');
      const payload = {
        name: name.trim(),
        location: location.trim()
      };

      if (editWarehouseId) {
        await updateWarehouse(editWarehouseId, payload);
        showNotification('Warehouse updated successfully', 'success');
      } else {
        await createWarehouse(payload);
        showNotification('Warehouse created successfully', 'success');
      }
      setOpen(false);
      loadWarehouses();
    } catch (error) {
      console.error('Error saving warehouse:', error);
      setSubmitError(
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        'Failed to save warehouse'
      );
      showNotification('Failed to save warehouse', 'error');
    }
  };

  const handleOpenDeleteConfirm = (warehouse) => {
    setWarehouseToDelete(warehouse);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setWarehouseToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!warehouseToDelete) return;

    try {
      await deleteWarehouse(warehouseToDelete.id);
      showNotification('Warehouse deleted successfully', 'success');
      handleCloseDeleteConfirm();
      loadWarehouses();
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      showNotification(
        error.response?.data?.message || 'Failed to delete warehouse',
        'error'
      );
    }
  };

  // Instant local filtering by Warehouse Name or Location
  const filteredWarehouses = warehouses.filter(
    (w) =>
      w.name?.toLowerCase().includes(search.toLowerCase()) ||
      w.location?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'name', headerName: 'Warehouse Name', flex: 1.2 },
    { field: 'location', headerName: 'Location', flex: 1.8 },
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
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
          <Grid item>
            <Typography variant="h2" sx={{ mb: 0.5 }}>
              Warehouses
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Monitor inventory levels, warehouse locations, and stock capacities
            </Typography>
          </Grid>
          <Grid item>
            {canWrite && (
              <Button
                variant="contained"
                startIcon={<PlusOutlined />}
                onClick={handleOpenAddDialog}
              >
                Add Warehouse
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
                    Total Warehouses
                  </Typography>
                  <Typography variant="h3">
                    {warehouses.length}
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
                  <DatabaseOutlined style={{ fontSize: '24px' }} />
                </Box>
              </Stack>
            </Box>
          </MainCard>
        </Grid>
      </Grid>

      {/* Search Bar & Grid */}
      <MainCard title="Warehouse Directory">
        <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
          <TextField
            placeholder="Search Warehouses"
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
        <Box sx={{ height: 450, width: '100%' }}>
          {filteredWarehouses.length === 0 && !loading ? (
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
                No warehouses found
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                {search
                  ? 'No warehouses match your search criteria.'
                  : 'Create your first warehouse to get started.'}
              </Typography>
              {!search && canWrite && (
                <Button variant="contained" onClick={handleOpenAddDialog} startIcon={<PlusOutlined />}>
                  Create your first warehouse
                </Button>
              )}
            </Box>
          ) : (
            <DataGrid
              rows={filteredWarehouses}
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

      {/* Add/Edit Warehouse Dialog */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{editWarehouseId ? 'Edit Warehouse' : 'Add Warehouse'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <TextField
              label="Warehouse Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={Boolean(fieldErrors.name)}
              helperText={fieldErrors.name}
              required
              fullWidth
              autoFocus
            />
            <TextField
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              error={Boolean(fieldErrors.location)}
              helperText={fieldErrors.location}
              required
              fullWidth
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveWarehouse} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteConfirm} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Warehouse</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete &quot;{warehouseToDelete?.name}&quot;?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDeleteConfirm}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Alerts */}
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
