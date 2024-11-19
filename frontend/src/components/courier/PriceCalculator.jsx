import React, { useState } from 'react';
import { Calculator, AlertCircle, Package, IndianRupee, Clock, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

const PriceCalculator = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    weight: '',
    zone: 'default'
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const deliveryTimes = {
    default: '3-5 business days',
    express: '1-2 business days',
    international: '7-14 business days'
  };

  // Define zone multipliers for different delivery types
  const zoneMultipliers = {
    default: 1,    // Standard delivery (base price)
    express: 1.5,  // 50% more than standard
    international: 2.5  // 150% more than standard
  };

  // Define zone descriptions
  const zoneDescriptions = {
    default: 'Standard domestic shipping with regular handling',
    express: 'Priority handling and faster domestic shipping',
    international: 'International shipping with customs handling'
  };

  const validateInput = () => {
    const weight = parseFloat(formData.weight);
    if (!weight || weight <= 0) {
      setError('Please enter a valid weight');
      toast.error('Please enter a valid weight');
      return false;
    }
    if (weight > 50) {
      setError('Maximum weight allowed is 50 kg');
      toast.error('Maximum weight allowed is 50 kg');
      return false;
    }
    return true;
  };

  const calculatePrice = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to calculate prices');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (!validateInput()) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/calculate-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          weight: parseFloat(formData.weight),
          zone: formData.zone
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login', { state: { from: location.pathname } });
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(data.message || 'Failed to calculate price');
      }

      // Calculate prices for all zones
      const basePrice = data.price;
      const prices = {
        default: basePrice,
        express: basePrice * zoneMultipliers.express,
        international: basePrice * zoneMultipliers.international
      };

      setResult({
        prices,
        selectedZone: formData.zone,
        estimatedDays: deliveryTimes[formData.zone],
        weight: formData.weight,
        zone: formData.zone
      });

      toast.success('Price calculated successfully');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculatePrice();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <Calculator className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Shipping Price Calculator</h2>
            <p className="text-sm text-gray-500">Get instant shipping cost estimates</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Weight Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Package Weight
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                step="0.01"
                min="0.01"
                max="50"
                className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Package className="h-5 w-5 text-gray-400" />
              </div>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">kg</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">Maximum weight: 20 kg</p>
          </div>

          {/* Zone Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Delivery Type
            </label>
            <select
              value={formData.zone}
              onChange={(e) => setFormData({...formData, zone: e.target.value})}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg"
            >
              <option value="default">Standard Delivery</option>
              <option value="express">Express Delivery</option>
              <option value="international">International Shipping</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {zoneDescriptions[formData.zone]}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Estimated delivery: {deliveryTimes[formData.zone]}
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Calculating...
              </>
            ) : (
              <>
                <Calculator className="h-5 w-5 mr-2" />
                Calculate Price
              </>
            )}
          </button>
        </form>

        {/* Result Section */}
        {result && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Price Estimates</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Standard Delivery Card */}
              <div className={`rounded-lg p-4 ${formData.zone === 'default' ? 'bg-green-50 ring-2 ring-green-500' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Standard Delivery</h4>
                  {formData.zone === 'default' && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Selected</span>
                  )}
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(result.prices.default)}</p>
                <p className="text-sm text-gray-600 mt-1">{deliveryTimes.default}</p>
              </div>

              {/* Express Delivery Card */}
              <div className={`rounded-lg p-4 ${formData.zone === 'express' ? 'bg-green-50 ring-2 ring-green-500' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Express Delivery</h4>
                  {formData.zone === 'express' && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Selected</span>
                  )}
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(result.prices.express)}</p>
                <p className="text-sm text-gray-600 mt-1">{deliveryTimes.express}</p>
              </div>

              {/* International Delivery Card */}
              <div className={`rounded-lg p-4 ${formData.zone === 'international' ? 'bg-green-50 ring-2 ring-green-500' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">International</h4>
                  {formData.zone === 'international' && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Selected</span>
                  )}
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(result.prices.international)}</p>
                <p className="text-sm text-gray-600 mt-1">{deliveryTimes.international}</p>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Shipping Details:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Package Weight: {result.weight} kg</li>
                    <li>Base Price: {formatPrice(result.prices.default)}</li>
                    <li>Express Delivery: +50% of base price</li>
                    <li>International Shipping: +150% of base price</li>
                    <li>Additional fees may apply for remote areas</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceCalculator;