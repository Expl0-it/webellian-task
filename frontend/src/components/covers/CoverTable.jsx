import { Box, Chip, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';

export default function CoverTable({ covers, onEdit, onDelete }) {
  return (
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
          {covers.map((cover) => (
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
                  <IconButton color="secondary" size="small" onClick={() => onEdit(cover)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="error" size="small" onClick={() => onDelete(cover.id, cover.name)}>
                    <Delete />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
