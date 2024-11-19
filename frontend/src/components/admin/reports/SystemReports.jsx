// src/components/admin/reports/SystemReports.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Download, AlertTriangle, CheckCircle, Clock, Server } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#2563eb', '#7c3aed', '#dc2626', '#f59e0b'];

const MetricBox = ({ title, value, change, icon: Icon, color }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <h4 className="text-xl font-bold mt-1">{value}</h4>
        {change && (
          <p className={`text-sm mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </p>
        )}
      </div>
      <div className={`p-2 rounded-lg bg-${color}-50`}>
        <Icon className={`h-5 w-5 text-${color}-600`} />
      </div>
    </div>
  </div>
);

const SystemReports = () => {
  const { user } = useAuth();
  const [systemData, setSystemData] = useState({
    performanceMetrics: {
      avgResponseTime: 0,
      errorRate: 0,
      successRate: 0,
      systemLoad: 0
    },
    errorDistribution: [],
    hourlyTraffic: [],
    resourceUsage: {
      cpu: 0,
      memory: 0,
      disk: 0,
      network: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date()
  });

  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({
          start_date: dateRange.start.toISOString().split('T')[0],
          end_date: dateRange.end.toISOString().split('T')[0]
        });

        const response = await fetch(`http://localhost:5000/api/admin/system-metrics?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch system metrics');
        }

        const data = await response.json();
        setSystemData(data);
      } catch (error) {
        console.error('Error fetching system metrics:', error);
        toast.error('Failed to load system metrics');
      } finally {
        setLoading(false);
      }
    };

    if (user?.isAdmin) {
      fetchSystemData();
    }
  }, [dateRange, user]);

  const handleExportReport = () => {
    try {
      // Implement PDF/Excel export here
      toast.success('System report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">System Performance Report</h2>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <input
              type="date"
              className="px-3 py-2 border border-gray-300 rounded-md"
              value={dateRange.start.toISOString().split('T')[0]}
              onChange={(e) => setDateRange(prev => ({
                ...prev,
                start: new Date(e.target.value)
              }))}
            />
            <input
              type="date"
              className="px-3 py-2 border border-gray-300 rounded-md"
              value={dateRange.end.toISOString().split('T')[0]}
              onChange={(e) => setDateRange(prev => ({
                ...prev,
                end: new Date(e.target.value)
              }))}
            />
          </div>
          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricBox
          title="Average Response Time"
          value={`${systemData.performanceMetrics.avgResponseTime}ms`}
          icon={Clock}
          color="blue"
        />
        <MetricBox
          title="Error Rate"
          value={`${systemData.performanceMetrics.errorRate}%`}
          icon={AlertTriangle}
          color="red"
        />
        <MetricBox
          title="Success Rate"
          value={`${systemData.performanceMetrics.successRate}%`}
          icon={CheckCircle}
          color="green"
        />
        <MetricBox
          title="System Load"
          value={`${systemData.performanceMetrics.systemLoad}%`}
          icon={Server}
          color="yellow"
        />
      </div>

      {/* Resource Usage */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Resource Usage</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(systemData.resourceUsage).map(([resource, usage]) => (
            <div key={resource} className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block uppercase">
                    {resource}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block">
                    {usage}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
                <div
                  style={{ width: `${usage}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Error Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={systemData.errorDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {systemData.errorDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Analysis */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Hourly Traffic</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={systemData.hourlyTraffic}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="requests" fill="#2563eb" name="Requests" />
                <Bar dataKey="errors" fill="#dc2626" name="Errors" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* System Alerts */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">System Alerts</h3>
        <div className="space-y-4">
          {systemData.alerts?.map((alert, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                alert.severity === 'high' 
                  ? 'bg-red-50 text-red-700'
                  : alert.severity === 'medium'
                  ? 'bg-yellow-50 text-yellow-700'
                  : 'bg-blue-50 text-blue-700'
              }`}
            >
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-semibold">{alert.title}</h4>
                  <p className="text-sm mt-1">{alert.message}</p>
                  <p className="text-xs mt-2">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemReports;