import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, Plus, Edit2, Trash2, AlertCircle
} from 'lucide-react';
import { usePricing } from '../../../hooks/usePricing';
import toast from 'react-hot-toast';

const PricingManagement = () => {
  const { 
    pricingRules, 
    loading, 
    error, 
    fetchPricingRules, 
    addPricingRule,
    updatePricingRule,
    deletePricingRule 
  } = usePricing();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    weight_from: '',
    weight_to: '',
    price_per_kg: '',
    zone: 'default'
  });

  useEffect(() => {
    fetchPricingRules();
  }, [fetchPricingRules]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const success = await updatePricingRule(editingId, formData);
        if (success) {
          setEditingId(null);
          setShowAddForm(false);
        }
      } else {
        const success = await addPricingRule(formData);
        if (success) {
          setShowAddForm(false);
        }
      }
      setFormData({
        weight_from: '',
        weight_to: '',
        price_per_kg: '',
        zone: 'default'
      });
    } catch (err) {
      console.error('Form submission error:', err);
    }
  };
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    console.log('Admin token:', adminToken);
  }, []);

  const handleEdit = (rule) => {
    setFormData({
      weight_from: rule.weight_from,
      weight_to: rule.weight_to,
      price_per_kg: rule.price_per_kg,
      zone: rule.zone
    });
    setEditingId(rule.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this pricing rule?')) {
      await deletePricingRule(id);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="mt-4 grid grid-cols-4 gap-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <IndianRupee className="h-6 w-6 text-blue-600" />
          Pricing Management
        </h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Rule
        </button>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-md flex items-center gap-2 text-red-700">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {editingId ? 'Edit Pricing Rule' : 'Add New Pricing Rule'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Weight From (kg)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.weight_from}
                onChange={(e) => setFormData({...formData, weight_from: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Weight To (kg)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.weight_to}
                onChange={(e) => setFormData({...formData, weight_to: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Price per kg (₹)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price_per_kg}
                onChange={(e) => setFormData({...formData, price_per_kg: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Zone
              </label>
              <select
                value={formData.zone}
                onChange={(e) => setFormData({...formData, zone: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="default">Default</option>
                <option value="express">Express</option>
                <option value="international">International</option>
              </select>
            </div>

            <div className="col-span-full flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                {editingId ? 'Update Rule' : 'Add Rule'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Weight Range
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price per kg
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Zone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pricingRules.map((rule) => (
              <tr key={rule.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {rule.weight_from} - {rule.weight_to} kg
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ₹{rule.price_per_kg}
                </td>
                <td className="px-6 py-4 whitespace-nowrap capitalize">
                  {rule.zone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(rule)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {pricingRules.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No pricing rules found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PricingManagement;