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
import { getIndents, getIndentById, shortCloseIndent } from 'api/indents';
import useAuth from 'hooks/useAuth';

export default function IndentShortClosePage() {
  const { user } = useAuth();
  const role = user?.role?.trim().toLowerCase();
  const canOperate = role === 'admin' || role === 'manager' || role === 'operator';

  const [indents, setIndents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Short Close Dialog states
  const [open, setOpen] = useState(false);
  const [selectedIndent, setSelectedIndent] = useState(null);
  const [closeQuantities, setCloseQuantities] = useState({}); // indentLineId -> number
  const [submitError, setSubmitError] = useState('');
  const [errors, setErrors] = useState({});

  // Details Dialog states
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailedIndent, setDetailedIndent] = useState(null);

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
      const data = await getIndents();
      // Only show Approved indents for short close
      const approvedIndents = (data.items || []).filter((i) => i.status === 'Approved');
      setIndents(approvedIndents);
    } catch (error) {
      console.error('Failed to load approved indents:', error);
      showNotification('Failed to load indents', 'error');
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
      const details = await getIndentById(row.id);
      setSelectedIndent(details);
      
      const initialQtys = {};
      details.lines.forEach((l) => {
        const remaining = l.quantity - l.shortClosedQuantity;
        initialQtys[l.id] = remaining > 0 ? remaining : 0;
      });
      setCloseQuantities(initialQtys);
      setErrors({});
      setSubmitError('');
      setOpen(true);
    } catch (error) {
      console.error('Failed to load indent lines:', error);
      showNotification('Failed to load details', 'error');
    }
  };

  const handleViewDetails = async (row) => {
    try {
      const details = await getIndentById(row.id);
      setDetailedIndent(details);
      setDetailOpen(true);
    } catch (error) {
      console.error('Failed to fetch details:', error);
      showNotification('Failed to load details', 'error');
    }
  };

  const handleQtyChange = (lineId, maxVal, value) => {
    const val = parseFloat(value);
    setCloseQuantities((prev) => ({ ...prev, [lineId]: value }));

    setErrors((prev) => {
      const updated = { ...prev };
      if (isNaN(val) || val < 0) {
        updated[lineId] = 'Qty must be >= 0';
      } else if (val > maxVal) {
        updated[lineId] = `Max open is ${maxVal}`;
      } else {
        delete updated[lineId];
      }
      return updated;
    });
  };

  const handleSubmitShortClose = async () => {
    if (Object.keys(errors).length > 0) return;

    try {
      setSubmitError('');
      const linesToSubmit = selectedIndent.lines
        .map((l) => {
          const qty = parseFloat(closeQuantities[l.id]);
          return {
            indentLineId: l.id,
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

      await shortCloseIndent(selectedIndent.id, payload);
      showNotification('Indent lines short closed successfully', 'success');
      setOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to short close indent:', error);
      setSubmitError(
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        'Failed to submit short close'
      );
      showNotification('Failed to submit short close', 'error');
    }
  };

  const filteredIndents = indents.filter(
    (i) =>
      i.voucherNo?.toLowerCase().includes(search.toLowerCase()) ||
      i.requestingDeptName?.toLowerCase().includes(search.toLowerCase()) ||
      i.targetDeptName?.toLowerCase().includes(search.toLowerCase()) ||
      i.remarks?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'voucherNo', headerName: 'Voucher No', flex: 1.2 },
    { field: 'requestingDeptName', headerName: 'Requesting Dept', flex: 1.2 },
    { field: 'targetDeptName', headerName: 'Target Dept', flex: 1.2 },
    {
      field: 'indentDate',
      headerName: 'Indent Date',
      width: 130,
      valueFormatter: (value) => (value ? new Date(value).toLocaleDateString() : '')
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 100,
      renderCell: (params) => (
        <Chip label={params.row.priority} size="small" variant="outlined" />
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
            <Tooltip title="Short Close Items">
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
          Indent Short Close
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Force-close or short-close remaining requested quantities for open/approved indents
        </Typography>
      </Box>

      {/* Grid */}
      <MainCard title="Open / Approved Indents for Short Close">
        <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
          <TextField
            placeholder="Search by Voucher No, Departments or Remarks"
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
          {filteredIndents.length === 0 && !loading ? (
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
                No active approved indents found
              </Typography>
              <Typography variant="body1" color="textSecondary">
                All indents are fully satisfied, closed, or still in pending/draft states.
              </Typography>
            </Box>
          ) : (
            <DataGrid
              rows={filteredIndents}
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

      {/* Short Close Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Short Close Indent: {selectedIndent?.voucherNo}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <Typography variant="body1" color="textSecondary">
              Review line items and insert quantities to cancel/short close.
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
                  {selectedIndent?.lines.map((l) => {
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
                            value={closeQuantities[l.id] || 0}
                            onChange={(e) => handleQtyChange(l.id, remaining, e.target.value)}
                            disabled={remaining <= 0}
                            error={Boolean(errors[l.id])}
                            helperText={errors[l.id]}
                            inputProps={{ min: 0, max: remaining, step: 1 }}
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
            Submit Short Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details View Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h3">Indent Details: {detailedIndent?.voucherNo}</Typography>
          {detailedIndent && (
            <Chip label={detailedIndent.status} color="success" size="small" />
          )}
        </DialogTitle>
        <DialogContent dividers>
          {detailedIndent && (
            <Stack spacing={3}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Requesting Dept</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{detailedIndent.requestingDeptName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Target Dept</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{detailedIndent.targetDeptName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Indent Date</Typography>
                  <Typography variant="body1">{new Date(detailedIndent.indentDate).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Remarks</Typography>
                  <Typography variant="body1">{detailedIndent.remarks || 'No remarks'}</Typography>
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
                    {detailedIndent.lines.map((l) => (
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
