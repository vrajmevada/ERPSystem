import { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Box,
  Button,
  TextField,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  FormHelperText
} from '@mui/material';
import MainCard from 'components/MainCard';
import { getProducts, createProduct, getCategories } from 'api/products';

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

  const handleOpenDialog = () => {
    setName('');
    setPrice('');
    setCategoryId('');
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

  const handleCreateProduct = async () => {
    if (!validateForm()) return;

    try {
      setSubmitError('');
      await createProduct({
        name: name.trim(),
        price: parseFloat(price),
        categoryId: parseInt(categoryId, 10)
      });
      setOpen(false);
      loadProducts();
    } catch (error) {
      console.error(error);
      setSubmitError(
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        'Failed to add product'
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
    { field: 'categoryName', headerName: 'Category', flex: 1 }
  ];

  return (
    <MainCard title="Products">
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Search Products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button variant="contained" onClick={handleOpenDialog}>
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

      {/* Add Product Dialog */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Add New Product</DialogTitle>
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
          <Button onClick={handleCreateProduct} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}