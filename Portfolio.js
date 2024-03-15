import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PortfolioForm from './PortfolioForm';
import PortfolioTable from './PortfolioTable';

function Portfolio() {
  const [portfolio, setPortfolio] = useState([]);

  const handleStockAdd = (newStock) => {
    setPortfolio([...portfolio, newStock]);
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">Stock Predictor</Link>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link" to="/predictor">Stock Predictor</Link>
              </li>
              <li className="nav-item">
                <span className="nav-link">Portfolio</span>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <h1>Portfolio</h1>
      <PortfolioForm onStockAdd={handleStockAdd} />
      <PortfolioTable stocks={portfolio} />
    </div>
  );
}

export default Portfolio;