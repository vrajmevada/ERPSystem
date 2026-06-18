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
  Button,
  TextField
} from '@mui/material';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import ClearOutlined from '@ant-design/icons/ClearOutlined';
import FolderOpenOutlined from '@ant-design/icons/FolderOpenOutlined';

import MainCard from 'components/MainCard';
import { getTrackingDetailReport } from 'api/reports';
import { getWarehouses } from 'api/warehouses';
import { getProducts } from 'api/products';

export default function TrackingDetailReportPage() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [productId, setProductId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Dropdowns
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    loadMetadata();
    runReport();
  }, []);

  const loadMetadata = async () => {
    try {
      const prods = await getProducts('', 1, 500);
      setProducts(prods.items || []);

      const whs = await getWarehouses();
      setWarehouses(whs || []);
    } catch (err) {
      console.error('Failed to load filter metadata:', err);
    }
  };

  const runReport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (productId) params.productId = productId;
      if (warehouseId) params.warehouseId = warehouseId;
      if (startDate) params.startDate = new Date(startDate).toISOString();
      if (endDate) params.endDate = new Date(endDate).toISOString();

      const data = await getTrackingDetailReport(params);
      setReportData(data || []);
    } catch (error) {
      console.error('Failed to run tracking detail report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setProductId('');
    setWarehouseId('');
    setStartDate('');
    setEndDate('');
    setLoading(true);
    getTrackingDetailReport({})
      .then((data) => setReportData(data || []))
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
    {
      field: 'transactionDate',
      headerName: 'Date & Time',
      width: 180,
      valueFormatter: (value) => (value ? new Date(value).toLocaleString() : '')
    },
    { field: 'productName', headerName: 'Product Name', flex: 1.2 },
    { field: 'warehouseName', headerName: 'Warehouse Location', flex: 1 },
    {
      field: 'transactionType',
      headerName: 'Voucher Type',
      width: 160
    },
    {
      field: 'quantityChange',
      headerName: 'Qty Change',
      width: 120,
      renderCell: (params) => {
        const change = params.row.quantityChange;
        const color = change > 0 ? '#52c41a' : '#ff4d4f';
        const prefix = change > 0 ? '+' : '';
        return (
          <Typography sx={{ color, fontWeight: 'bold', display: 'flex', alignItems: 'center', height: '100%' }}>
            {prefix}{change}
          </Typography>
        );
      }
    },
    {
      field: 'cumulativeQuantity',
      headerName: 'Cumulative Balance',
      width: 160,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', height: '100%' }}>
          {params.row.cumulativeQuantity}
        </Typography>
      )
    }
  ];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h2" sx={{ mb: 0.5 }}>
          Tracking Detail Report
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Trace inventory transaction ledger history of products with cumulative stock calculations
        </Typography>
      </Box>

      {/* Filters Card */}
      <MainCard title="Report Filters" sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
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

          <Grid item xs={12} sm={3}>
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

          <Grid item xs={12} sm={2}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={2}>
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={2}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<SearchOutlined />}
                onClick={runReport}
                size="medium"
                fullWidth
              >
                Run
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<ClearOutlined />}
                onClick={handleClear}
                size="medium"
                fullWidth
              >
                Clear
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </MainCard>

      {/* Grid Card */}
      <MainCard title="Audit Tracking Ledger">
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
                No tracking ledger entries found
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Try selecting different search filters.
              </Typography>
            </Box>
          ) : (
            <DataGrid
              rows={reportData.map((r, index) => ({ ...r, id: index }))}
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
