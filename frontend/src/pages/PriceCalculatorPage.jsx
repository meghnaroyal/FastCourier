import React from 'react';
import PriceCalculator from '../components/courier/PriceCalculator';

const PriceCalculatorPage = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shipping Rate Calculator</h1>
        <p className="text-sm text-gray-500">Calculate shipping costs for your packages</p>
      </div>
      <PriceCalculator />
    </div>
  );
};

export default PriceCalculatorPage;