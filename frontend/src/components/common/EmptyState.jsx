import { Button, Paper, Typography } from '@mui/material';

export default function EmptyState({ icon, title, description, actionLabel, onAction }) {
  return (
    <Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
      {icon}
      <Typography variant="h6">{title}</Typography>
      {description && (
        <Typography variant="body2" sx={{ mb: 2 }}>
          {description}
        </Typography>
      )}
      {actionLabel && (
        <Button variant="outlined" onClick={onAction} sx={{ mt: description ? 0 : 2 }}>
          {actionLabel}
        </Button>
      )}
    </Paper>
  );
}
