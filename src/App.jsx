import React, { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { AuthProvider, useAuth } from './context/AuthContext';
import { apiFetch, API_BASE_URL } from './api';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { VerificationQueueView } from './views/VerificationQueueView';
import { FarmersView } from './views/FarmersView';
import { AgentsView } from './views/AgentsView';
import { ProvidersView } from './views/ProvidersView';
import { BookingsView } from './views/BookingsView';
import { FinanceView } from './views/FinanceView';
import { ServicesView } from './views/ServicesView';
import { CategoriesView } from './views/CategoriesView';
import { AuditLogsView } from './views/AuditLogsView';
import { LiveMapView } from './views/LiveMapView';
import { AdminProfileModal } from './components/AdminProfileModal';

const AdminApp = () => {
  const { admin, loading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAdminProfileOpen, setIsAdminProfileOpen] = useState(false);

  // System Data Stores
  const [dashboardData, setDashboardData] = useState(null);
  const [queueData, setQueueData] = useState(null);
  const [farmers, setFarmers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [providers, setProviders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [commissions, setCommissions] = useState([]);

  // Fetch all core admin datasets
  const fetchAllData = useCallback(async () => {
    if (!admin) return;
    setIsRefreshing(true);
    try {
      const [
        kpiRes,
        queueRes,
        farmersRes,
        agentsRes,
        providersRes,
        bookingsRes,
        payoutsRes,
        txRes,
        servRes,
        catRes,
        auditRes,
        commRes,
      ] = await Promise.all([
        apiFetch('/api/admin/kpis').catch(() => null),
        apiFetch('/api/admin/verification/queue').catch(() => null),
        apiFetch('/api/admin/farmers').catch(() => ({ farmers: [] })),
        apiFetch('/api/admin/agents').catch(() => ({ agents: [] })),
        apiFetch('/api/admin/providers').catch(() => ({ providers: [] })),
        apiFetch('/api/admin/bookings').catch(() => ({ bookings: [] })),
        apiFetch('/api/admin/payouts').catch(() => ({ payouts: [] })),
        apiFetch('/api/admin/transactions').catch(() => ({ transactions: [] })),
        apiFetch('/api/services?all=true').catch(() => ({ services: [] })),
        apiFetch('/api/services/categories').catch(() => ({ categories: [] })),
        apiFetch('/api/admin/audit-logs').catch(() => ({ logs: [] })),
        apiFetch('/api/admin/commissions').catch(() => ({ commissions: [] })),
      ]);

      if (kpiRes) setDashboardData(kpiRes);
      if (queueRes) setQueueData(queueRes);
      if (farmersRes) setFarmers(farmersRes.farmers || []);
      if (agentsRes) setAgents(agentsRes.agents || []);
      if (providersRes) setProviders(providersRes.providers || []);
      if (bookingsRes) setBookings(bookingsRes.bookings || []);
      if (payoutsRes) setPayouts(payoutsRes.payouts || []);
      if (txRes) setTransactions(txRes.transactions || []);
      if (servRes) setServices(servRes.services || []);
      if (catRes) setCategories(catRes.categories || []);
      if (auditRes) setAuditLogs(auditRes.logs || []);
      if (commRes) setCommissions(commRes.commissions || []);
    } catch (err) {
      console.error('Data sync error:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [admin]);

  // Initial load
  useEffect(() => {
    if (admin) {
      fetchAllData();
    }
  }, [admin, fetchAllData]);

  // Socket.IO real-time subscriptions
  useEffect(() => {
    if (!admin) return;

    const socket = io(API_BASE_URL);

    socket.emit('join_role', 'admin');
    if (admin._id) {
      socket.emit('join_user', admin._id);
    }

    socket.on('new_kyc_submission', () => {
      fetchAllData();
    });

    socket.on('new_payout_request', () => {
      fetchAllData();
    });

    socket.on('new_booking_created', () => {
      fetchAllData();
    });

    return () => {
      socket.disconnect();
    };
  }, [admin, fetchAllData]);

  // Actions
  const handleProcessVerification = async (userRole, targetId, action, reason) => {
    setIsProcessing(true);
    try {
      await apiFetch(`/api/admin/verification/${userRole}/${targetId}`, {
        method: 'PUT',
        body: JSON.stringify({ action, reason }),
      });
      await fetchAllData();
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleUserStatus = async (userId, status, reason) => {
    try {
      await apiFetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, reason }),
      });
      await fetchAllData();
    } catch (err) {
      alert(`Status toggle failed: ${err.message}`);
    }
  };

  const handleProcessPayout = async (payoutId, action, utrReference, adminNotes) => {
    setIsProcessing(true);
    try {
      await apiFetch(`/api/admin/payouts/${payoutId}`, {
        method: 'PUT',
        body: JSON.stringify({ action, utrReference, adminNotes }),
      });
      await fetchAllData();
    } catch (err) {
      alert(`Payout processing failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveService = async (serviceId, payload) => {
    setIsProcessing(true);
    try {
      const endpoint = serviceId ? `/api/admin/services/${serviceId}` : '/api/admin/services';
      const method = serviceId ? 'PUT' : 'POST';

      await apiFetch(endpoint, {
        method,
        body: JSON.stringify(payload),
      });
      await fetchAllData();
    } catch (err) {
      alert(`Save service failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveCategory = async (categoryId, payload) => {
    setIsProcessing(true);
    try {
      const endpoint = categoryId ? `/api/admin/categories/${categoryId}` : '/api/admin/categories';
      const method = categoryId ? 'PUT' : 'POST';

      await apiFetch(endpoint, {
        method,
        body: JSON.stringify(payload),
      });
      await fetchAllData();
    } catch (err) {
      alert(`Save category failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    setIsProcessing(true);
    try {
      await apiFetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
      });
      await fetchAllData();
    } catch (err) {
      alert(`Delete category failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service offering?')) return;
    setIsProcessing(true);
    try {
      await apiFetch(`/api/admin/services/${serviceId}`, {
        method: 'DELETE',
      });
      await fetchAllData();
    } catch (err) {
      alert(`Delete service failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReviewServiceApproval = async (serviceId, approvalStatus, rejectionReason) => {
    setIsProcessing(true);
    try {
      await apiFetch(`/api/admin/services/${serviceId}/approval`, {
        method: 'PUT',
        body: JSON.stringify({ approvalStatus, rejectionReason }),
      });
      await fetchAllData();
    } catch (err) {
      alert(`Review service failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--surface)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div className="pulse-beacon" style={{ width: '16px', height: '16px', margin: '0 auto 12px' }}></div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Establishing ProFarmer Admin Link...
          </div>
        </div>
      </div>
    );
  }

  if (!admin) {
    return <LoginView />;
  }

  const getViewTitle = () => {
    switch (currentView) {
      case 'live_map':
        return 'Geospatial Radar & Live Fleet Operations';
      case 'dashboard':
        return 'Operational Command & Radar';
      case 'verification':
        return 'Verification & KYC Queue';
      case 'farmers':
        return 'Grower & Farm Directory';
      case 'agents':
        return 'Field Agent & Coverage Network';
      case 'providers':
        return 'Service Provider Management & Fleets';
      case 'bookings':
        return 'Field Operations Dispatch Cockpit';
      case 'finance':
        return 'Ecosystem Wallets & Payout Engine';
      case 'services':
        return 'Services & Machinery Catalog';
      case 'categories':
        return 'Service Categories & Taxonomy';
      case 'audit':
        return 'Administrative Audit Trail';
      default:
        return 'ProFarmer Console';
    }
  };

  const pendingQueueCount = queueData?.counts?.total || 0;
  const pendingPayoutCount = payouts.filter((p) => p.status === 'pending').length;
  const pendingProvidersCount = providers.filter(
    (p) => p.kycStatus === 'pending' || p.status === 'pending_verification'
  ).length;
  const pendingServicesCount = services.filter((s) => s.approvalStatus === 'pending').length;

  return (
    <div className="app-container">
      <Sidebar
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          setSearchQuery('');
        }}
        pendingQueueCount={pendingQueueCount}
        pendingPayoutCount={pendingPayoutCount}
        pendingProvidersCount={pendingProvidersCount}
        pendingServicesCount={pendingServicesCount}
        onOpenAdminProfile={() => setIsAdminProfileOpen(true)}
      />

      <div className="main-viewport">
        <TopBar
          title={getViewTitle()}
          onRefresh={fetchAllData}
          isRefreshing={isRefreshing}
          searchQuery={searchQuery}
          onSearchChange={['farmers', 'agents', 'providers', 'bookings'].includes(currentView) ? setSearchQuery : null}
          onOpenAdminProfile={() => setIsAdminProfileOpen(true)}
        />

        <main className="page-content">
          {currentView === 'dashboard' && (
            <DashboardView
              data={dashboardData}
              onNavigate={(v) => setCurrentView(v)}
            />
          )}

          {currentView === 'live_map' && (
            <LiveMapView
              bookings={bookings}
              providers={providers}
            />
          )}

          {currentView === 'verification' && (
            <VerificationQueueView
              queueData={queueData}
              onProcessVerification={handleProcessVerification}
              isProcessing={isProcessing}
            />
          )}

          {currentView === 'farmers' && (
            <FarmersView
              farmers={farmers}
              agents={agents}
              bookings={bookings}
              onToggleUserStatus={handleToggleUserStatus}
              onRefreshData={fetchAllData}
            />
          )}

          {currentView === 'agents' && (
            <AgentsView
              agents={agents}
              onToggleUserStatus={handleToggleUserStatus}
              onRefreshData={fetchAllData}
            />
          )}

          {currentView === 'providers' && (
            <ProvidersView
              providers={providers}
              onToggleUserStatus={handleToggleUserStatus}
              onProcessVerification={handleProcessVerification}
              onRefreshData={fetchAllData}
            />
          )}

          {currentView === 'bookings' && (
            <BookingsView
              bookings={bookings}
            />
          )}

          {currentView === 'finance' && (
            <FinanceView
              payouts={payouts}
              transactions={transactions}
              commissions={commissions}
              onProcessPayout={handleProcessPayout}
              isProcessing={isProcessing}
            />
          )}

          {currentView === 'services' && (
            <ServicesView
              services={services}
              categories={categories}
              onSaveService={handleSaveService}
              onDeleteService={handleDeleteService}
              onReviewApproval={handleReviewServiceApproval}
              isProcessing={isProcessing}
            />
          )}

          {currentView === 'categories' && (
            <CategoriesView
              categories={categories}
              services={services}
              onSaveCategory={handleSaveCategory}
              onDeleteCategory={handleDeleteCategory}
              onSaveService={handleSaveService}
              onDeleteService={handleDeleteService}
              isProcessing={isProcessing}
            />
          )}

          {currentView === 'audit' && (
            <AuditLogsView
              logs={auditLogs}
            />
          )}
        </main>
      </div>

      <AdminProfileModal
        isOpen={isAdminProfileOpen}
        onClose={() => setIsAdminProfileOpen(false)}
        onProfileUpdated={fetchAllData}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AdminApp />
    </AuthProvider>
  );
}
