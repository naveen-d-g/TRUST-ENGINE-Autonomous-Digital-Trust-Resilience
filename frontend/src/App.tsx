import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import HomeV1 from './pages/public/HomeV1';


// Lazy Load SOC Pages
const SocDashboard = React.lazy(() => import('./pages/SOC/SocDashboard'));
const Incidents = React.lazy(() => import('./pages/SOC/Incidents'));
const IncidentDetailsPage = React.lazy(() => import('./pages/SOC/IncidentDetail'));
const Proposals = React.lazy(() => import('./pages/SOC/Proposals'));
const AuditExplorer = React.lazy(() => import('./pages/Audit/AuditExplorer'));
const DashboardPage = React.lazy(() => import('./pages/Dashboard/DashboardPage'));
const SessionExplorer = React.lazy(() => import('./pages/SessionExplorer.jsx'));

// Enterprise Pages
const IntelligencePage = React.lazy(() => import('./pages/Intelligence/IntelligencePage'));
const SystemHealthPage = React.lazy(() => import('./pages/System/SystemHealthPage'));
const DomainOverview = React.lazy(() => import('./pages/Domain/DomainOverview'));
const SessionExplorerPage = React.lazy(() => import('./pages/SessionExplorer/SessionExplorerPage'));
const SessionDetailsPage = React.lazy(() => import('./pages/SessionExplorer/SessionDetailsPage'));

// Restored JSX Pages
const LiveLoginDemo = React.lazy(() => import('./pages/LiveLoginDemo.jsx'));
const SimulationLab = React.lazy(() => import('./pages/SimulationLab.jsx'));
const Evaluate = React.lazy(() => import('./pages/Evaluate.jsx'));
const BatchAudit = React.lazy(() => import('./pages/Batch/BatchPage'));
const LiveView = React.lazy(() => import('./pages/LiveView.jsx'));


import { AuthProvider } from './auth/AuthContext';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { LiveProvider } from './context/LiveContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

// New infrastructure imports
import { ErrorBoundary as NewErrorBoundary } from './app/error/ErrorBoundary';
import { PageLoader } from './components/ui/PageLoader';
import { bootstrapApp } from './store/bootstrapStore';

import { useEffect } from 'react';

const App: React.FC = () => {
  // Bootstrap application on mount
  useEffect(() => {
    bootstrapApp().catch((error) => {
      console.error('Bootstrap failed:', error);
    });
  }, []);

  // useMonitoringSubscription() - handled by LiveContext now

  return (
    <NewErrorBoundary>
      <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <ThemeProvider>
            <LiveProvider>
              <Router>
                <Routes>
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<HomeV1 />} />
                    <Route path="/home" element={<HomeV1 />} />
                    
                    <Route path="/demo" element={
                        <Suspense fallback={<PageLoader />}><LiveLoginDemo /></Suspense>
                    } />
                    <Route path="/simulation" element={
                        <Suspense fallback={<PageLoader />}><SimulationLab /></Suspense>
                    } />
                    <Route path="/trust-eval" element={
                        <Suspense fallback={<PageLoader />}><Evaluate /></Suspense>
                    } />

                    <Route path="/soc" element={
                        <Suspense fallback={<PageLoader />}><SocDashboard /></Suspense>
                    } />
                    <Route path="/soc/incidents" element={
                        <Suspense fallback={<PageLoader />}><Incidents /></Suspense>
                    } />
                    <Route path="/soc/incidents/:id" element={
                        <Suspense fallback={<PageLoader />}><IncidentDetailsPage /></Suspense>
                    } />
                    <Route path="/soc/proposals" element={
                        <Suspense fallback={<PageLoader />}><Proposals /></Suspense>
                    } />
                    <Route path="/audit" element={
                        <Suspense fallback={<PageLoader />}><AuditExplorer /></Suspense>
                    } />
                    <Route path="/soc/audit" element={
                        <Suspense fallback={<PageLoader />}><AuditExplorer /></Suspense>
                    } />
                    
                    <Route path="/dashboard" element={
                        <Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>
                    } />
                    <Route path="/sessions" element={
                        <Suspense fallback={<PageLoader />}><SessionExplorer /></Suspense>
                    } />
                    <Route path="/soc/sessions" element={
                        <Suspense fallback={<PageLoader />}><SessionExplorer /></Suspense>
                    } />
                    <Route path="/soc/sessions-old" element={
                        <Suspense fallback={<PageLoader />}><SessionExplorerPage /></Suspense>
                    } />
                    <Route path="/sessions/:sessionId" element={
                        <Suspense fallback={<PageLoader />}><SessionDetailsPage /></Suspense>
                    } />
                    <Route path="/soc/sessions" element={
                        <Navigate to="/sessions" replace />
                    } />
                    
                    <Route path="/soc/batch" element={
                        <Suspense fallback={<PageLoader />}><BatchAudit /></Suspense>
                    } />
                    <Route path="/live" element={
                        <Suspense fallback={<PageLoader />}><LiveView /></Suspense>
                    } />

                    {/* Enterprise Routes */}
                    <Route path="/intelligence" element={
                        <Suspense fallback={<PageLoader />}><IntelligencePage /></Suspense>
                    } />
                    <Route path="/system-health" element={
                        <Suspense fallback={<PageLoader />}><SystemHealthPage /></Suspense>
                    } />
                    <Route path="/domain/:type" element={
                         <Suspense fallback={<PageLoader />}><DomainOverview /></Suspense>
                    } />
                    
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
              </Router>
            </LiveProvider>
          </ThemeProvider>
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
    </NewErrorBoundary>
  );
};

export default App;
