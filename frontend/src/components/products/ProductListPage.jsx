import { useCallback, useEffect, useState } from 'react';
import { Box, Container, CircularProgress, Typography } from '@mui/material';
import { FolderOpen } from '@mui/icons-material';
import EmptyState from '../common/EmptyState';
import ProductStatsCards from './ProductStatsCards';
import ProductTable from './ProductTable';
import { deleteProduct, getProducts, updateProduct } from '../../api/productsApi';

export default function ProductListPage({ onView, onEdit, onCreate, showToast, reloadKey }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // reloadKey lets the parent force a refresh (e.g. after returning from the form/detail page)
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, reloadKey]);

  const handleToggleActive = async (product) => {
    try {
      await updateProduct(product.id, { ...product, active: !product.active });
      showToast('Product status updated.');
      fetchProducts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete product "${productName}"? This will permanently delete all associated covers.`)) {
      return;
    }
    setLoading(true);
    try {
      await deleteProduct(productId);
      showToast(`Product "${productName}" deleted.`);
      fetchProducts();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.active).length;
  const inactiveProducts = totalProducts - activeProducts;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, pb: 6 }}>
      {loading && (
        <Box display="flex" justifyContent="center" sx={{ my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      <ProductStatsCards total={totalProducts} active={activeProducts} inactive={inactiveProducts} />

      <Typography variant="h5" sx={{ mb: 2 }}>
        Insurance Products Catalog
      </Typography>

      {products.length === 0 && !loading ? (
        <EmptyState
          icon={<FolderOpen sx={{ fontSize: 60, mb: 2, color: 'divider' }} />}
          title="No products found in catalog"
          description="Create your first insurance product to populate the database."
          actionLabel="Create Product"
          onAction={onCreate}
        />
      ) : (
        <ProductTable
          products={products}
          onView={onView}
          onEdit={onEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />
      )}
    </Container>
  );
}
