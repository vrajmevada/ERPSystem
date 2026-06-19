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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
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
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import CloseCircleOutlined from '@ant-design/icons/CloseCircleOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import FileTextOutlined from '@ant-design/icons/FileTextOutlined';

import MainCard from 'components/MainCard';
import {
  getIndents,
  getIndentById,
  createIndent,
  approveIndent,
  disapproveIndent
} from 'api/indents';
import { getDepartments } from 'api/departments';
import { getProducts } from 'api/products';
import useAuth from 'hooks/useAuth';

const STATUS_CONFIG = {
  'Pending': { label: 'Pending', color: 'warning' },
  'Approved': { label: 'Approved', color: 'success' },
  'Disapproved': { label: 'Disapproved', color: 'error' },
  'Closed': { label: 'Closed', color: 'default' }
};

const PRIORITY_CONFIG = {
  'High': { label: 'High', color: 'error' },
  'Medium': { label: 'Medium', color: 'primary' },
  'Low': { label: 'Low', color: 'secondary' }
};

export default function IndentsPage() {
  const { user } = useAuth();
  const role = user?.role?.trim().toLowerCase();
  const canOperate = role === 'admin' || role === 'manager' || role === 'operator';
  const canApprove = role === 'admin' || role === 'manager';

  const [indents, setIndents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Dropdowns
  const [departments, setDepartments] = useState([]);
  const [products, setProducts] = useState([]);

  // Create Dialog states
  const [open, setOpen] = useState(false);
  const [requestingDeptId, setRequestingDeptId] = useState('');
  const [targetDeptId, setTargetDeptId] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [remarks, setRemarks] = useState('');
  const [lines, setLines] = useState([{ productId: '', quantity: 1, estimatedRate: '', notes: '' }]);
  const [submitError, setSubmitError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Details Dialog states
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedIndent, setSelectedIndent] = useState(null);

  // Snackbar alert state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadData();
    loadMetadata();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getIndents();
      setIndents(Array.isArray(data) ? data : (data && Array.isArray(data.items) ? data.items : []));
    } catch (error) {
      console.error('Failed to load indents:', error);
      showNotification('Failed to load indents', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadMetadata = async () => {
    try {
      const depts = await getDepartments();
      setDepartments(Array.isArray(depts) ? depts : (depts && Array.isArray(depts.items) ? depts.items : []));

      const prods = await getProducts('', 1, 500);
      setProducts(Array.isArray(prods) ? prods : (prods && Array.isArray(prods.items) ? prods.items : []));
    } catch (err) {
      console.error('Failed to load metadata:', err);
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
    setRequestingDeptId('');
    setTargetDeptId('');
    setPriority('Medium');
    setRemarks('');
    setLines([{ productId: '', quantity: 1, estimatedRate: '', notes: '' }]);
    setSubmitError('');
    setFieldErrors({});
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleAddLineRow = () => {
    setLines((prev) => [...prev, { productId: '', quantity: 1, estimatedRate: '', notes: '' }]);
  };

  const handleRemoveLineRow = (index) => {
    if (lines.length === 1) return;
    setLines((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleLineFieldChange = (index, field, value) => {
    setLines((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!requestingDeptId) errors.requestingDeptId = 'Requesting Department is required';
    if (!targetDeptId) errors.targetDeptId = 'Target Department is required';
    if (requestingDeptId && targetDeptId && requestingDeptId === targetDeptId) {
      errors.targetDeptId = 'Requesting and Target departments cannot be the same';
    }

    const itemErrors = [];
    lines.forEach((item, index) => {
      if (!item.productId) {
        itemErrors[index] = { productId: 'Product is required' };
      }
      const qty = parseFloat(item.quantity);
      if (isNaN(qty) || qty <= 0) {
        itemErrors[index] = { ...itemErrors[index], quantity: 'Qty > 0' };
      }
      if (item.estimatedRate !== '') {
        const rate = parseFloat(item.estimatedRate);
        if (isNaN(rate) || rate <= 0) {
          itemErrors[index] = { ...itemErrors[index], estimatedRate: 'Rate > 0' };
        }
      }
    });

    if (itemErrors.length > 0) {
      errors.items = itemErrors;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveIndent = async () => {
    if (!validateForm()) return;

    try {
      setSubmitError('');
      const payload = {
        requestingDeptId: parseInt(requestingDeptId, 10),
        targetDeptId: parseInt(targetDeptId, 10),
        priority,
        remarks: remarks.trim(),
        lines: lines.map((l) => ({
          productId: parseInt(l.productId, 10),
          quantity: parseFloat(l.quantity),
          estimatedRate: l.estimatedRate !== '' ? parseFloat(l.estimatedRate) : null,
          notes: l.notes.trim()
        }))
      };

      await createIndent(payload);
      showNotification('Indent created successfully', 'success');
      setOpen(false);
      loadData();
    } catch (error) {
      console.error('Error creating indent:', error);
      setSubmitError(
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        'Failed to create indent'
      );
      showNotification('Failed to create indent', 'error');
    }
  };

  const handleViewDetails = async (row) => {
    try {
      const details = await getIndentById(row.id);
      setSelectedIndent(details);
      setDetailOpen(true);
    } catch (error) {
      console.error('Failed to fetch indent details:', error);
      showNotification('Failed to load details', 'error');
    }
  };

  const handleApproveIndent = async (id) => {
    try {
      await approveIndent(id);
      showNotification('Indent approved successfully', 'success');
      loadData();
      if (detailOpen && selectedIndent?.id === id) {
        setDetailOpen(false);
      }
    } catch (error) {
      console.error('Failed to approve indent:', error);
      showNotification(
        error.response?.data?.message || 'Failed to approve indent',
        'error'
      );
    }
  };

  const handleDisapproveIndent = async (id) => {
    try {
      await disapproveIndent(id);
      showNotification('Indent disapproved successfully', 'success');
      loadData();
      if (detailOpen && selectedIndent?.id === id) {
        setDetailOpen(false);
      }
    } catch (error) {
      console.error('Failed to disapprove indent:', error);
      showNotification(
        error.response?.data?.message || 'Failed to disapprove indent',
        'error'
      );
    }
  };

  const filteredIndents = indents.filter(
    (i) =>
      i.voucherNo?.toLowerCase().includes(search.toLowerCase()) ||
      i.requestingDeptName?.toLowerCase().includes(search.toLowerCase()) ||
      i.targetDeptName?.toLowerCase().includes(search.toLowerCase()) ||
      i.status?.toLowerCase().includes(search.toLowerCase()) ||
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
      width: 120,
      valueFormatter: (value) => (value ? new Date(value).toLocaleDateString() : '')
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 110,
      renderCell: (params) => {
        const config = PRIORITY_CONFIG[params.row.priority];
        return config ? (
          <Chip label={config.label} color={config.color} size="small" variant="light" />
        ) : (
          <Chip label={params.row.priority} size="small" />
        );
      }
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
      width: 150,
      sortable: false,
      renderCell: (params) => {
        const status = params.row.status;
        const showApprove = status === 'Pending' && canApprove;

        return (
          <Stack direction="row" spacing={0.5} alignItems="center" height="100%">
            <Tooltip title="View Details">
              <IconButton color="secondary" size="small" onClick={() => handleViewDetails(params.row)}>
                <EyeOutlined />
              </IconButton>
            </Tooltip>
            {showApprove && (
              <>
                <Tooltip title="Approve Indent">
                  <IconButton color="success" size="small" onClick={() => handleApproveIndent(params.row.id)}>
                    <CheckCircleOutlined />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Disapprove Indent">
                  <IconButton color="error" size="small" onClick={() => handleDisapproveIndent(params.row.id)}>
                    <CloseCircleOutlined />
                  </IconButton>
                </Tooltip>
              </>
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
        <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
          <Grid item>
            <Typography variant="h2" sx={{ mb: 0.5 }}>
              Indent Management
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Request materials and products across departments
            </Typography>
          </Grid>
          <Grid item>
            {canOperate && (
              <Button
                variant="contained"
                startIcon={<PlusOutlined />}
                onClick={handleOpenAddDialog}
              >
                New Indent
              </Button>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* Grid */}
      <MainCard title="All Indents">
        <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
          <TextField
            placeholder="Search by Voucher No, Departments, Priority or Status"
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
              <FileTextOutlined style={{ fontSize: '48px', color: '#bfbfbf' }} />
              <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
                No indents found
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                {search
                  ? 'No records match your search criteria.'
                  : 'Start requesting items by raising a new indent.'}
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

      {/* Create Dialog */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>New Indent</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth error={Boolean(fieldErrors.requestingDeptId)} required>
                  <InputLabel id="req-dept-label">Requesting Department</InputLabel>
                  <Select
                    labelId="req-dept-label"
                    value={requestingDeptId}
                    label="Requesting Department"
                    onChange={(e) => setRequestingDeptId(e.target.value)}
                  >
                    {Array.isArray(departments) && departments.map((d) => (
                      <MenuItem key={d.id} value={d.id}>
                        {d.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.requestingDeptId && <FormHelperText>{fieldErrors.requestingDeptId}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormControl fullWidth error={Boolean(fieldErrors.targetDeptId)} required>
                  <InputLabel id="tar-dept-label">Target Department</InputLabel>
                  <Select
                    labelId="tar-dept-label"
                    value={targetDeptId}
                    label="Target Department"
                    onChange={(e) => setTargetDeptId(e.target.value)}
                  >
                    {Array.isArray(departments) && departments.map((d) => (
                      <MenuItem key={d.id} value={d.id}>
                        {d.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.targetDeptId && <FormHelperText>{fieldErrors.targetDeptId}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id="priority-label">Priority</InputLabel>
                  <Select
                    labelId="priority-label"
                    value={priority}
                    label="Priority"
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>

            <Divider />
            <Typography variant="h5">Indent Line Items</Typography>

            {lines.map((item, index) => (
              <Grid container spacing={2} key={index} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <FormControl
                    fullWidth
                    error={Boolean(fieldErrors.items?.[index]?.productId)}
                    required
                  >
                    <InputLabel id={`prod-select-${index}`}>Product</InputLabel>
                    <Select
                      labelId={`prod-select-${index}`}
                      value={item.productId}
                      label="Product"
                      onChange={(e) => handleLineFieldChange(index, 'productId', e.target.value)}
                    >
                      {products.map((p) => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {fieldErrors.items?.[index]?.productId && (
                      <FormHelperText>{fieldErrors.items?.[index]?.productId}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={2}>
                  <TextField
                    label="Quantity"
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleLineFieldChange(index, 'quantity', parseFloat(e.target.value) || 0)
                    }
                    error={Boolean(fieldErrors.items?.[index]?.quantity)}
                    helperText={fieldErrors.items?.[index]?.quantity}
                    required
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} sm={2}>
                  <TextField
                    label="Est. Rate"
                    type="number"
                    value={item.estimatedRate}
                    onChange={(e) =>
                      handleLineFieldChange(index, 'estimatedRate', e.target.value)
                    }
                    error={Boolean(fieldErrors.items?.[index]?.estimatedRate)}
                    helperText={fieldErrors.items?.[index]?.estimatedRate}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Line Notes"
                    value={item.notes}
                    onChange={(e) => handleLineFieldChange(index, 'notes', e.target.value)}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} sm={1}>
                  <IconButton
                    color="error"
                    disabled={lines.length === 1}
                    onClick={() => handleRemoveLineRow(index)}
                  >
                    <DeleteOutlined />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            <Box>
              <Button variant="outlined" startIcon={<PlusOutlined />} onClick={handleAddLineRow}>
                Add Item
              </Button>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveIndent} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details View Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h3">Indent Details: {selectedIndent?.voucherNo}</Typography>
          {selectedIndent && (
            <Chip
              label={STATUS_CONFIG[selectedIndent.status]?.label}
              color={STATUS_CONFIG[selectedIndent.status]?.color}
              size="small"
            />
          )}
        </DialogTitle>
        <DialogContent dividers>
          {selectedIndent && (
            <Stack spacing={3}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="textSecondary">Requesting Dept</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{selectedIndent.requestingDeptName}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="textSecondary">Target Dept</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{selectedIndent.targetDeptName}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="textSecondary">Indent Date</Typography>
                  <Typography variant="body1">{new Date(selectedIndent.indentDate).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="textSecondary">Priority</Typography>
                  <Chip
                    label={PRIORITY_CONFIG[selectedIndent.priority]?.label}
                    color={PRIORITY_CONFIG[selectedIndent.priority]?.color}
                    size="small"
                    variant="light"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Remarks</Typography>
                  <Typography variant="body1">{selectedIndent.remarks || 'No remarks provided'}</Typography>
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
                      <TableCell align="right">Short Closed Qty</TableCell>
                      <TableCell align="right">Est. Rate</TableCell>
                      <TableCell>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(selectedIndent?.lines || []).map((l) => (
                      <TableRow key={l.id}>
                        <TableCell>{l.lineNo}</TableCell>
                        <TableCell>{l.productName}</TableCell>
                        <TableCell align="right">{l.quantity}</TableCell>
                        <TableCell align="right">{l.shortClosedQuantity}</TableCell>
                        <TableCell align="right">{l.estimatedRate !== null ? `$${l.estimatedRate.toFixed(2)}` : '—'}</TableCell>
                        <TableCell>{l.notes || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {selectedIndent?.status === 'Pending' && canApprove && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleOutlined />}
                onClick={() => handleApproveIndent(selectedIndent.id)}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<CloseCircleOutlined />}
                onClick={() => handleDisapproveIndent(selectedIndent.id)}
              >
                Disapprove
              </Button>
            </>
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
