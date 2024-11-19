// src/components/courier/CourierDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Package, User, Mail, Phone, MapPin, Calendar, 
  Clock, DollarSign, Truck, AlertCircle 
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import TrackingHistory from './TrackingHistory';

const CourierDetails = () => {
  const { id } = useParams();
  const [courier, setCourier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourierDetails();
  }, [id]);

  const fetchCourierDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/courier/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setCourier(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Picked Up': 'bg-blue-100 text-blue-800',
      'In Transit': 'bg-purple-100 text-purple-800',
      'Out for Delivery': 'bg-indigo-100 text-indigo-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Failed': 'bg-red-100 text-red-800',
      'Returned': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Error Loading Shipment</h3>
          <p className="mt-1 text-gray-500">{error}</p>
          <Link
            to="/couriers"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Shipments
          </Link>
        </div>
      </div>
    );
  }

  if (!courier) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-6 w-6 text-blue-600" />
            Shipment Details
          </h1>
          <p className="mt-1 text-gray-500">Tracking Number: {courier.billno}</p>
        </div>
        
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(courier.status)}`}>
          {courier.status}
        </span>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipment Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Package Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Package Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Weight</p>
                <p className="font-medium">{courier.weight} kg</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Price</p>
                <p className="font-medium">₹{courier.price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created Date</p>
                <p className="font-medium">
                  {new Date(courier.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Expected Delivery</p>
                <p className="font-medium">
                  {courier.expected_delivery ? new Date(courier.expected_delivery).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            {courier.image && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Package Image</p>
                <img
                  src={`http://localhost:5000/uploads/${courier.image}`}
                  alt="Package"
                  className="w-full max-w-xs rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Sender and Receiver Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sender */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Sender Information</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{courier.sname}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{courier.semail}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{courier.sphone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{courier.saddress}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Receiver */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Receiver Information</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{courier.rname}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{courier.remail}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{courier.rphone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{courier.raddress}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tracking History */}
        <div className="lg:col-span-1">
          <TrackingHistory courierId={courier.c_id} />
        </div>
      </div>
    </div>
  );
};

export default CourierDetails;