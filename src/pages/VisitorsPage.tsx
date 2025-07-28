import React from 'react';
import { VisitorsList } from '@/components/visitors/VisitorsList';
import { AppLayout } from '@/components/layout/AppLayout';

const VisitorsPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <VisitorsList />
      </div>
    </AppLayout>
  );
};

export default VisitorsPage; 