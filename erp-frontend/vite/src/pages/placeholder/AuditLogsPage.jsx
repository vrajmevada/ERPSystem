import React, { useEffect, useState, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Box,
  TextField,
  Stack,
  Snackbar,
  Alert,
  Grid,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper
} from '@mui/material';
import HistoryOutlined from '@ant-design/icons/HistoryOutlined';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';

import MainCard from 'components/MainCard';
import { getAuditLogs } from 'api/auditLogs';

// Debounce helper
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Map actions to chip colors
const getActionChipProps = (action) => {
  const actionLower = action?.toLowerCase() || '';
  if (actionLower.includes('create') || actionLower.includes('add') || actionLower === 'save') {
    return { label: action, color: 'success', variant: 'outlined' };
  }
  if (actionLower.includes('update') || actionLower.includes('edit')) {
    return { label: action, color: 'warning', variant: 'outlined' };
  }
  if (actionLower.includes('delete') || actionLower.includes('remove') || actionLower.includes('cancel')) {
    return { label: action, color: 'error', variant: 'filled' };
  }
  if (actionLower.includes('approve')) {
    return { label: action, color: 'success', variant: 'filled' };
  }
  if (actionLower.includes('receive')) {
    return { label: action, color: 'primary', variant: 'filled' };
  }
  if (actionLower.includes('ship') || actionLower.includes('confirm')) {
    return { label: action, color: 'secondary', variant: 'filled' };
  }
  return { label: action, color: 'default', variant: 'outlined' };
};

// Parse Changes JSON for before/after display
const parseChanges = (changes, action) => {
  if (!changes) return null;
  try {
    const data = JSON.parse(changes);

    // If it's update/edit action
    const actionLower = action?.toLowerCase() || '';
    if (actionLower.includes('update') || actionLower.includes('edit')) {
      const diffs = [];
      for (const [key, value] of Object.entries(data)) {
        if (value && typeof value === 'object' && ('old' in value || 'new' in value)) {
          diffs.push({
            field: key,
            oldValue: value.old === null || value.old === undefined ? '(null)' : String(value.old),
            newValue: value.new === null || value.new === undefined ? '(null)' : String(value.new)
          });
        } else {
          diffs.push({
            field: key,
            oldValue: 'Unknown',
            newValue: String(value)
          });
        }
      }
      return { type: 'update', diffs };
    }

    // Otherwise it's flat key-value pairs (added or deleted)
    const fields = [];
    for (const [key, value] of Object.entries(data)) {
      fields.push({
        field: key,
        value: value === null || value === undefined ? '(null)' : String(value)
      });
    }
    return { type: actionLower.includes('delete') || actionLower.includes('remove') ? 'delete' : 'create', fields };
  } catch (e) {
    console.error('Failed to parse changes:', e);
    return { type: 'raw', raw: changes };
  }
};

