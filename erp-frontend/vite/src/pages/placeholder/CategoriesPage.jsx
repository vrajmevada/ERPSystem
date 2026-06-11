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
import TagsOutlined from '@ant-design/icons/TagsOutlined';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import FolderOpenOutlined from '@ant-design/icons/FolderOpenOutlined';

import MainCard from 'components/MainCard';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from 'api/categories';
import useAuth from 'hooks/useAuth';

export default function CategoriesPage() {
  const { user } = useAuth();
  const role = user?.role?.trim().toLowerCase();
  const canWrite = role === 'admin' || role === 'manager';
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Dialog & Form states
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Delete Confirmation Dialog states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Snackbar notification state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      showNotification('Failed to load categories', 'error');
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
    setEditCategoryId(null);
    setName('');
    setSubmitError('');
    setFieldErrors({});
    setOpen(true);
  };

  const handleOpenEditDialog = (category) => {
    setEditCategoryId(category.id);
    setName(category.name);
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
      errors.name = 'Category name is required';
    } else if (name.length > 100) {
      errors.name = 'Category name cannot exceed 100 characters';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveCategory = async () => {
    if (!validateForm()) return;

    try {
      setSubmitError('');
      const payload = { name: name.trim() };

      if (editCategoryId) {
        await updateCategory(editCategoryId, payload);
        showNotification('Category updated successfully', 'success');
      } else {
        await createCategory(payload);
        showNotification('Category created successfully', 'success');
      }
      setOpen(false);
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      setSubmitError(
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        'Failed to save category'
      );
      showNotification('Failed to save category', 'error');
    }
  };

  const handleOpenDeleteConfirm = (category) => {
    setCategoryToDelete(category);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setCategoryToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategory(categoryToDelete.id);
      showNotification('Category deleted successfully', 'success');
      handleCloseDeleteConfirm();
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      showNotification(
        error.response?.data?.message || 'Failed to delete category',
        'error'
      );
    }
  };

  // Instant local filtering by Category Name
  const filteredCategories = categories.filter((cat) =>
    cat.name?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'name', headerName: 'Category Name', flex: 1 },
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
              Categories
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Manage product categories used throughout the ERP system
            </Typography>
          </Grid>
          <Grid item>
            {canWrite && (
              <Button
                variant="contained"
                startIcon={<PlusOutlined />}
                onClick={handleOpenAddDialog}
              >
                Add Category
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
                    Total Categories
                  </Typography>
                  <Typography variant="h3">
                    {categories.length}
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
                  <TagsOutlined style={{ fontSize: '24px' }} />
                </Box>
              </Stack>
            </Box>
          </MainCard>
        </Grid>
      </Grid>

      {/* Search Bar */}
      <MainCard title="Category Directory">
        <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
          <TextField
            placeholder="Search Categories"
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
          {filteredCategories.length === 0 && !loading ? (
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
                No categories found
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                {search
                  ? 'No categories match your search criteria.'
                  : 'Create your first category to get started.'}
              </Typography>
              {!search && canWrite && (
                <Button variant="contained" onClick={handleOpenAddDialog} startIcon={<PlusOutlined />}>
                  Create your first category
                </Button>
              )}
            </Box>
          ) : (
            <DataGrid
              rows={filteredCategories}
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

      {/* Add/Edit Category Dialog */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{editCategoryId ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <TextField
              label="Category Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={Boolean(fieldErrors.name)}
              helperText={fieldErrors.name}
              required
              fullWidth
              autoFocus
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveCategory} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteConfirm} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete &quot;{categoryToDelete?.name}&quot;?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDeleteConfirm}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
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
