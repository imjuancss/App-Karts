import React from 'react';
import Button from '@mui/material/Button';

/**
 * KineticButton
 * Reusable Material UI button applying the Velocity Noir design constraints.
 * 
 * Props:
 * - variant: 'contained' | 'outlined' | 'text'
 * - color: 'primary' | 'secondary' | ...
 * - ...all other standard MUI Button props
 */
export default function KineticButton({ children, variant = 'contained', color = 'primary', ...props }) {
  return (
    <Button variant={variant} color={color} disableElevation {...props}>
      {children}
    </Button>
  );
}
