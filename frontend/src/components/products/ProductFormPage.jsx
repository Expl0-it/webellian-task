import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { PRODUCT_TYPES } from '../../constants';
import { createProduct, updateProduct } from '../../api/productsApi';
import CoverTable from '../covers/CoverTable';
import CoverFormDialog from '../covers/CoverFormDialog';
import EmptyState from '../common/EmptyState';

const emptyForm = { name: '', type: 'TRAVEL', description: '', basePremium: '', active: true };

export default function ProductFormPage({ product, onSaved, onCancel, showToast }) {
  const isEdit = !!product;

  const [form, setForm] = useState(
    isEdit
      ? {
          id: product.id,
          name: product.name,
          type: product.type,
          description: product.description || '',
          basePremium: product.basePremium.toString(),
          active: product.active,
        }
      : emptyForm
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Draft covers, only used while creating a brand-new product (no product id yet,
  // so nothing to persist covers against until the product itself is saved).
  const [draftCovers, setDraftCovers] = useState([]);
  const [coverDialogOpen, setCoverDialogOpen] = useState(false);
  const [editingCover, setEditingCover] = useState(null);

  const setField = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!form.basePremium) {
      next.basePremium = 'Base premium is required';
    } else {
      const val = parseFloat(form.basePremium);
      if (isNaN(val) || val <= 0) next.basePremium = 'Base premium must be greater than 0';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    const payload = { ...form, basePremium: parseFloat(form.basePremium) };
    if (!isEdit) {
      // Strip the client-side draft id/description shape down to what the backend expects;
      // InsuranceProductService links these to the product and cascades the save.
      payload.covers = draftCovers.map(({ id, ...cover }) => cover);
    }

    try {
      const saved = isEdit ? await updateProduct(form.id, payload) : await createProduct(payload);
      showToast(`Product "${form.name}" ${isEdit ? 'updated' : 'created'} successfully.`);
      onSaved(saved);
    } catch (err) {
      if (err.fieldErrors) setErrors(err.fieldErrors);
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const openAddCover = () => {
    setEditingCover(null);
    setCoverDialogOpen(true);
  };

  const openEditCover = (cover) => {
    setEditingCover(cover);
    setCoverDialogOpen(true);
  };

  const handleCoverSaved = (cover) => {
    setDraftCovers((prev) => {
      const exists = prev.some((c) => c.id === cover.id);
      return exists ? prev.map((c) => (c.id === cover.id ? cover : c)) : [...prev, cover];
    });
    setCoverDialogOpen(false);
  };

  const handleDeleteDraftCover = (coverId, coverName) => {
    if (!window.confirm(`Remove cover "${coverName}" from this draft?`)) return;
    setDraftCovers((prev) => prev.filter((c) => c.id !== coverId));
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, pb: 6 }}>
      <Paper elevation={0} sx={{ p: 4, border: '1px solid #e2e8f0', borderRadius: 3, maxWidth: 900, mx: 'auto' }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          {isEdit ? 'Edit Insurance Product' : 'Create New Insurance Product'}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Product Name"
                fullWidth
                value={form.name}
                onChange={setField('name')}
                error={!!errors.name}
                helperText={errors.name || 'e.g. Travel Safe Plus, Home Protect Basic'}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Product Type</InputLabel>
                <Select value={form.type} label="Product Type" onChange={setField('type')}>
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
                value={form.basePremium}
                onChange={setField('basePremium')}
                error={!!errors.basePremium}
                helperText={errors.basePremium || 'Base rate price (> 0)'}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Description"
                multiline
                rows={4}
                fullWidth
                value={form.description}
                onChange={setField('description')}
                placeholder="Provide a brief overview of the plan coverage..."
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.active}
                    onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                    color="success"
                  />
                }
                label="Active Catalog Status"
              />
            </Grid>

            {/* Covers can only be added inline while creating a new product — once it
                exists, they're managed from the product detail page instead. */}
            {!isEdit && (
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2, mt: 2 }}>
                  <Typography variant="h6">Covers ({draftCovers.length})</Typography>
                  <Button variant="outlined" startIcon={<Add />} onClick={openAddCover}>
                    Add Cover
                  </Button>
                </Box>

                {draftCovers.length === 0 ? (
                  <EmptyState
                    title="No covers added yet"
                    description="Optional — you can add covers now, or skip this and add them later from the product detail page."
                  />
                ) : (
                  <CoverTable covers={draftCovers} onEdit={openEditCover} onDelete={handleDeleteDraftCover} />
                )}
              </Grid>
            )}

            <Grid item xs={12}>
              <Box display="flex" gap={2} sx={{ mt: 2 }}>
                <Button variant="contained" type="submit" color="primary" size="large" disableElevation disabled={saving}>
                  Save Product
                </Button>
                <Button variant="outlined" size="large" onClick={onCancel} disabled={saving}>
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {!isEdit && (
        <CoverFormDialog
          open={coverDialogOpen}
          productId={null}
          cover={editingCover}
          onClose={() => setCoverDialogOpen(false)}
          onSaved={handleCoverSaved}
          showToast={showToast}
        />
      )}
    </Container>
  );
}
