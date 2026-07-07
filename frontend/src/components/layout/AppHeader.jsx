import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';
import { Add, ArrowBack, Shield } from '@mui/icons-material';

export default function AppHeader({ view, onNewProduct, onBack }) {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{ borderBottom: '1px solid #e2e8f0', bgcolor: 'background.paper', color: 'text.primary' }}
    >
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
              <Button variant="contained" startIcon={<Add />} onClick={onNewProduct} disableElevation>
                New Product
              </Button>
            ) : (
              <Button variant="outlined" startIcon={<ArrowBack />} onClick={onBack}>
                Back to catalog
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
