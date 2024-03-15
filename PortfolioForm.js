import React, { useState } from 'react';

function PortfolioForm({ onStockAdd }) {
  const [stockName, setStockName] = useState('');
  const [quantity, setQuantity] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://127.0.0.1:5000/stock_price?stock_name=${stockName}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stock price');
      }
      const data = await response.json();
      const price = data.price;
      onStockAdd({ stockName, quantity, price });
      setStockName('');
      setQuantity('');
    } catch (error) {
      console.error('Error adding stock to portfolio:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Add Stock to Portfolio</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={stockName}
          onChange={(e) => setStockName(e.target.value)}
          placeholder="Enter stock name"
          className="border border-gray-300 p-2 rounded-md w-full"
        />
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Enter quantity"
          className="border border-gray-300 p-2 rounded-md w-full"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Add
        </button>
      </form>
    </div>
  );
}

export default PortfolioForm;
