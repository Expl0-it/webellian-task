import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { COVER_TYPES } from '../../constants';
import { addCover, updateCover } from '../../api/productsApi';

const emptyForm = { id: null, name: '', coverType: 'MEDICAL', coverageLimit: '', description: '' };

export default function CoverFormDialog({ open, productId, cover, onClose, onSaved, showToast }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Reset the form whenever a different cover is opened (or "Add Cover" is clicked)
  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(
      cover
        ? { id: cover.id, name: cover.name, coverType: cover.coverType, coverageLimit: cover.coverageLimit.toString(), description: cover.description || '' }
        : emptyForm
    );
  }, [open, cover]);

  const setField = (field) => (e) => setForm((c) => ({ ...c, [field]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Cover name is required';
    if (!form.coverageLimit) {
      next.coverageLimit = 'Coverage limit is required';
    } else {
      const val = parseFloat(form.coverageLimit);
      if (isNaN(val) || val <= 0) next.coverageLimit = 'Coverage limit must be greater than 0';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const payload = { ...form, coverageLimit: parseFloat(form.coverageLimit) };
    const isEdit = !!form.id;

    // Draft mode: the parent product doesn't exist yet (still being created), so
    // there's nothing to call the API with. Just hand the validated data back —
    // the parent holds it in local state and sends it along with the create request.
    if (!productId) {
      onSaved({ ...payload, id: isEdit ? form.id : `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` });
      return;
    }

    setSaving(true);
    try {
      const saved = isEdit ? await updateCover(productId, form.id, payload) : await addCover(productId, payload);
      showToast(`Cover "${form.name}" saved.`);
      onSaved(saved);
    } catch (err) {
      if (err.fieldErrors) setErrors(err.fieldErrors);
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{form.id ? 'Edit Cover Settings' : 'Add Cover to Product'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              label="Cover Name"
              fullWidth
              value={form.name}
              onChange={setField('name')}
              error={!!errors.name}
              helperText={errors.name || 'e.g. Medical Expenses, Baggage Loss'}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Cover Type</InputLabel>
              <Select value={form.coverType} label="Cover Type" onChange={setField('coverType')}>
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
              value={form.coverageLimit}
              onChange={setField('coverageLimit')}
              error={!!errors.coverageLimit}
              helperText={errors.coverageLimit || 'Maximum payout limit (> 0)'}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Description"
              multiline
              rows={3}
              fullWidth
              value={form.description}
              onChange={setField('description')}
              placeholder="Details of covered exceptions or terms..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disableElevation disabled={saving}>
          Save Cover
        </Button>
      </DialogActions>
    </Dialog>
  );
}
