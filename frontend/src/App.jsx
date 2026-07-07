import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Shield,
  Add,
  Edit,
  Delete,
  Visibility,
  ArrowBack,
  FolderOpen,
  CheckCircle,
  Cancel,
  AttachMoney,
  Info,
} from '@mui/icons-material';

// Modern MUI Theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4f46e5', // indigo 600
    },
    secondary: {
      main: '#0d9488', // teal 600
    },
    background: {
      default: '#f8fafc', // slate 50
      paper: '#ffffff',
    },
    success: {
      main: '#10b981', // emerald 500
    },
    error: {
      main: '#ef4444', // red 500
    },
    warning: {
      main: '#f59e0b', // amber 500
    },
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
      },
    },
  },
});

const API_BASE_URL = 'http://localhost:8080/api/products';

const PRODUCT_TYPES = ['LIFE', 'HOME', 'TRAVEL', 'AUTO'];
const COVER_TYPES = [
  'MEDICAL',
  'BAGGAGE',
  'LIABILITY',
  'PROPERTY_DAMAGE',
  'THEFT',
  'NATURAL_DISASTER',
  'TRIP_CANCELLATION',
  'OTHER'
];

export default function App() {
  // Navigation & View States
  // views: 'list', 'form', 'detail'
  const [view, setView] = useState('list');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form State (Product)
  const [productForm, setProductForm] = useState({
    name: '',
    type: 'TRAVEL',
    description: '',
    basePremium: '',
    active: true,
  });
  const [formErrors, setFormErrors] = useState({});

  // Cover Dialog States
  const [coverDialogOpen, setCoverDialogOpen] = useState(false);
  const [coverForm, setCoverForm] = useState({
    id: null,
    name: '',
    coverType: 'MEDICAL',
    coverageLimit: '',
    description: '',
  });
  const [coverErrors, setCoverErrors] = useState({});

  // Snackbar Toast notification
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch all products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE_URL);
      if (!res.ok) throw new Error('Failed to fetch catalog.');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  // Switch to list view
  const goToList = () => {
    setSelectedProduct(null);
    setView('list');
    fetchProducts();
  };

  // Open product form (Create / Edit)
  const openProductForm = (product = null) => {
    setFormErrors({});
    if (product) {
      setProductForm({
        id: product.id,
        name: product.name,
        type: product.type,
        description: product.description || '',
        basePremium: product.basePremium.toString(),
        active: product.active,
      });
    } else {
      setProductForm({
        name: '',
        type: 'TRAVEL',
        description: '',
        basePremium: '',
        active: true,
      });
    }
    setView('form');
  };

  // Open single product details
  const openProductDetails = async (productId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/${productId}`);
      if (!res.ok) throw new Error('Failed to load product details.');
      const data = await res.json();
      setSelectedProduct(data);
      setView('detail');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Validate Product Form
  const validateProductForm = () => {
    const errors = {};
    if (!productForm.name.trim()) errors.name = 'Name is required';
    if (!productForm.basePremium) {
      errors.basePremium = 'Base premium is required';
    } else {
      const val = parseFloat(productForm.basePremium);
      if (isNaN(val) || val <= 0) {
        errors.basePremium = 'Base premium must be greater than 0';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Product Save (POST / PUT)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!validateProductForm()) return;

    setLoading(true);
    try {
      const isEdit = !!productForm.id;
      const url = isEdit ? `${API_BASE_URL}/${productForm.id}` : API_BASE_URL;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...productForm,
          basePremium: parseFloat(productForm.basePremium),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.errors) {
          setFormErrors(errorData.errors);
          throw new Error('Validation failed');
        }
        throw new Error('Failed to save product.');
      }

      showToast(
        `Product "${productForm.name}" ${isEdit ? 'updated' : 'created'} successfully.`
      );
      goToList();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Toggle Active Status Quick Action
  const handleToggleActive = async (product) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          active: !product.active,
        }),
      });

      if (!res.ok) throw new Error('Failed to toggle status.');
      showToast(`Product status updated.`);
      fetchProducts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Product Delete
  const handleDeleteProduct = async (productId, productName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete product "${productName}"? This will permanently delete all associated covers.`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/${productId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete product.');
      showToast(`Product "${productName}" deleted.`);
      goToList();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Validate Cover Form
  const validateCoverForm = () => {
    const errors = {};
    if (!coverForm.name.trim()) errors.name = 'Cover name is required';
    if (!coverForm.coverageLimit) {
      errors.coverageLimit = 'Coverage limit is required';
    } else {
      const val = parseFloat(coverForm.coverageLimit);
      if (isNaN(val) || val <= 0) {
        errors.coverageLimit = 'Coverage limit must be greater than 0';
      }
    }
    setCoverErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open Cover Add/Edit Dialog
  const openCoverDialog = (cover = null) => {
    setCoverErrors({});
    if (cover) {
      setCoverForm({
        id: cover.id,
        name: cover.name,
        coverType: cover.coverType,
        coverageLimit: cover.coverageLimit.toString(),
        description: cover.description || '',
      });
    } else {
      setCoverForm({
        id: null,
        name: '',
        coverType: 'MEDICAL',
        coverageLimit: '',
        description: '',
      });
    }
    setCoverDialogOpen(true);
  };

  // Handle Cover Save (POST / PUT)
  const handleSaveCover = async () => {
    if (!validateCoverForm()) return;

    setLoading(true);
    try {
      const isEdit = !!coverForm.id;
      const url = isEdit
        ? `${API_BASE_URL}/${selectedProduct.id}/covers/${coverForm.id}`
        : `${API_BASE_URL}/${selectedProduct.id}/covers`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...coverForm,
          coverageLimit: parseFloat(coverForm.coverageLimit),
        }),
      });

      if (!res.ok) throw new Error('Failed to save cover.');

      showToast(`Cover "${coverForm.name}" saved.`);
      setCoverDialogOpen(false);
      // Reload product details to show updated covers
      openProductDetails(selectedProduct.id);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Cover Delete
  const handleDeleteCover = async (coverId, coverName) => {
    if (!window.confirm(`Are you sure you want to delete cover "${coverName}"?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/${selectedProduct.id}/covers/${coverId}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Failed to delete cover.');
      showToast(`Cover "${coverName}" removed.`);
      // Reload details
      openProductDetails(selectedProduct.id);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Stats calculation
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.active).length;
  const inactiveProducts = totalProducts - activeProducts;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Top App Bar */}
      <AppBar position="static" elevation={0} sx={{ borderBottom: '1px solid #e2e8f0', bgcolor: 'background.paper', color: 'text.primary' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Shield color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h5" color="primary" sx={{ letterSpacing: '-0.025em' }}>
                SafeHaven
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                | Admin Panel
              </Typography>
            </Box>

            <Box>
              {view === 'list' ? (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => openProductForm()}
                  disableElevation
                >
                  New Product
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={goToList}
                >
                  Back to catalog
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, pb: 6 }}>
        {loading && (
          <Box display="flex" justifyContent="center" sx={{ my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* 1. LIST VIEW */}
        {view === 'list' && (
          <Box>
            {/* Stats Section */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={4}>
                <Card sx={{ borderLeft: '4px solid #4f46e5' }}>
                  <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                    <Typography color="textSecondary" variant="subtitle2" gutterBottom>
                      Total Products
                    </Typography>
                    <Typography variant="h4" component="div">
                      {totalProducts}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ borderLeft: '4px solid #10b981' }}>
                  <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                    <Typography color="textSecondary" variant="subtitle2" gutterBottom>
                      Active Products
                    </Typography>
                    <Typography variant="h4" component="div" color="success.main">
                      {activeProducts}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ borderLeft: '4px solid #ef4444' }}>
                  <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                    <Typography color="textSecondary" variant="subtitle2" gutterBottom>
                      Inactive Products
                    </Typography>
                    <Typography variant="h4" component="div" color="error.main">
                      {inactiveProducts}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Catalog Table */}
            <Typography variant="h5" sx={{ mb: 2 }}>
              Insurance Products Catalog
            </Typography>

            {products.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                <FolderOpen sx={{ fontSize: 60, mb: 2, color: 'divider' }} />
                <Typography variant="h6">No products found in catalog</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Create your first insurance product to populate the database.
                </Typography>
                <Button variant="contained" onClick={() => openProductForm()} disableElevation>
                  Create Product
                </Button>
              </Paper>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0' }}>
                <Table>
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Product Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Base Premium</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">Covers Count</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{product.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={product.type}
                            size="small"
                            variant="outlined"
                            color={
                              product.type === 'LIFE'
                                ? 'primary'
                                : product.type === 'HOME'
                                ? 'secondary'
                                : product.type === 'TRAVEL'
                                ? 'warning'
                                : 'info'
                            }
                          />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {product.description || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No description</span>}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          ${parseFloat(product.basePremium).toFixed(2)}
                        </TableCell>
                        <TableCell align="center">
                          {product.covers ? product.covers.length : 0}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Toggle active status">
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={product.active}
                                  onChange={() => handleToggleActive(product)}
                                  color="success"
                                  size="small"
                                />
                              }
                              label={
                                product.active ? (
                                  <Chip label="Active" color="success" size="small" variant="light" />
                                ) : (
                                  <Chip label="Inactive" color="error" size="small" variant="light" />
                                )
                              }
                              labelPlacement="end"
                              sx={{ m: 0 }}
                            />
                          </Tooltip>
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" justifyContent="center" gap={1}>
                            <Tooltip title="View details & covers">
                              <IconButton
                                color="primary"
                                size="small"
                                onClick={() => openProductDetails(product.id)}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit details">
                              <IconButton
                                color="secondary"
                                size="small"
                                onClick={() => openProductForm(product)}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete product">
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => handleDeleteProduct(product.id, product.name)}
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* 2. PRODUCT DETAILS & COVERS VIEW */}
        {view === 'detail' && selectedProduct && (
          <Box>
            {/* Header / Info Section */}
            <Paper elevation={0} sx={{ p: 4, mb: 4, border: '1px solid #e2e8f0', borderRadius: 3 }}>
              <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="flex-start" gap={2}>
                <Box>
                  <Box display="flex" alignItems="center" gap={1.5} sx={{ mb: 1 }}>
                    <Typography variant="h5">{selectedProduct.name}</Typography>
                    <Chip
                      label={selectedProduct.active ? 'Active' : 'Inactive'}
                      color={selectedProduct.active ? 'success' : 'error'}
                      size="small"
                    />
                    <Chip label={selectedProduct.type} variant="outlined" size="small" />
                  </Box>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2, maxWidth: 800 }}>
                    {selectedProduct.description || 'No description provided.'}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created on:{' '}
                    {new Date(selectedProduct.creationDatetime).toLocaleString()}
                  </Typography>
                </Box>
                <Box textAlign={{ xs: 'left', sm: 'right' }} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Base Premium
                  </Typography>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                    ${parseFloat(selectedProduct.basePremium).toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    monthly/annual base rate
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box display="flex" gap={2}>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<Edit />}
                  onClick={() => openProductForm(selectedProduct)}
                  disableElevation
                >
                  Edit Product Details
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => handleDeleteProduct(selectedProduct.id, selectedProduct.name)}
                >
                  Delete Product
                </Button>
              </Box>
            </Paper>

            {/* Covers List Section */}
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" display="flex" alignItems="center" gap={1}>
                Covers list ({selectedProduct.covers ? selectedProduct.covers.length : 0})
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => openCoverDialog()}
                disableElevation
              >
                Add Cover
              </Button>
            </Box>

            {!selectedProduct.covers || selectedProduct.covers.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                <Info sx={{ fontSize: 40, mb: 1, color: 'text.secondary' }} />
                <Typography variant="subtitle1">No covers added to this product</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Insurance products require at least one cover to define protection parameters.
                </Typography>
                <Button variant="outlined" onClick={() => openCoverDialog()}>
                  Add Cover Now
                </Button>
              </Paper>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0' }}>
                <Table>
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Cover Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Cover Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Coverage Limit</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedProduct.covers.map((cover) => (
                      <TableRow key={cover.id} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{cover.name}</TableCell>
                        <TableCell>
                          <Chip label={cover.coverType} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          ${parseFloat(cover.coverageLimit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell sx={{ maxWidth: 400 }}>
                          {cover.description || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No description</span>}
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" justifyContent="center" gap={1}>
                            <IconButton
                              color="secondary"
                              size="small"
                              onClick={() => openCoverDialog(cover)}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleDeleteCover(cover.id, cover.name)}
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* 3. PRODUCT CREATE / EDIT FORM */}
        {view === 'form' && (
          <Paper elevation={0} sx={{ p: 4, border: '1px solid #e2e8f0', borderRadius: 3, maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h5" sx={{ mb: 3 }}>
              {productForm.id ? 'Edit Insurance Product' : 'Create New Insurance Product'}
            </Typography>

            <form onSubmit={handleSaveProduct}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Product Name"
                    fullWidth
                    value={productForm.name}
                    onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))}
                    error={!!formErrors.name}
                    helperText={formErrors.name || 'e.g. Travel Safe Plus, Home Protect Basic'}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Product Type</InputLabel>
                    <Select
                      value={productForm.type}
                      label="Product Type"
                      onChange={(e) => setProductForm((p) => ({ ...p, type: e.target.value }))}
                    >
                      {PRODUCT_TYPES.map((t) => (
                        <MenuItem key={t} value={t}>
                          {t}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Base Premium ($)"
                    type="number"
                    inputProps={{ step: '0.01' }}
                    fullWidth
                    value={productForm.basePremium}
                    onChange={(e) => setProductForm((p) => ({ ...p, basePremium: e.target.value }))}
                    error={!!formErrors.basePremium}
                    helperText={formErrors.basePremium || 'Base rate price (> 0)'}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    multiline
                    rows={4}
                    fullWidth
                    value={productForm.description}
                    onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Provide a brief overview of the plan coverage..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={productForm.active}
                        onChange={(e) => setProductForm((p) => ({ ...p, active: e.target.checked }))}
                        color="success"
                      />
                    }
                    label="Active Catalog Status"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box display="flex" gap={2} sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      type="submit"
                      color="primary"
                      size="large"
                      disableElevation
                    >
                      Save Product
                    </Button>
                    <Button variant="outlined" size="large" onClick={goToList}>
                      Cancel
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>
        )}
      </Container>

      {/* COVER DIALOG (Add / Edit Cover) */}
      <Dialog open={coverDialogOpen} onClose={() => setCoverDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {coverForm.id ? 'Edit Cover Settings' : 'Add Cover to Product'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Cover Name"
                fullWidth
                value={coverForm.name}
                onChange={(e) => setCoverForm((c) => ({ ...c, name: e.target.value }))}
                error={!!coverErrors.name}
                helperText={coverErrors.name || 'e.g. Medical Expenses, Baggage Loss'}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Cover Type</InputLabel>
                <Select
                  value={coverForm.coverType}
                  label="Cover Type"
                  onChange={(e) => setCoverForm((c) => ({ ...c, coverType: e.target.value }))}
                >
                  {COVER_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Coverage Limit ($)"
                type="number"
                inputProps={{ step: '0.01' }}
                fullWidth
                value={coverForm.coverageLimit}
                onChange={(e) => setCoverForm((c) => ({ ...c, coverageLimit: e.target.value }))}
                error={!!coverErrors.coverageLimit}
                helperText={coverErrors.coverageLimit || 'Maximum payout limit (> 0)'}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Description"
                multiline
                rows={3}
                fullWidth
                value={coverForm.description}
                onChange={(e) => setCoverForm((c) => ({ ...c, description: e.target.value }))}
                placeholder="Details of covered exceptions or terms..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCoverDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveCover} disableElevation>
            Save Cover
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Toast System */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
