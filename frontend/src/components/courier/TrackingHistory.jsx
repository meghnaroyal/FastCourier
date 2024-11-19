import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Package, Truck, MapPin, Clock,
  CheckCircle, AlertCircle, Map,
  ArrowRight, Calendar, AlertTriangle
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const TrackingHistory = () => {
  const { id: trackingNumber } = useParams();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTrackingDetails();
  }, [trackingNumber]);

  const fetchTrackingDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/courier/track/${trackingNumber}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch tracking details');
      }

      const data = await response.json();
      setShipment(data);
    } catch (err) {
      console.error('Tracking error:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
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

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatPrice = (price) => {
    try {
      return Number(price).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR'
      });
    } catch (error) {
      return `₹${price}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full bg-white rounded-lg shadow-sm p-6">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Tracking Failed</h3>
          <p className="mt-1 text-sm text-gray-500">
            {error || 'No shipment found with this tracking number'}
          </p>
          <div className="mt-4">
            <Link
              to="/tracking"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Try Another Number
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Shipment Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Tracking Details
            </h1>
            <p className="mt-1 text-gray-500">
              Tracking Number: {shipment.billno}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(shipment.status)}`}>
            {shipment.status}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Expected Delivery */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Expected Delivery
                </p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {formatDate(shipment.expected_delivery).split(',')[0]}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          {/* Package Weight & Price */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Package Details
                </p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {shipment.weight} kg • {formatPrice(shipment.price)}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Sender & Receiver Info */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sender */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-400" />
              From
            </h2>
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-gray-900">{shipment.sname}</p>
              <p className="text-sm text-gray-500">{shipment.saddress}</p>
              <p className="text-sm text-gray-500">{shipment.sphone}</p>
              <p className="text-sm text-gray-500">{shipment.semail}</p>
            </div>
          </div>

          {/* Receiver */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-400" />
              To
            </h2>
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-gray-900">{shipment.rname}</p>
              <p className="text-sm text-gray-500">{shipment.raddress}</p>
              <p className="text-sm text-gray-500">{shipment.rphone}</p>
              <p className="text-sm text-gray-500">{shipment.remail}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tracking Timeline */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">
          Tracking History
        </h2>
        
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute top-0 left-8 bottom-0 w-0.5 bg-gray-200"></div>

          {/* Timeline events */}
          <div className="space-y-8">
            {Array.isArray(shipment.tracking_history) && shipment.tracking_history.map((event, index) => (
              <div key={event.id || index} className="relative flex items-start">
                <div className={`absolute left-8 -ml-3 h-6 w-6 flex items-center justify-center rounded-full ${
                  index === 0 ? 'bg-blue-500' : 'bg-gray-300'
                }`}>
                  {index === 0 ? (
                    <CheckCircle className="h-4 w-4 text-white" />
                  ) : (
                    <div className="h-2 w-2 bg-white rounded-full" />
                  )}
                </div>

                <div className="ml-12">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {event.status}
                      </p>
                      {event.location && (
                        <p className="mt-1 text-sm text-gray-500 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {event.location}
                        </p>
                      )}
                    </div>
                    <p className="mt-1 sm:mt-0 text-sm text-gray-500">
                      {formatDate(event.created_at)}
                    </p>
                  </div>
                  {event.description && (
                    <p className="mt-2 text-sm text-gray-500">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {(!shipment.tracking_history || shipment.tracking_history.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">
                No tracking updates available
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingHistory;