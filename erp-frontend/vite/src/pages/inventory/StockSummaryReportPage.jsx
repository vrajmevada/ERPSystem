import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Box,
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

import MainCard from 'components/MainCard';
import { getStockSummaryReport } from 'api/reports';
import { getProducts } from 'api/products';

export default function StockSummaryReportPage() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [productId, setProductId] = useState('');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadMetadata();
    runReport();
  }, []);

  const loadMetadata = async () => {
    try {
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
      if (productId) params.productId = productId;

      const data = await getStockSummaryReport(params);
      setReportData(Array.isArray(data) ? data : (data && Array.isArray(data.items) ? data.items : []));
    } catch (error) {
      console.error('Failed to run stock summary report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setProductId('');
    setLoading(true);
    getStockSummaryReport({})
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
    { field: 'productId', headerName: 'Product ID', width: 120 },
    { field: 'productName', headerName: 'Product Name', flex: 1.5 },
    {
      field: 'totalQuantity',
      headerName: 'Total Stock Quantity',
      flex: 1,
      renderCell: (params) => {
        const qty = params.row.totalQuantity;
        const color = qty <= 0 ? 'error.main' : qty < 20 ? 'warning.main' : 'text.primary';
        return (
          <Typography sx={{ color, fontWeight: qty < 20 ? 'bold' : 'normal', display: 'flex', alignItems: 'center', height: '100%' }}>
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
          Stock Summary Report
        </Typography>
        <Typography variant="body1" color="textSecondary">
          View aggregated stock summaries grouped by product across all locations
        </Typography>
      </Box>

      {/* Filters Card */}
      <MainCard title="Report Filters" sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
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

          <Grid item xs={12} sm={6}>
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
      <MainCard title="Aggregated Product Summary">
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
                No stock summary records found
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
