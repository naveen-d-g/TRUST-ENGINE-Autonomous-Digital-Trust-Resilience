import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { HomeV1 } from './pages/public/HomeV1';


// Lazy Load SOC Pages
const SocDashboard = React.lazy(() => import('./pages/SOC/SocDashboard'));
const Incidents = React.lazy(() => import('./pages/SOC/Incidents'));
const IncidentDetailsPage = React.lazy(() => import('./pages/SOC/IncidentDetail'));
const Proposals = React.lazy(() => import('./pages/SOC/Proposals'));
const AuditExplorer = React.lazy(() => import('./pages/Audit/AuditExplorer'));

// Enterprise Pages
const IntelligencePage = React.lazy(() => import('./pages/Intelligence/IntelligencePage'));
const SystemHealthPage = React.lazy(() => import('./pages/System/SystemHealthPage'));
const DomainOverview = React.lazy(() => import('./pages/Domains/DomainOverview'));
const SessionExplorerPage = React.lazy(() => import('./pages/SessionExplorer/SessionExplorerPage'));
const SessionDetailsPage = React.lazy(() => import('./pages/SessionExplorer/SessionDetailsPage'));

// Restored JSX Pages
const LiveLoginDemo = React.lazy(() => import('./pages/LiveLoginDemo.jsx'));
const SimulationLab = React.lazy(() => import('./pages/SimulationLab.jsx'));
const BatchAudit = React.lazy(() => import('./pages/Batch.jsx'));
const LiveView = React.lazy(() => import('./pages/LiveView.jsx'));

const Placeholder = ({ title }: { title: string }) => <div className="p-4 text-xl">{title} (Under Construction)</div>;
const Loading = () => <div className="p-8 text-center text-muted-foreground">Loading Module...</div>;

import { AuthProvider } from './auth/AuthContext';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { LiveProvider } from './context/LiveContext';
import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
  return (
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
                        <Suspense fallback={<Loading />}><LiveLoginDemo /></Suspense>
                    } />
                    <Route path="/simulation" element={
                        <Suspense fallback={<Loading />}><SimulationLab /></Suspense>
                    } />

                    <Route path="/soc" element={
                        <Suspense fallback={<Loading />}><SocDashboard /></Suspense>
                    } />
                    <Route path="/soc/incidents" element={
                        <Suspense fallback={<Loading />}><Incidents /></Suspense>
                    } />
                    <Route path="/soc/incidents/:id" element={
                        <Suspense fallback={<Loading />}><IncidentDetailsPage /></Suspense>
                    } />
                    <Route path="/soc/proposals" element={
                        <Suspense fallback={<Loading />}><Proposals /></Suspense>
                    } />
                    <Route path="/audit" element={
                        <Suspense fallback={<Loading />}><AuditExplorer /></Suspense>
                    } />
                    <Route path="/soc/audit" element={
                        <Suspense fallback={<Loading />}><AuditExplorer /></Suspense>
                    } />
                    
                    <Route path="/sessions" element={
                        <Suspense fallback={<Loading />}><SessionExplorerPage /></Suspense>
                    } />
                    <Route path="/sessions/:sessionId" element={
                        <Suspense fallback={<Loading />}><SessionDetailsPage /></Suspense>
                    } />
                    <Route path="/soc/sessions" element={
                        <Navigate to="/sessions" replace />
                    } />
                    
                    <Route path="/soc/batch" element={
                        <Suspense fallback={<Loading />}><BatchAudit /></Suspense>
                    } />
                    <Route path="/live" element={
                        <Suspense fallback={<Loading />}><LiveView /></Suspense>
                    } />

                    {/* Enterprise Routes */}
                    <Route path="/intelligence" element={
                        <Suspense fallback={<Loading />}><IntelligencePage /></Suspense>
                    } />
                    <Route path="/system-health" element={
                        <Suspense fallback={<Loading />}><SystemHealthPage /></Suspense>
                    } />
                    <Route path="/domain/:type" element={
                         <Suspense fallback={<Loading />}><DomainOverview /></Suspense>
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
  );
};

export default App;
