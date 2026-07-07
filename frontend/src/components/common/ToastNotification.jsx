import { Alert, Snackbar } from '@mui/material';

export default function ToastNotification({ toast, onClose }) {
  return (
    <Snackbar
      open={toast.open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert onClose={onClose} severity={toast.severity} sx={{ width: '100%' }}>
        {toast.message}
      </Alert>
    </Snackbar>
  );
}
