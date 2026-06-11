import { useEffect, useState } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  FormHelperText,
  Typography
} from '@mui/material';
import EditOutlined from '@ant-design/icons/EditOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import MainCard from 'components/MainCard';
import { getProducts, createProduct, getCategories, updateProduct, deleteProduct } from 'api/products';

export default function ProductsPage() {
  const [rows, setRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  // Dialog & Form states
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [editProductId, setEditProductId] = useState(null);

  // Delete Dialog states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productIdToDelete, setProductIdToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    loadProducts();
  }, [page, pageSize, search]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const result = await getProducts(search, page + 1, pageSize);
      setRows(result.items || []);
      setTotalRows(result.totalCount || 0);
    } catch (error) {
      console.error(error);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await getCategories();
      setCategories(cats || []);
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  const handleOpenAddDialog = () => {
    setEditProductId(null);
    setName('');
    setPrice('');
    setCategoryId('');
    setSubmitError('');
    setFieldErrors({});
    setOpen(true);
  };

  const handleOpenEditDialog = (product) => {
    setEditProductId(product.id);
    setName(product.name);
    setPrice(product.price.toString());
    setCategoryId(product.categoryId || '');
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
      errors.name = 'Product name is required';
    } else if (name.length > 150) {
      errors.name = 'Product name cannot exceed 150 characters';
    }

    const numericPrice = parseFloat(price);
    if (!price || isNaN(numericPrice)) {
      errors.price = 'Price is required';
    } else if (numericPrice <= 0) {
      errors.price = 'Price must be greater than 0';
    }

    if (!categoryId) {
      errors.categoryId = 'Category is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProduct = async () => {
    if (!validateForm()) return;

    try {
      setSubmitError('');
      const productData = {
        name: name.trim(),
        price: parseFloat(price),
        categoryId: parseInt(categoryId, 10)
      };

      if (editProductId) {
        await updateProduct(editProductId, productData);
      } else {
        await createProduct(productData);
      }
      setOpen(false);
      loadProducts();
    } catch (error) {
      console.error(error);
      setSubmitError(
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        `Failed to ${editProductId ? 'update' : 'add'} product`
      );
    }
  };

  const handleOpenDeleteConfirm = (id) => {
    setProductIdToDelete(id);
    setDeleteError('');
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setProductIdToDelete(null);
    setDeleteError('');
  };

  const handleDeleteProduct = async () => {
    if (!productIdToDelete) return;
    try {
      setDeleteError('');
      await deleteProduct(productIdToDelete);
      setDeleteConfirmOpen(false);
      setProductIdToDelete(null);
      loadProducts();
    } catch (error) {
      console.error(error);
      setDeleteError(
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        'Failed to delete product'
      );
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'name', headerName: 'Product Name', flex: 1 },
    { 
      field: 'price', 
      headerName: 'Price', 
      width: 150, 
      valueFormatter: (value) => (value !== undefined && value !== null ? `$${Number(value).toFixed(2)}` : '') 
    },
    { field: 'categoryName', headerName: 'Category', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center" height="100%">
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
            onClick={() => handleOpenDeleteConfirm(params.row.id)}
          >
            <DeleteOutlined />
          </IconButton>
        </Stack>
      )
    }
  ];

  return (
    <MainCard title="Products">
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Search Products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button variant="contained" onClick={handleOpenAddDialog}>
          Add Product
        </Button>
      </Stack>

      <Box sx={{ height: 600 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          rowCount={totalRows}
          paginationMode="server"
          paginationModel={{
            page,
            pageSize
          }}
          onPaginationModelChange={(model) => {
            setPage(model.page);
            setPageSize(model.pageSize);
          }}
        />
      </Box>

      {/* Add/Edit Product Dialog */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{editProductId ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            
            <TextField
              label="Product Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={Boolean(fieldErrors.name)}
              helperText={fieldErrors.name}
              fullWidth
            />

            <TextField
              label="Price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              error={Boolean(fieldErrors.price)}
              helperText={fieldErrors.price}
              fullWidth
            />

            <FormControl fullWidth error={Boolean(fieldErrors.categoryId)}>
              <InputLabel id="category-select-label">Category</InputLabel>
              <Select
                labelId="category-select-label"
                value={categoryId}
                label="Category"
                onChange={(e) => setCategoryId(e.target.value)}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
              {fieldErrors.categoryId && (
                <FormHelperText>{fieldErrors.categoryId}</FormHelperText>
              )}
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveProduct} variant="contained">
            {editProductId ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteConfirm} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {deleteError && <Alert severity="error">{deleteError}</Alert>}
            <DialogContentText>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogContentText>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>Cancel</Button>
          <Button onClick={handleDeleteProduct} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}