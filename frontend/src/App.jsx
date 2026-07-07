import { useState } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from './theme';
import { useToast } from './hooks/useToast';
import AppHeader from './components/layout/AppHeader';
import ToastNotification from './components/common/ToastNotification';
import ProductListPage from './components/products/ProductListPage';
import ProductDetailPage from './components/products/ProductDetailPage';
import ProductFormPage from './components/products/ProductFormPage';

// view: 'list' | 'detail' | 'form'
export default function App() {
  const [view, setView] = useState('list');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const { toast, showToast, closeToast } = useToast();

  const goToList = () => {
    setSelectedProductId(null);
    setEditingProduct(null);
    setReloadKey((k) => k + 1); // force ProductListPage to refetch
    setView('list');
  };

  const goToDetail = (productId) => {
    setSelectedProductId(productId);
    setView('detail');
  };

  const goToCreateForm = () => {
    setEditingProduct(null);
    setView('form');
  };

  const goToEditForm = (product) => {
    setEditingProduct(product);
    setView('form');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <AppHeader view={view} onNewProduct={goToCreateForm} onBack={goToList} />

      {view === 'list' && (
        <ProductListPage
          onView={goToDetail}
          onEdit={goToEditForm}
          onCreate={goToCreateForm}
          showToast={showToast}
          reloadKey={reloadKey}
        />
      )}

      {view === 'detail' && selectedProductId && (
        <ProductDetailPage productId={selectedProductId} onBack={goToList} onEdit={goToEditForm} showToast={showToast} />
      )}

      {view === 'form' && (
        <ProductFormPage product={editingProduct} onSaved={goToList} onCancel={goToList} showToast={showToast} />
      )}

      <ToastNotification toast={toast} onClose={closeToast} />
    </ThemeProvider>
  );
}
