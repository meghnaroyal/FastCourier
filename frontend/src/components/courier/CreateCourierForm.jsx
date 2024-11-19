import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, User, Phone, MapPin, Mail, Scale } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateCourierForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  
  const [formData, setFormData] = useState({
    sname: '',
    semail: '',
    sphone: '',
    saddress: '',
    rname: '',
    remail: '',
    rphone: '',
    raddress: '',
    weight: '',
    image: null
  });

  // Handle input changes
  const handleChange = async (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

      // Calculate price when weight changes
      if (name === 'weight' && value > 0) {
        try {
          const response = await fetch('http://localhost:5000/api/calculate-price', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ weight: value })
          });

          const data = await response.json();
          if (response.ok) {
            setEstimatedPrice(data.price);
          }
        } catch (error) {
          console.error('Price calculation error:', error);
        }
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to create shipment');
        navigate('/login');
        return;
      }

      // Create FormData instance
      const sendData = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          sendData.append(key, formData[key]);
        }
      });

      // Make API request
      const response = await fetch('http://localhost:5000/api/courier', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: sendData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create shipment');
      }

      toast.success('Shipment created successfully!');
      navigate('/couriers');

    } catch (error) {
      console.error('Shipment creation error:', error);
      toast.error(error.message || 'Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Shipment</h1>
        {estimatedPrice && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <span className="text-sm text-blue-600 font-medium">Estimated Price:</span>
            <span className="ml-2 text-lg font-bold text-blue-700">
              ₹{estimatedPrice}
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Sender Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sender Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  name="sname"
                  value={formData.sname}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1 relative">
                <input
                  type="email"
                  name="semail"
                  value={formData.semail}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <div className="mt-1 relative">
                <input
                  type="tel"
                  name="sphone"
                  value={formData.sphone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  name="saddress"
                  value={formData.saddress}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Receiver Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Receiver Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  name="rname"
                  value={formData.rname}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1 relative">
                <input
                  type="email"
                  name="remail"
                  value={formData.remail}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <div className="mt-1 relative">
                <input
                  type="tel"
                  name="rphone"
                  value={formData.rphone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  name="raddress"
                  value={formData.raddress}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Package Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Package Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Weight (less than 20kg)</label>
              <div className="mt-1 relative">
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0.01"
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <Scale className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Package Image</label>
              <input
                type="file"
                name="image"
                onChange={handleChange}
                accept="image/*"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              loading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Shipment...
              </span>
            ) : (
              'Create Shipment'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCourierForm;