import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Box,
  TextField,
  Stack,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from '@mui/material';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import ClearOutlined from '@ant-design/icons/ClearOutlined';
import FolderOpenOutlined from '@ant-design/icons/FolderOpenOutlined';
import FileExcelOutlined from '@ant-design/icons/FileExcelOutlined';

import MainCard from 'components/MainCard';
import { getStockReport } from 'api/reports';
import { getWarehouses } from 'api/warehouses';
import { getProducts } from 'api/products';

export default function StockReportPage() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [warehouseId, setWarehouseId] = useState('');
  const [productId, setProductId] = useState('');
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadMetadata();
    runReport();
  }, []);

  const loadMetadata = async () => {
    try {
      const whs = await getWarehouses();
      setWarehouses(Array.isArray(whs) ? whs : (whs && Array.isArray(whs.items) ? whs.items : []));

      const prods = await getProducts('', 1, 500);
      setProducts(Array.isArray(prods) ? prods : (prods && Array.isArray(prods.items) ? prods.items : []));
    } catch (err) {
      console.error('Failed to load filter metadata:', err);
    }
  };

  const runReport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (warehouseId) params.warehouseId = warehouseId;
      if (productId) params.productId = productId;

      const data = await getStockReport(params);
      setReportData(Array.isArray(data) ? data : (data && Array.isArray(data.items) ? data.items : []));
    } catch (error) {
      console.error('Failed to run stock report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setWarehouseId('');
    setProductId('');
    // Trigger run with cleared parameters directly
    setLoading(true);
    getStockReport({})
      .then((data) => setReportData(Array.isArray(data) ? data : (data && Array.isArray(data.items) ? data.items : [])))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const columns = [
    {
      field: 'id',
      headerName: 'No',
      width: 70,
      renderCell: (params) => params.api.getAllRowIds().indexOf(params.id) + 1
    },
    { field: 'productName', headerName: 'Product Name', flex: 1.5 },
    { field: 'warehouseName', headerName: 'Warehouse Location', flex: 1.2 },
    {
      field: 'quantity',
      headerName: 'Current Stock',
      width: 150,
      renderCell: (params) => {
        const qty = params.row.quantity;
        const color = qty <= 0 ? 'error.main' : qty < 10 ? 'warning.main' : 'text.primary';
        return (
          <Typography sx={{ color, fontWeight: qty < 10 ? 'bold' : 'normal', display: 'flex', alignItems: 'center', height: '100%' }}>
            {qty}
          </Typography>
        );
      }
    }
  ];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h2" sx={{ mb: 0.5 }}>
          Stock Report
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Check exact real-time quantities of products across different warehouses
        </Typography>
      </Box>

      {/* Filters Card */}
      <MainCard title="Report Filters" sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="wh-select-label">Warehouse</InputLabel>
              <Select
                labelId="wh-select-label"
                value={warehouseId}
                label="Warehouse"
                onChange={(e) => setWarehouseId(e.target.value)}
              >
                <MenuItem value=""><em>All Warehouses</em></MenuItem>
                {warehouses.map((w) => (
                  <MenuItem key={w.id} value={w.id}>
                    {w.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="prod-select-label">Product</InputLabel>
              <Select
                labelId="prod-select-label"
                value={productId}
                label="Product"
                onChange={(e) => setProductId(e.target.value)}
              >
                <MenuItem value=""><em>All Products</em></MenuItem>
                {products.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<SearchOutlined />}
                onClick={runReport}
                size="medium"
              >
                Run Report
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<ClearOutlined />}
                onClick={handleClear}
                size="medium"
              >
                Clear
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </MainCard>

      {/* Grid Card */}
      <MainCard title="Real-time Stock Levels">
        <Box sx={{ height: 450, width: '100%' }}>
          {reportData.length === 0 && !loading ? (
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
                No stock records found
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Try selecting different search filters.
              </Typography>
            </Box>
          ) : (
            <DataGrid
              rows={(Array.isArray(reportData) ? reportData : []).map((r, index) => ({ ...r, id: index }))}
              columns={columns}
              loading={loading}
              pageSizeOptions={[10, 25, 50]}
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
    </Box>
  );
}
