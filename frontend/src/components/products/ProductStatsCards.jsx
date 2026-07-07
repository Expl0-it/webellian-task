import { Card, CardContent, Grid, Typography } from '@mui/material';

export default function ProductStatsCards({ total, active, inactive }) {
  const stats = [
    { label: 'Total Products', value: total, color: '#4f46e5' },
    { label: 'Active Products', value: active, color: '#10b981', valueColor: 'success.main' },
    { label: 'Inactive Products', value: inactive, color: '#ef4444', valueColor: 'error.main' },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {stats.map((stat) => (
        <Grid item xs={12} sm={4} key={stat.label}>
          <Card sx={{ borderLeft: `4px solid ${stat.color}` }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Typography color="textSecondary" variant="subtitle2" gutterBottom>
                {stat.label}
              </Typography>
              <Typography variant="h4" component="div" color={stat.valueColor}>
                {stat.value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
