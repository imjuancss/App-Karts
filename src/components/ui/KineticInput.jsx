import React from 'react';
import TextField from '@mui/material/TextField';

/**
 * KineticInput
 * Reusable Material UI text field tailored to Velocity Noir.
 * 
 * Props:
 * - variant: 'outlined' | 'filled' | 'standard' (Defaults to outlined)
 * - ...all other standard MUI TextField props
 */
export default function KineticInput({ variant = 'outlined', ...props }) {
  return (
    <TextField 
      variant={variant} 
      {...props} 
    />
  );
}
