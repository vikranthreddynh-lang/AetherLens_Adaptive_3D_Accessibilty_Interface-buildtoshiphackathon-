import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router.js';
import { AuthProvider } from '../hooks/useAuth.js';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};
