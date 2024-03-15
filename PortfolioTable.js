import React from 'react';
import { FaTrash } from 'react-icons/fa';
import { motion } from 'framer-motion'; // Import motion for animations

function PortfolioTable({ stocks, onStockRemove }) {
  const totalValue = stocks.reduce((total, stock) => total + (stock.price * stock.quantity), 0).toFixed(2);

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Portfolio</h1>
      <div className="overflow-x-auto">
        <table className="table-auto w-full">
          <thead className="sticky top-0 bg-gray-200">
            <tr>
              <th className="px-4 py-2">Stock Name</th>
              <th className="px-4 py-2">Quantity</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock, index) => (
              <motion.tr 
                key={index} 
                initial={{ opacity: 0, y: 20 }} // Initial animation properties
                animate={{ opacity: 1, y: 0 }} // Animation properties when component mounts
                transition={{ duration: 0.3, delay: index * 0.1 }} // Transition duration and delay
                className="border-b border-gray-200 hover:bg-gray-100"
              >
                <td className="px-4 py-2">{stock.stockName}</td>
                <td className="px-4 py-2">{stock.quantity}</td>
                <td className="px-4 py-2">{stock.price.toFixed(2)}</td>
                <td className="px-4 py-2">{(stock.price * stock.quantity).toFixed(2)}</td>
                <td className="px-4 py-2">
                  <button 
                    className="text-red-600 hover:text-red-800" 
                    onClick={() => onStockRemove(index)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="5" className="text-center py-4 font-bold">Total Portfolio Value: ₹{totalValue}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default PortfolioTable;
