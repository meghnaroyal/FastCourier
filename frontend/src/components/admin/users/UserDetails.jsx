// src/components/admin/users/UserDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, Calendar, Package,
  Clock, TrendingUp, AlertCircle, Check, X, Ban
} from 'lucide-react';
import LoadingSpinner from '../../common/LoadingSpinner';

const UserDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      const [userResponse, shipmentsResponse] = await Promise.all([
        fetch(`http://localhost:5000/api/admin/users/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }),
        fetch(`http://localhost:5000/api/admin/users/${id}/shipments`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        })
      ]);

      const userData = await userResponse.json();
      const shipmentsData = await shipmentsResponse.json();

      if (!userResponse.ok) throw new Error(userData.message);
      if (!shipmentsResponse.ok) throw new Error(shipmentsData.message);

      setUser(userData);
      setShipments(shipmentsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/user/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setUser({ ...user, status: newStatus });
      setShowStatusConfirm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-yellow-100 text-yellow-800',
      'blocked': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
        <Link
          to="/admin/users"
          className="text-blue-600 hover:text-blue-800"
        >
          Back to Users
        </Link>
      </div>

      {/* User Profile */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {user.profile_image ? (
              <img
                src={`http://localhost:5000/uploads/${user.profile_image}`}
                alt={user.name}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-10 w-10 text-gray-400" />
              </div>
            )}
          </div>

          <div className="ml-6 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                  {user.status}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setNewStatus('active');
                    setShowStatusConfirm(true);
                  }}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                  disabled={user.status === 'active'}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Activate
                </button>

                <button
                  onClick={() => {
                    setNewStatus('blocked');
                    setShowStatusConfirm(true);
                  }}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                  disabled={user.status === 'blocked'}
                >
                  <Ban className="h-4 w-4 mr-1" />
                  Block
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-900">{user.email}</span>
              </div>

              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-900">{user.pnumber}</span>
              </div>

              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-900">{user.address}</span>
              </div>

              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-900">
                  Joined {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Total Shipments</h3>
            <Package className="h-5 w-5 text-blue-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">{shipments.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Last Active</h3>
            <Clock className="h-5 w-5 text-green-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Success Rate</h3>
            <TrendingUp className="h-5 w-5 text-purple-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {shipments.length > 0 
              ? `${((shipments.filter(s => s.status === 'Delivered').length / shipments.length) * 100).toFixed(1)}%`
              : 'N/A'
            }
          </p>
        </div>
      </div>

      {/* Recent Shipments */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Recent Shipments</h3>
        </div>
        {shipments.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {shipments.slice(0, 5).map((shipment) => (
              <div key={shipment.c_id} className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Tracking No: {shipment.billno}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(shipment.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    getStatusColor(shipment.status)
                  }`}>
                    {shipment.status}
                  </span>
                  <Link
                    to={`/admin/courier/${shipment.c_id}`}
                    className="ml-4 text-blue-600 hover:text-blue-800"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            No shipments found
          </div>
        )}
      </div>

      {/* Status Change Confirmation Modal */}
      {showStatusConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Status Change
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to change the user's status to {newStatus}?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowStatusConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusChange}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetails;