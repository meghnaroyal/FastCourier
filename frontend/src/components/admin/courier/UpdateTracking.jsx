import React, { useState } from 'react';
import { 
  X, MapPin, AlertCircle, Package,
  Truck, Clock, CheckCircle
} from 'lucide-react';
import { useCourier } from '../../../hooks/useCourier';
import toast from 'react-hot-toast';

const UpdateTracking = ({ courier, onClose, onUpdate }) => {
  const { updateTracking } = useCourier();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    status: courier.status || 'Pending',
    location: '',
    description: ''
  });

  const statusOptions = [
    { value: 'Pending', icon: Clock },
    { value: 'Picked Up', icon: Package },
    { value: 'In Transit', icon: Truck },
    { value: 'Out for Delivery', icon: Truck },
    { value: 'Delivered', icon: CheckCircle },
    { value: 'Failed', icon: AlertCircle },
    { value: 'Returned', icon: Package }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.location.trim() || !formData.description.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await updateTracking(courier.c_id, {
        status: formData.status,
        location: formData.location.trim(),
        description: formData.description.trim()
      });

      toast.success('Tracking updated successfully');
      onUpdate();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Update Tracking Status
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Tracking #: {courier.billno}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                From: {courier.sname} To: {courier.rname}
              </p>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              courier.status === 'Delivered' ? 'bg-green-100 text-green-800' :
              courier.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {courier.status}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 p-4 rounded-md flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status*
            </label>
            <div className="grid grid-cols-2 gap-3">
              {statusOptions.map(({ value, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: value }))}
                  className={`flex items-center gap-2 p-3 rounded-lg border ${
                    formData.status === value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Location*
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter current location"
                required
              />
              <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Description*
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows="3"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter status update details"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateTracking;