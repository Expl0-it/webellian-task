import {
  Box,
  Chip,
  FormControlLabel,
  IconButton,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import { Delete, Edit, Visibility } from '@mui/icons-material';
import { PRODUCT_TYPE_COLOR } from '../../constants';

export default function ProductTable({ products, onView, onEdit, onDelete, onToggleActive }) {
  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0' }}>
      <Table>
        <TableHead sx={{ bgcolor: '#f8fafc' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Product Name</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
            <TableCell sx={{ fontWeight: 600 }} align="right">Base Premium</TableCell>
            <TableCell sx={{ fontWeight: 600 }} align="center">Covers Count</TableCell>
            <TableCell sx={{ fontWeight: 600 }} align="center">Status</TableCell>
            <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} hover>
              <TableCell sx={{ fontWeight: 500 }}>{product.name}</TableCell>
              <TableCell>
                <Chip label={product.type} size="small" variant="outlined" color={PRODUCT_TYPE_COLOR[product.type] || 'default'} />
              </TableCell>
              <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {product.description || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No description</span>}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                ${parseFloat(product.basePremium).toFixed(2)}
              </TableCell>
              <TableCell align="center">{product.covers ? product.covers.length : 0}</TableCell>
              <TableCell align="center">
                <Tooltip title="Toggle active status">
                  <FormControlLabel
                    control={
                      <Switch checked={product.active} onChange={() => onToggleActive(product)} color="success" size="small" />
                    }
                    label={
                      product.active ? (
                        <Chip label="Active" color="success" size="small" variant="light" />
                      ) : (
                        <Chip label="Inactive" color="error" size="small" variant="light" />
                      )
                    }
                    labelPlacement="end"
                    sx={{ m: 0 }}
                  />
                </Tooltip>
              </TableCell>
              <TableCell align="center">
                <Box display="flex" justifyContent="center" gap={1}>
                  <Tooltip title="View details & covers">
                    <IconButton color="primary" size="small" onClick={() => onView(product.id)}>
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit details">
                    <IconButton color="secondary" size="small" onClick={() => onEdit(product)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete product">
                    <IconButton color="error" size="small" onClick={() => onDelete(product.id, product.name)}>
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
