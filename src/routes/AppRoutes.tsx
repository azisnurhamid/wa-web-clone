import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import Dashboard from '@/features/dashboard/Dashboard';
import { useContentProtection } from '@/hooks/useContentProtection';

const AppRoutes: React.FC = () => {
  useContentProtection();

  return (
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
  );
};

export default AppRoutes;
