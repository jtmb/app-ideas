import React from 'react';
import { TestItemsList } from '../components/TestItemsList';

export const TestItemsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Items</h1>
        <p className="text-gray-600 mb-6">Manage and view all test items in the system.</p>
        <TestItemsList />
      </div>
    </div>
  );
};

export default TestItemsPage;
