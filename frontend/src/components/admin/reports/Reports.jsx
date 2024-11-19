// src/components/admin/reports/Reports.jsx

import React, { useState } from 'react';
import ActivityLogs from './ActivityLogs';
import PerformanceMetrics from './PerformanceMetrics';
import SystemReports from './SystemReports';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('performance');

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">Detailed analysis of system performance and activities</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('performance')}
            className={`${
              activeTab === 'performance'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Performance Metrics
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`${
              activeTab === 'system'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            System Reports
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`${
              activeTab === 'logs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Activity Logs
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'performance' && <PerformanceMetrics />}
        {activeTab === 'system' && <SystemReports />}
        {activeTab === 'logs' && <ActivityLogs />}
      </div>
    </div>
  );
};

export default Reports;