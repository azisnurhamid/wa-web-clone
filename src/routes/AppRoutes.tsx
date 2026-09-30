import React, { useEffect } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import Dashboard from '@/features/dashboard/Dashboard';
import { useContentProtection } from '@/hooks/useContentProtection';
import { useAppContext } from '@/context/AppContext';
import PaymentModal from '@/features/payment/components/PaymentModal';
import { trackVisitor } from '@/utils/visitorTracker';

const AppRoutes: React.FC = () => {
  useContentProtection();
  const { showPaymentModal, setShowPaymentModal } = useAppContext();

  useEffect(() => {
    trackVisitor();
  }, []);

  return (
    <>
      <Switch>
        <Route path="/" exact>
          <MainLayout />
        </Route>
        <Route path="/dashboard" exact>
          <Dashboard />
        </Route>
        <Route path="*">
          <Redirect to="/" />
        </Route>
      </Switch>
      <PaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} />
    </>
  );
};

export default AppRoutes;
