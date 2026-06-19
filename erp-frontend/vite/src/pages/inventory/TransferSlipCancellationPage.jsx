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
  DialogActions,
  Alert,
  Snackbar,
  Grid,
  Typography,
  Chip,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import SaveOutlined from '@ant-design/icons/SaveOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import CloseSquareOutlined from '@ant-design/icons/CloseSquareOutlined';

import MainCard from 'components/MainCard';
import { getTransferSlips, getTransferSlipById, shortCloseTransferSlip } from 'api/transferSlips';
import useAuth from 'hooks/useAuth';

export default function TransferSlipCancellationPage() {
  const { user } = useAuth();
  const role = user?.role?.trim().toLowerCase();
  const canOperate = role === 'admin' || role === 'manager' || role === 'operator';

  const [slips, setSlips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Short Close Dialog states
  const [open, setOpen] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [closeQuantities, setCloseQuantities] = useState({}); // productId -> number
  const [submitError, setSubmitError] = useState('');
  const [errors, setErrors] = useState({});

  // Details Dialog states
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailedSlip, setDetailedSlip] = useState(null);

  // Snackbar alert state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getTransferSlips();
      // Only show Draft or Shipped transfer slips for short close
      const list = Array.isArray(data) ? data : (data && Array.isArray(data.items) ? data.items : []);
      const cancelable = list.filter((s) => s.status === 'Draft' || s.status === 'Shipped');
      setSlips(cancelable);
    } catch (error) {
      console.error('Failed to load cancelable transfer slips:', error);
      showNotification('Failed to load transfer slips', 'error');
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

  const handleOpenShortClose = async (row) => {
    try {
      const details = await getTransferSlipById(row.id);
      setSelectedSlip(details);
      
      const initialQtys = {};
      (details?.lines || []).forEach((l) => {
        const remaining = l.quantity - l.shortClosedQuantity;
        initialQtys[l.productId] = remaining > 0 ? remaining : 0;
      });
      setCloseQuantities(initialQtys);
      setErrors({});
      setSubmitError('');
      setOpen(true);
    } catch (error) {
      console.error('Failed to load transfer details:', error);
      showNotification('Failed to load details', 'error');
    }
  };

  const handleViewDetails = async (row) => {
    try {
      const details = await getTransferSlipById(row.id);
      setDetailedSlip(details);
      setDetailOpen(true);
    } catch (error) {
      console.error('Failed to fetch details:', error);
      showNotification('Failed to load details', 'error');
    }
  };

  const handleQtyChange = (productId, maxVal, value) => {
    const val = parseInt(value, 10);
    setCloseQuantities((prev) => ({ ...prev, [productId]: value }));

    setErrors((prev) => {
      const updated = { ...prev };
      if (isNaN(val) || val < 0) {
        updated[productId] = 'Qty must be >= 0';
      } else if (val > maxVal) {
        updated[productId] = `Max open is ${maxVal}`;
      } else {
        delete updated[productId];
      }
      return updated;
    });
  };

  const handleSubmitShortClose = async () => {
    if (Object.keys(errors).length > 0) return;

    try {
      setSubmitError('');
      const linesToSubmit = (selectedSlip?.lines || [])
        .map((l) => {
          const qty = parseInt(closeQuantities[l.productId], 10);
          return {
            productId: l.productId,
            shortCloseQuantity: isNaN(qty) ? 0 : qty
          };
        })
        .filter((l) => l.shortCloseQuantity > 0);

      if (linesToSubmit.length === 0) {
        setSubmitError('Please specify short close quantity greater than zero for at least one item.');
        return;
      }

      const payload = {
        lines: linesToSubmit
      };

      await shortCloseTransferSlip(selectedSlip.id, payload);
      showNotification('Transfer slip lines cancelled/short closed successfully', 'success');
      setOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to cancel transfer slip lines:', error);
      setSubmitError(
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        'Failed to submit short close'
      );
      showNotification('Failed to submit short close', 'error');
    }
  };

  const filteredSlips = slips.filter(
    (s) =>
      s.slipNumber?.toLowerCase().includes(search.toLowerCase()) ||
      s.fromWarehouseName?.toLowerCase().includes(search.toLowerCase()) ||
      s.toWarehouseName?.toLowerCase().includes(search.toLowerCase()) ||
      s.remarks?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'slipNumber', headerName: 'Slip Number', flex: 1.2 },
    { field: 'fromWarehouseName', headerName: 'From Warehouse', flex: 1.2 },
    { field: 'toWarehouseName', headerName: 'To Warehouse', flex: 1.2 },
    {
      field: 'transferDate',
      headerName: 'Transfer Date',
      width: 130,
      valueFormatter: (value) => (value ? new Date(value).toLocaleDateString() : '')
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip label={params.row.status} size="small" variant="outlined" />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} alignItems="center" height="100%">
          <Tooltip title="View Details">
            <IconButton color="secondary" size="small" onClick={() => handleViewDetails(params.row)}>
              <EyeOutlined />
            </IconButton>
          </Tooltip>
          {canOperate && (
            <Tooltip title="Cancel / Short Close Items">
              <IconButton color="warning" size="small" onClick={() => handleOpenShortClose(params.row)}>
                <CloseSquareOutlined />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      )
    }
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h2" sx={{ mb: 0.5 }}>
          Transfer Slip Cancellation
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Cancel or short-close outstanding transfer quantities from Draft or Shipped slips
        </Typography>
      </Box>

      {/* Grid */}
      <MainCard title="Open Transfer Slips for Cancellation">
        <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
          <TextField
            placeholder="Search by Slip No, Warehouse or Remarks"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ width: 350 }}
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

        <Box sx={{ height: 480, width: '100%' }}>
          {filteredSlips.length === 0 && !loading ? (
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
              <CloseSquareOutlined style={{ fontSize: '48px', color: '#bfbfbf' }} />
              <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
                No active cancelable transfer slips found
              </Typography>
              <Typography variant="body1" color="textSecondary">
                All transfer slips are either received/approved, cancelled, or closed.
              </Typography>
            </Box>
          ) : (
            <DataGrid
              rows={filteredSlips}
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

      {/* Cancellation Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Cancel / Short Close Transfer: {selectedSlip?.slipNumber}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <Typography variant="body1" color="textSecondary">
              Review transfer line items and specify the quantity to return or cancel.
            </Typography>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell>Product Name</TableCell>
                    <TableCell align="right">Qty Requested</TableCell>
                    <TableCell align="right">Short Closed</TableCell>
                    <TableCell align="right">Remaining Open</TableCell>
                    <TableCell width={200} align="right">Short Close Qty</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(selectedSlip?.lines || []).map((l) => {
                    const remaining = l.quantity - l.shortClosedQuantity;
                    return (
                      <TableRow key={l.id}>
                        <TableCell>{l.productName}</TableCell>
                        <TableCell align="right">{l.quantity}</TableCell>
                        <TableCell align="right">{l.shortClosedQuantity}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>{remaining}</TableCell>
                        <TableCell align="right">
                          <TextField
                            size="small"
                            type="number"
                            value={closeQuantities[l.productId] || 0}
                            onChange={(e) => handleQtyChange(l.productId, remaining, e.target.value)}
                            disabled={remaining <= 0}
                            error={Boolean(errors[l.productId])}
                            helperText={errors[l.productId]}
                            inputProps={{ min: 0, max: remaining }}
                            sx={{ width: 130 }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="warning"
            startIcon={<SaveOutlined />}
            onClick={handleSubmitShortClose}
          >
            Submit Cancellation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details View Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h3">Transfer Details: {detailedSlip?.slipNumber}</Typography>
          {detailedSlip && (
            <Chip label={detailedSlip.status} color="primary" size="small" />
          )}
        </DialogTitle>
        <DialogContent dividers>
          {detailedSlip && (
            <Stack spacing={3}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Source Warehouse</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{detailedSlip.fromWarehouseName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Destination Warehouse</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{detailedSlip.toWarehouseName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Transfer Date</Typography>
                  <Typography variant="body1">{new Date(detailedSlip.transferDate).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Remarks</Typography>
                  <Typography variant="body1">{detailedSlip.remarks || 'No remarks'}</Typography>
                </Grid>
              </Grid>

              <Divider />
              <Typography variant="h5">Items List</Typography>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      <TableCell>Line No</TableCell>
                      <TableCell>Product Name</TableCell>
                      <TableCell align="right">Qty Requested</TableCell>
                      <TableCell align="right">Short Closed</TableCell>
                      <TableCell>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(detailedSlip?.lines || []).map((l) => (
                      <TableRow key={l.id}>
                        <TableCell>{l.lineNo}</TableCell>
                        <TableCell>{l.productName}</TableCell>
                        <TableCell align="right">{l.quantity}</TableCell>
                        <TableCell align="right">{l.shortClosedQuantity}</TableCell>
                        <TableCell>{l.notes || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar alerts */}
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
