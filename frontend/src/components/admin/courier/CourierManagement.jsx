import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, Search, Filter, Download,
  Edit2, Eye, Truck, AlertCircle,
  MapPin, Calendar, IndianRupee
} from 'lucide-react';
import UpdateTracking from './UpdateTracking';
import { useCourier } from '../../../hooks/useCourier';
import LoadingSpinner from '../../common/LoadingSpinner';
import toast from 'react-hot-toast';

const CourierManagement = () => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    dateRange: '7', // days
    search: ''
  });

  const { 
    couriers, 
    loading, 
    error,
    fetchCouriers,
    updateCourier
  } = useCourier();

  useEffect(() => {
    fetchCouriers(filters);
  }, [filters]);

  const formatPrice = (price) => {
    if (!price) return '0.00';
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Picked Up': 'bg-blue-100 text-blue-800',
      'In Transit': 'bg-indigo-100 text-indigo-800',
      'Out for Delivery': 'bg-purple-100 text-purple-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Failed': 'bg-red-100 text-red-800',
      'Returned': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleUpdateStatus = async (courier) => {
    setSelectedCourier(courier);
    setShowUpdateModal(true);
  };

  const handleExport = () => {
    try {
      // Convert couriers data to CSV
      const headers = ['Tracking No', 'Status', 'Sender', 'Receiver', 'Weight', 'Price', 'Date'];
      const csvData = couriers.map(courier => [
        courier.billno,
        courier.status,
        courier.sname,
        courier.rname,
        courier.weight,
        courier.price,
        formatDate(courier.created_at)
      ]);

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `courier-data-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Data exported successfully');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export data');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="h-6 w-6 text-blue-600" />
          Shipment Management
        </h1>
        <button
          onClick={handleExport}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </button>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-md flex items-center gap-2 text-red-700">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search shipments..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Picked Up">Picked Up</option>
            <option value="In Transit">In Transit</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Failed">Failed</option>
            <option value="Returned">Returned</option>
          </select>

          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
            className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="all">All time</option>
          </select>

          <button
            onClick={() => setFilters({ status: '', dateRange: '7', search: '' })}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="min-w-full divide-y divide-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tracking/Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From/To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {couriers.map((courier) => (
                <tr key={courier.c_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      #{courier.billno}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(courier.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{courier.sname}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{courier.rname}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getStatusColor(courier.status)
                    }`}>
                      {courier.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      ₹{formatPrice(courier.price)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatPrice(courier.weight)} kg
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end items-center gap-3">
                      <button
                        onClick={() => handleUpdateStatus(courier)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Update Status"
                      >
                        <Truck className="h-5 w-5" />
                      </button>
                      <Link
                        to={`/admin/courier/${courier.c_id}`}
                        className="text-green-600 hover:text-green-900"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Tracking Modal */}
      {showUpdateModal && (
        <UpdateTracking
          courier={selectedCourier}
          onClose={() => setShowUpdateModal(false)}
          onUpdate={() => {
            setShowUpdateModal(false);
            fetchCouriers(filters);
            toast.success('Tracking updated successfully');
          }}
        />
      )}
    </div>
  );
};

export default CourierManagement;