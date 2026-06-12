import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

/**
 * KineticCard
 * Reusable Material UI card applying the Velocity Noir glassmorphism design.
 * 
 * Props:
 * - noPadding: boolean (removes CardContent wrapper if true)
 * - ...all other standard MUI Card props
 */
export default function KineticCard({ children, noPadding = false, sx, ...props }) {
  return (
    <Card 
      sx={{ 
        ...sx 
      }} 
      {...props}
    >
      {noPadding ? children : <CardContent>{children}</CardContent>}
    </Card>
  );
}
