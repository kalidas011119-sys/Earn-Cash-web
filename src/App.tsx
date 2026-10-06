/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { UserApp } from './components/user/UserApp';
import { AdminApp } from './components/admin/AdminApp';

const AppContent: React.FC = () => {
  const { activePanel } = useApp();

  return activePanel === 'admin' ? <AdminApp /> : <UserApp />;
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
