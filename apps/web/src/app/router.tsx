import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout.js';
import { LandingPage } from '../pages/LandingPage.js';
import { DemoPage } from '../pages/DemoPage.js';
import { HowItWorksPage } from '../pages/HowItWorksPage.js';
import { PrivacyPage } from '../pages/PrivacyPage.js';
import { AccessibilityPage } from '../pages/AccessibilityPage.js';
import { OnboardingPage } from '../pages/OnboardingPage.js';
import { NewSessionPage } from '../pages/NewSessionPage.js';
import { LiveSessionPage } from '../pages/LiveSessionPage.js';
import { SessionRecapPage } from '../pages/SessionRecapPage.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { AccessibilitySettingsPage } from '../pages/AccessibilitySettingsPage.js';
import { SignInPage } from '../pages/SignInPage.js';
import { SignUpPage } from '../pages/SignUpPage.js';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage.js';
import { ResetPasswordPage } from '../pages/ResetPasswordPage.js';
import { NotFoundPage } from '../pages/NotFoundPage.js';
import { useAuth } from '../hooks/useAuth.js';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 text-sm">
        Verifying user credentials...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }
  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'demo', element: <DemoPage /> },
      { path: 'how-it-works', element: <HowItWorksPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'accessibility', element: <AccessibilityPage /> },
      { path: 'onboarding', element: <OnboardingPage /> },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      { path: 'settings/accessibility', element: <AccessibilitySettingsPage /> },
      { path: 'settings/privacy', element: <PrivacyPage /> },
      { path: 'session/new', element: <NewSessionPage /> },
      { path: 'session/:id/live', element: <LiveSessionPage /> },
      { path: 'session/:id/recap', element: <SessionRecapPage /> },
      { path: 'auth/sign-in', element: <SignInPage /> },
      { path: 'auth/sign-up', element: <SignUpPage /> },
      { path: 'auth/forgot-password', element: <ForgotPasswordPage /> },
      { path: 'auth/reset-password', element: <ResetPasswordPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
