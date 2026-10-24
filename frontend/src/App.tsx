import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { DashboardPage } from './views/DashboardPage';
import { CasesPage } from './views/CasesPage';
import { CaseDetailPage } from './views/CaseDetailPage';
import { PeoplePage } from './views/PeoplePage';
import { OrganizationsPage } from './views/OrganizationsPage';
import { VehiclesPage } from './views/VehiclesPage';
import { DevicesPage } from './views/DevicesPage';
import { LocationsPage } from './views/LocationsPage';
import { EvidencePage } from './views/EvidencePage';
import { DocumentsPage } from './views/DocumentsPage';
import { SearchPage } from './views/SearchPage';
import { RelationshipsPage } from './views/RelationshipsPage';
import { AnalyticsPage } from './views/AnalyticsPage';
import { DBMSConceptsPage } from './views/DBMSConceptsPage';
import { AboutPage } from './views/AboutPage';
import { LoginPage } from './views/LoginPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="cases" element={<CasesPage />} />
          <Route path="cases/:id" element={<CaseDetailPage />} />
          <Route path="people" element={<PeoplePage />} />
          <Route path="organizations" element={<OrganizationsPage />} />
          <Route path="vehicles" element={<VehiclesPage />} />
          <Route path="devices" element={<DevicesPage />} />
          <Route path="locations" element={<LocationsPage />} />
          <Route path="evidence" element={<EvidencePage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="relationships" element={<RelationshipsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="dbms-concepts" element={<DBMSConceptsPage />} />
          <Route path="about" element={<AboutPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
