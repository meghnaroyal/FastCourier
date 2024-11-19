import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const TrackShipment = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!trackingNumber.trim()) {
      toast.error('Please enter a tracking number');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/courier/track/${trackingNumber}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Tracking number not found');
      }

      navigate(`/tracking/${trackingNumber}`);
    } catch (error) {
      console.error('Track shipment error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Package className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Track Your Shipment</h2>
            <p className="text-sm text-gray-500">Enter your tracking number to get real-time updates</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="tracking-number" className="sr-only">
              Tracking Number
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="text"
                id="tracking-number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter tracking number"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Tracking...
              </>
            ) : (
              'Track Shipment'
            )}
          </button>
        </form>

        <div className="mt-8">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Track using:</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400">
              <div className="flex-shrink-0">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Tracking Number</p>
                <p className="text-sm text-gray-500">Use your shipment tracking number</p>
              </div>
            </div>

            <div className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Reference Number</p>
                <p className="text-sm text-gray-500">Use order or reference number</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackShipment;