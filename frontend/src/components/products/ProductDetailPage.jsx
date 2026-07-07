import { useCallback, useEffect, useState } from 'react';
import { Box, Button, Chip, CircularProgress, Container, Divider, Paper, Typography } from '@mui/material';
import { Add, Delete, Edit, Info } from '@mui/icons-material';
import EmptyState from '../common/EmptyState';
import CoverTable from '../covers/CoverTable';
import CoverFormDialog from '../covers/CoverFormDialog';
import { deleteCover, deleteProduct, getProduct } from '../../api/productsApi';

export default function ProductDetailPage({ productId, onBack, onEdit, showToast }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCover, setEditingCover] = useState(null);

  const loadProduct = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProduct(productId);
      setProduct(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [productId, showToast]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const handleDeleteProduct = async () => {
    if (!window.confirm(`Are you sure you want to delete product "${product.name}"? This will permanently delete all associated covers.`)) {
      return;
    }
    try {
      await deleteProduct(product.id);
      showToast(`Product "${product.name}" deleted.`);
      onBack();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const openAddCover = () => {
    setEditingCover(null);
    setDialogOpen(true);
  };

  const openEditCover = (cover) => {
    setEditingCover(cover);
    setDialogOpen(true);
  };

  const handleDeleteCover = async (coverId, coverName) => {
    if (!window.confirm(`Are you sure you want to delete cover "${coverName}"?`)) return;
    try {
      await deleteCover(product.id, coverId);
      showToast(`Cover "${coverName}" removed.`);
      loadProduct();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading && !product) {
    return (
      <Box display="flex" justifyContent="center" sx={{ my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!product) return null;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, pb: 6 }}>
      <Paper elevation={0} sx={{ p: 4, mb: 4, border: '1px solid #e2e8f0', borderRadius: 3 }}>
        <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="flex-start" gap={2}>
          <Box>
            <Box display="flex" alignItems="center" gap={1.5} sx={{ mb: 1 }}>
              <Typography variant="h5">{product.name}</Typography>
              <Chip label={product.active ? 'Active' : 'Inactive'} color={product.active ? 'success' : 'error'} size="small" />
              <Chip label={product.type} variant="outlined" size="small" />
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2, maxWidth: 800 }}>
              {product.description || 'No description provided.'}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Created on: {new Date(product.creationDatetime).toLocaleString()}
            </Typography>
          </Box>
          <Box textAlign={{ xs: 'left', sm: 'right' }} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
            <Typography variant="subtitle2" color="text.secondary">Base Premium</Typography>
            <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
              ${parseFloat(product.basePremium).toFixed(2)}
            </Typography>
            <Typography variant="caption" color="text.secondary">monthly/annual base rate</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box display="flex" gap={2}>
          <Button variant="contained" color="secondary" startIcon={<Edit />} onClick={() => onEdit(product)} disableElevation>
            Edit Product Details
          </Button>
          <Button variant="outlined" color="error" startIcon={<Delete />} onClick={handleDeleteProduct}>
            Delete Product
          </Button>
        </Box>
      </Paper>

      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" display="flex" alignItems="center" gap={1}>
          Covers list ({product.covers ? product.covers.length : 0})
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openAddCover} disableElevation>
          Add Cover
        </Button>
      </Box>

      {!product.covers || product.covers.length === 0 ? (
        <EmptyState
          icon={<Info sx={{ fontSize: 40, mb: 1, color: 'text.secondary' }} />}
          title="No covers added to this product"
          description="Insurance products require at least one cover to define protection parameters."
          actionLabel="Add Cover Now"
          onAction={openAddCover}
        />
      ) : (
        <CoverTable covers={product.covers} onEdit={openEditCover} onDelete={handleDeleteCover} />
      )}

      <CoverFormDialog
        open={dialogOpen}
        productId={product.id}
        cover={editingCover}
        onClose={() => setDialogOpen(false)}
        onSaved={() => {
          setDialogOpen(false);
          loadProduct();
        }}
        showToast={showToast}
      />
    </Container>
  );
}
