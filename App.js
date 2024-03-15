import React, { useEffect, useRef, useState } from 'react';
import StockInputPage from './StockInputPage';
import PortfolioForm from './PortfolioForm';
import PortfolioTable from './PortfolioTable';
import Chart from 'chart.js/auto';
import 'chartjs-plugin-zoom'; // Import the zoom plugin
import './App.css'; // Import the CSS file

function App() {
  const stockChartRef = useRef(null);
  const dailyReturnChartRef = useRef(null);
  const [error, setError] = useState(null);
  const [stockName, setStockName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [predictionImage, setPredictionImage] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [stockInfo, setStockInfo] = useState(null); // New state to store fetched stock information
  const [stockData, setStockData] = useState([]); // New state to store fetched stock data

  useEffect(() => {
    if (!submitted) return;

    const fetchDataAndRenderCharts = async () => {
      try {
        const stockInfoResponse = await fetch(`http://127.0.0.1:5000/stock_info?stock_name=${stockName}`);
        const stockInfoData = await stockInfoResponse.json();

        if (!stockInfoResponse.ok) {
          throw new Error('Failed to fetch stock information');
        }

        setStockInfo(stockInfoData); // Set the fetched stock information

        const stockDataResponse = await fetch(`http://127.0.0.1:5000/stock_data?stock_name=${stockName}`);
        const stockData = await stockDataResponse.json();

        if (!stockDataResponse.ok) {
          throw new Error('Failed to fetch stock data');
        }

        setStockData(stockData); // Set the fetched stock data

        // Now, fetch the additional data and render charts
        const dailyReturnResponse = await fetch(`http://127.0.0.1:5000/daily_return?stock_name=${stockName}`);
        const predictionImageResponse = await fetch(`http://127.0.0.1:5000/stock_prediction?stock_name=${stockName}`);

        if (!dailyReturnResponse.ok || !predictionImageResponse.ok) {
          throw new Error('Failed to fetch additional data');
        }

        // Now, fetch the additional data and render charts
        const dailyReturnData = await dailyReturnResponse.json();

        // Check if refs are set before accessing their contexts
        if (stockChartRef.current && dailyReturnChartRef.current) {
          const stockCtx = stockChartRef.current.getContext('2d');
          const dailyReturnCtx = dailyReturnChartRef.current.getContext('2d');

          new Chart(stockCtx, {
            type: 'line',
            data: {
              labels: stockData.map(point => point.x),
              datasets: [{
                label: 'Stock Price',
                data: stockData.map(point => point.y),
                borderColor: 'rgb(0, 155, 255)', // Adjust color to match TradingView style
                backgroundColor: 'rgba(0, 155, 255, 0.1)', // Adjust color to match TradingView style
                tension: 0.2,
                fill: true,
                borderWidth: 2,
                pointRadius: 0, // Hide points
              }]
            },
            options: {
              plugins: {
                zoom: {
                  zoom: {
                    wheel: {
                      enabled: true,
                    },
                    pinch: {
                      enabled: true
                    },
                    mode: 'xy',
                  }
                }
              },
              scales: {
                x: {
                  grid: {
                    display: false, // Hide x-axis gridlines
                  },
                },
                y: {
                  grid: {
                    color: 'rgba(0,0,0,0.05)', // Adjust color to match TradingView style
                  },
                  ticks: {
                    font: {
                      size: 12,
                    },
                    color: 'rgba(0,0,0,0.5)', // Adjust color to match TradingView style
                  },
                },
              },
              elements: {
                line: {
                  tension: 0.2,
                },
              },
              interaction: {
                intersect: false, // Disable tooltip intersection
              },
            }
          });

          new Chart(dailyReturnCtx, {
            type: 'bar',
            data: {
              labels: dailyReturnData.map(point => point.x),
              datasets: [{
                label: 'Daily Return',
                data: dailyReturnData.map(point => point.y),
                backgroundColor: 'rgba(0, 155, 255, 0.5)', // Adjust color to match TradingView style
                borderWidth: 0,
              }]
            },
            options: {
              scales: {
                x: {
                  grid: {
                    color: 'rgba(0,0,0,0.05)', // Adjust color to match TradingView style
                  },
                  ticks: {
                    font: {
                      size: 12,
                    },
                    color: 'rgba(0,0,0,0.5)', // Adjust color to match TradingView style
                  },
                },
                y: {
                  grid: {
                    display: false, // Hide y-axis gridlines
                  },
                },
              },
              interaction: {
                intersect: false, // Disable tooltip intersection
              },
            }
          });
        }

        // Set the prediction image
        const blob = await predictionImageResponse.blob();
        const url = URL.createObjectURL(blob);
        setPredictionImage(url);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching data:', error);
      }
    };

    fetchDataAndRenderCharts();
  }, [submitted, stockName]);

  const handleStockSubmit = (name) => {
    setStockName(name);
    setSubmitted(true);
  };

  const handlePortfolioAdd = async ({ stockName, quantity }) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/stock_price?stock_name=${stockName}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stock price');
      }
      const data = await response.json();
      const price = data.price;
      setPortfolio([...portfolio, { stockName, quantity, price }]);
    } catch (error) {
      console.error('Error adding stock to portfolio:', error);
    }
  };

  const handleStockRemove = (index) => {
    const updatedPortfolio = [...portfolio];
    updatedPortfolio.splice(index, 1);
    setPortfolio(updatedPortfolio);
  };

  return (
    <div className="App">
      {window.location.pathname === '/predictor' ? (
        <div>
          <br />
          {!submitted && <StockInputPage onSubmit={handleStockSubmit} />}
          {submitted && (
            <>
              {stockInfo && (
                <>
                  <h2>Fetched Stock Information:</h2>
                  <div>Symbol: {stockInfo.symbol}</div>
                  <div>Company Name: {stockInfo.company_name}</div>
                  <div>Closing Price: {stockInfo.closing_price}</div>
                  <div>Market Cap: {stockInfo.market_cap}</div>
                  <div>Volume: {stockInfo.volume}</div>
                  <div>Average Volume: {stockInfo.average_volume}</div>
                  <div>Profit Margin: {stockInfo.profit_margin}</div>
                  <div>EBITDA: {stockInfo.EBITDA}</div>
                  <br />
                </>
              )}
              <h1 className="graph-title">Stock Price</h1>
              <br />
              {error && <div>Error: {error}</div>}
              <div className="canvas-container">
                <canvas ref={stockChartRef}></canvas>
              </div>
              <br />
              <h2 className="graph-title">Daily Return Histogram</h2>
              <br />
              <div className="canvas-container">
                <canvas ref={dailyReturnChartRef}></canvas>
              </div>
              <br />
              {predictionImage && (
                <>
                  <h2 className="graph-title">Predictions</h2>
                  <br />
                  <img src={predictionImage} alt="Prediction Graph" />
                </>
              )}
            </>
          )}
        </div>
      ) : window.location.pathname === '/portfolio' ? (
        <div>
          <PortfolioForm onStockAdd={handlePortfolioAdd} />
          <PortfolioTable stocks={portfolio} onStockRemove={handleStockRemove} />
        </div>
      ) : (
        <StockInputPage onSubmit={handleStockSubmit} />
      )}
    </div>
  );
}

export default App;