// src/components/admin/reports/RevenueReport.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, IndianRupee, 
  Package, AlertCircle, DollarSign 
} from 'lucide-react';

const StatCard = ({ title, value, previousValue, icon: Icon }) => {
  const growth = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;
  const isPositive = growth >= 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {previousValue && (
            <div className="flex items-center mt-2">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(growth).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
      </div>
    </div>
  );
};

const RevenueReport = ({ dateRange }) => {
  const [data, setData] = useState({
    monthly: [],
    summary: {},
    previousSummary: {},
    paymentStats: {},
    zoneStats: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('revenue'); // revenue, deliveries, average

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        const response = await axios.get('http://localhost:5000/api/admin/revenue-report', {
          headers: { 'Authorization': `Bearer ${token}` },
          params: dateRange
        });
        setData(response.data);
      } catch (error) {
        console.error('Error fetching revenue:', error);
        setError('Failed to load revenue data');
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <span className="text-red-700">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Revenue Report</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setView('revenue')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              view === 'revenue' 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => setView('deliveries')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              view === 'deliveries' 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Deliveries
          </button>
          <button
            onClick={() => setView('average')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              view === 'average' 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Average Price
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`₹${data.summary.total_revenue?.toLocaleString()}`}
          previousValue={data.previousSummary.total_revenue}
          icon={IndianRupee}
        />
        <StatCard
          title="Total Deliveries"
          value={data.summary.total_deliveries}
          previousValue={data.previousSummary.total_deliveries}
          icon={Package}
        />
        <StatCard
          title="Average Price"
          value={`₹${Math.round(data.summary.avg_price || 0)}`}
          previousValue={data.previousSummary.avg_price}
          icon={DollarSign}
        />
        <StatCard
          title="Success Rate"
          value={`${((data.summary.successful_deliveries / data.summary.total_deliveries) * 100).toFixed(1)}%`}
          previousValue={(data.previousSummary.successful_deliveries / data.previousSummary.total_deliveries) * 100}
          icon={TrendingUp}
        />
      </div>

      {/* Main Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            {view === 'revenue' ? (
              <BarChart data={data.monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                />
                <Legend />
                <Bar dataKey="total_revenue" fill="#3b82f6" name="Revenue" />
              </BarChart>
            ) : view === 'deliveries' ? (
              <LineChart data={data.monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="total_deliveries" 
                  stroke="#3b82f6" 
                  name="Total Deliveries" 
                />
                <Line 
                  type="monotone" 
                  dataKey="successful_deliveries" 
                  stroke="#10b981" 
                  name="Successful Deliveries" 
                />
              </LineChart>
            ) : (
              <LineChart data={data.monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value.toFixed(2)}`, 'Avg Price']}/>
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="avg_price" 
                  stroke="#8b5cf6" 
                  name="Average Price" 
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payment Method Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-md font-medium text-gray-900 mb-4">Payment Methods</h3>
          <div className="space-y-4">
            {Object.entries(data.paymentStats).map(([method, stats]) => (
              <div key={method} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{method}</p>
                  <p className="text-sm text-gray-500">
                    {((stats.count / data.summary.total_deliveries) * 100).toFixed(1)}% of total
                  </p>
                </div>
                <p className="font-semibold">₹{stats.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Zone-wise Revenue */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-md font-medium text-gray-900 mb-4">Zone-wise Revenue</h3>
          <div className="space-y-4">
            {data.zoneStats.map((zone) => (
              <div key={zone.zone} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{zone.zone}</p>
                  <p className="text-sm text-gray-500">
                    {zone.delivery_count} deliveries
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{zone.total_revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">
                    Avg: ₹{Math.round(zone.avg_price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Monthly Data */}
      <div className="bg-white p-6 rounded-lg shadow-sm overflow-x-auto">
        <h3 className="text-md font-medium text-gray-900 mb-4">Monthly Breakdown</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Month
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deliveries
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Success Rate
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.monthly.map((month) => (
              <tr key={month.month}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {month.month}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{month.total_revenue.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {month.total_deliveries}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{Math.round(month.avg_price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {((month.successful_deliveries / month.total_deliveries) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RevenueReport;