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
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import FolderOpenOutlined from '@ant-design/icons/FolderOpenOutlined';
import FileProtectOutlined from '@ant-design/icons/FileProtectOutlined';

import MainCard from 'components/MainCard';
import { getGoodsReceiptNotes, getGoodsReceiptNoteById, approveGoodsReceiptNote } from 'api/goodsReceiptNotes';
import useAuth from 'hooks/useAuth';

const STATUS_CONFIG = {
  'Draft': { label: 'Draft', color: 'default' },
  'Approved': { label: 'Approved', color: 'success' },
  'Cancelled': { label: 'Cancelled', color: 'error' }
};

export default function GrnApprovalPage() {
  const { user } = useAuth();
  const role = user?.role?.trim().toLowerCase();
  const canApprove = role === 'admin' || role === 'manager';

  const [grns, setGrns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Details dialog states
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedGrn, setSelectedGrn] = useState(null);

  // Snackbar notifications state
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
      const data = await getGoodsReceiptNotes();
      setGrns(Array.isArray(data) ? data : (data && Array.isArray(data.items) ? data.items : []));
    } catch (error) {
      console.error('Failed to load Goods Receipt Notes:', error);
      showNotification('Failed to load Goods Receipt Notes', 'error');
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

  const handleViewDetails = async (row) => {
    try {
      const details = await getGoodsReceiptNoteById(row.id);
      setSelectedGrn(details);
      setDetailOpen(true);
    } catch (error) {
      console.error('Failed to load GRN details:', error);
      showNotification('Failed to load details', 'error');
    }
  };

  const handleApproveStore = async (id) => {
    try {
      await approveGoodsReceiptNote(id);
      showNotification('Goods Receipt Note approved and stock updated successfully', 'success');
      loadData();
      if (detailOpen && selectedGrn?.id === id) {
        setDetailOpen(false);
      }
    } catch (error) {
      console.error('Failed to approve GRN:', error);
      showNotification(
        error.response?.data?.message || 'Failed to approve GRN',
        'error'
      );
    }
  };

  const filteredGrns = grns.filter(
    (g) =>
      g.grnNumber?.toLowerCase().includes(search.toLowerCase()) ||
      g.purchaseOrderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      g.remarks?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'grnNumber', headerName: 'GRN Number', flex: 1.2 },
    { field: 'purchaseOrderNumber', headerName: 'Purchase Order', flex: 1.2 },
    {
      field: 'receivedDate',
      headerName: 'Received Date',
      width: 130,
      valueFormatter: (value) => (value ? new Date(value).toLocaleDateString() : '')
    },
    {
      field: 'itemCount',
      headerName: 'Items',
      width: 100,
      valueGetter: (value, row) => row.lines?.length || 0
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const config = STATUS_CONFIG[params.row.status];
        return config ? (
          <Chip label={config.label} color={config.color} size="small" variant="light" />
        ) : (
          <Chip label={params.row.status} size="small" />
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 130,
      sortable: false,
      renderCell: (params) => {
        const status = params.row.status;
        const showApprove = status === 'Draft' && canApprove;

        return (
          <Stack direction="row" spacing={0.5} alignItems="center" height="100%">
            <Tooltip title="View Details">
              <IconButton color="secondary" size="small" onClick={() => handleViewDetails(params.row)}>
                <EyeOutlined />
              </IconButton>
            </Tooltip>
            {showApprove && (
              <Tooltip title="Approve Store">
                <IconButton color="success" size="small" onClick={() => handleApproveStore(params.row.id)}>
                  <CheckCircleOutlined />
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
        <Typography variant="h2" sx={{ mb: 0.5 }}>
          GRN Store Approval
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Review and approve Goods Receipt Notes (GRN) to update inventory levels
        </Typography>
      </Box>

      {/* Grid */}
      <MainCard title="Pending and Approved GRNs">
        <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
          <TextField
            placeholder="Search by GRN Number, PO Number, or Remarks"
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
          {filteredGrns.length === 0 && !loading ? (
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
              <FileProtectOutlined style={{ fontSize: '48px', color: '#bfbfbf' }} />
              <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
                No Goods Receipt Notes found
              </Typography>
              <Typography variant="body1" color="textSecondary">
                There are no GRNs recorded in the system.
              </Typography>
            </Box>
          ) : (
            <DataGrid
              rows={filteredGrns}
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

      {/* Details Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h3">GRN Details: {selectedGrn?.grnNumber}</Typography>
          {selectedGrn && (
            <Chip
              label={STATUS_CONFIG[selectedGrn.status]?.label}
              color={STATUS_CONFIG[selectedGrn.status]?.color}
              size="small"
            />
          )}
        </DialogTitle>
        <DialogContent dividers>
          {selectedGrn && (
            <Stack spacing={3}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Purchase Order</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{selectedGrn.purchaseOrderNumber}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Received Date</Typography>
                  <Typography variant="body1">{new Date(selectedGrn.receivedDate).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Remarks</Typography>
                  <Typography variant="body1">{selectedGrn.remarks || 'No remarks provided'}</Typography>
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
                      <TableCell align="right">Qty Received</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(selectedGrn?.lines || []).map((l, index) => (
                      <TableRow key={l.id || index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{l.productName}</TableCell>
                        <TableCell align="right">{l.quantityReceived}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {selectedGrn?.status === 'Draft' && canApprove && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleOutlined />}
              onClick={() => handleApproveStore(selectedGrn.id)}
            >
              Approve Store
            </Button>
          )}
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
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