export default function AuditLogsPage() {
  const [rows, setRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);

  // Pagination & Search
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // Details Modal State
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Snackbar notifications state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAuditLogs(debouncedSearch, page + 1, pageSize);
      setRows(result.items || []);
      setTotalRows(result.totalCount || 0);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
      showNotification('Failed to load audit logs', 'error');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, pageSize]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const handleOpenDetails = (log) => {
    setSelectedLog(log);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedLog(null);
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'userName', headerName: 'User', flex: 1.2 },
    {
      field: 'action',
      headerName: 'Action',
      width: 150,
      renderCell: (params) => {
        const props = getActionChipProps(params.value);
        return <Chip size="small" {...props} />;
      }
    },
    { field: 'entityName', headerName: 'Entity Name', flex: 1 },
    { field: 'entityId', headerName: 'Entity ID', width: 120 },
    {
      field: 'timestamp',
      headerName: 'Timestamp',
      flex: 1.5,
      valueFormatter: (value) => value ? new Date(value).toLocaleString() : ''
    },
    {
      field: 'changes',
      headerName: 'Details',
      width: 130,
      sortable: false,
      renderCell: (params) => {
        return (
          <Button
            size="small"
            variant="outlined"
            color="primary"
            startIcon={<EyeOutlined />}
            onClick={() => handleOpenDetails(params.row)}
            sx={{ py: 0.25 }}
          >
            View Diff
          </Button>
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
              Audit Logs
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Trace and monitor security events, administrative changes, and transaction actions with before/after state details
            </Typography>
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
                    Total Log Events
                  </Typography>
                  <Typography variant="h3">
                    {totalRows}
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
                  <HistoryOutlined style={{ fontSize: '24px' }} />
                </Box>
              </Stack>
            </Box>
          </MainCard>
        </Grid>
      </Grid>

      {/* Search & Actions Bar inside MainCard */}
      <MainCard title="Activity Log History">
        <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
          <TextField
            placeholder="Search logs by action or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ width: 320 }}
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
        <Box sx={{ height: 500, width: '100%' }}>
          {rows.length === 0 && !loading ? (
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
              <HistoryOutlined style={{ fontSize: '48px', color: '#bfbfbf' }} />
              <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
                No audit logs found
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {search
                  ? 'No matching log entries match your search criteria.'
                  : 'No audit logs have been recorded in the database yet.'}
              </Typography>
            </Box>
          ) : (
            <DataGrid
              rows={rows}
              columns={columns}
              rowCount={totalRows}
              loading={loading}
              paginationMode="server"
              paginationModel={{
                page,
                pageSize
              }}
              onPaginationModelChange={(model) => {
                setPage(model.page);
                setPageSize(model.pageSize);
              }}
              pageSizeOptions={[5, 10, 25, 50]}
              disableRowSelectionOnClick
            />
          )}
        </Box>
      </MainCard>

      {/* Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1, borderBottom: '1px solid #f0f0f0' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <HistoryOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
            <Typography variant="h4">Audit Log Details - Event #{selectedLog?.id}</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedLog && (
            <Grid container spacing={3}>
              {/* Event Info Metadata */}
              <Grid item xs={12} md={4}>
                <Typography variant="h5" sx={{ mb: 2 }}>Event Information</Typography>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="textSecondary" display="block">OPERATING USER</Typography>
                    <Typography variant="body1" fontWeight="600">{selectedLog.userName}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="textSecondary" display="block">ACTION TYPE</Typography>
                    <Chip size="small" {...getActionChipProps(selectedLog.action)} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="textSecondary" display="block">AFFECTED ENTITY</Typography>
                    <Typography variant="body1" fontWeight="600">{selectedLog.entityName} (ID: {selectedLog.entityId})</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="textSecondary" display="block">TIMESTAMP</Typography>
                    <Typography variant="body1">{new Date(selectedLog.timestamp).toLocaleString()}</Typography>
                  </Box>
                </Stack>
              </Grid>

              {/* Before/After Changes Diff View */}
              <Grid item xs={12} md={8} sx={{ borderLeft: { md: '1px solid #f0f0f0' }, pl: { md: 3 } }}>
                <Typography variant="h5" sx={{ mb: 2 }}>Changes & State Differences</Typography>
                {(() => {
                  const parsed = parseChanges(selectedLog.changes, selectedLog.action);
                  if (!parsed) {
                    return (
                      <Box sx={{ py: 4, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography color="textSecondary">No detailed state changes recorded for this event.</Typography>
                      </Box>
                    );
                  }

                  if (parsed.type === 'raw') {
                    return (
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', fontFamily: 'monospace', fontSize: '13px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                        {parsed.raw}
                      </Paper>
                    );
                  }

                  if (parsed.type === 'update') {
                    return (
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead sx={{ bgcolor: 'grey.50' }}>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 'bold' }}>Field</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Original Value</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>New Value</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {parsed.diffs.map((diff, index) => (
                              <TableRow key={index} hover>
                                <TableCell sx={{ fontWeight: 'medium', fontFamily: 'monospace' }}>{diff.field}</TableCell>
                                <TableCell sx={{ bgcolor: '#fff1f0', color: '#cf1322', fontFamily: 'monospace' }}>
                                  <span style={{ textDecoration: 'line-through' }}>{diff.oldValue}</span>
                                </TableCell>
                                <TableCell sx={{ bgcolor: '#f6ffed', color: '#389e0d', fontFamily: 'monospace', fontWeight: 'bold' }}>
                                  {diff.newValue}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    );
                  }

                  // create or delete
                  return (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead sx={{ bgcolor: 'grey.50' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Field</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>{parsed.type === 'create' ? 'Initialized Value' : 'Deleted Value'}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {parsed.fields.map((f, index) => (
                            <TableRow key={index} hover>
                              <TableCell sx={{ fontWeight: 'medium', fontFamily: 'monospace' }}>{f.field}</TableCell>
                              <TableCell sx={{ 
                                bgcolor: parsed.type === 'create' ? '#f6ffed' : '#fff1f0', 
                                color: parsed.type === 'create' ? '#389e0d' : '#cf1322',
                                fontFamily: 'monospace' 
                              }}>
                                {f.value}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  );
                })()}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #f0f0f0' }}>
          <Button onClick={handleCloseDetails} variant="contained" color="primary">
            Close
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
