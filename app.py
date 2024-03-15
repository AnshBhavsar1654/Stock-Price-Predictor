from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import numpy as np
from pandas_datareader import data as pdr
import yfinance as yf
from datetime import datetime, timedelta
from tensorflow.keras.models import load_model
from sklearn.preprocessing import MinMaxScaler
import matplotlib.pyplot as plt

app = Flask(__name__)
CORS(app)

# Load the pre-trained LSTM model
model = load_model("C:/Data/Coding/Projects/Archive/backend/model.h5")
model.compile(optimizer='adam', loss='mean_squared_error', metrics=['accuracy'])


@app.route('/stock_data', methods=['GET'])
def stock_data():
    stock_symbol = request.args.get('stock_name', '^NSEBANK')
    end = datetime.now()
    start = datetime(end.year - 1, end.month, end.day)

    yf.pdr_override()
    stock_data = pdr.get_data_yahoo(stock_symbol, start=start, end=end)
    stock_name = stock_symbol.split('.')[0]

    # Filter out NaN values from the data
    stock_data = stock_data.dropna()

    data = [{'x': xi.strftime('%Y-%m-%d'), 'y': yi} for xi, yi in zip(stock_data.index, stock_data['Adj Close'])]
    return jsonify(data)

@app.route('/daily_return', methods=['GET'])
def daily_return_data():
    stock_symbol = request.args.get('stock_name', '^NSEBANK')  # Example stock symbol (Apple Inc.)
    end = datetime.now()
    start = datetime(end.year - 1, end.month, end.day)

    yf.pdr_override()
    stock_data = pdr.get_data_yahoo(stock_symbol, start=start, end=end)
    stock_name = stock_symbol.split('.')[0]

    # Calculate daily return
    stock_data['Daily Return'] = stock_data['Adj Close'].pct_change()

    # Filter out NaN values from the data
    stock_data = stock_data.dropna()

    # Creating histogram with 50 bins
    hist, bins = np.histogram(stock_data['Daily Return'], bins=50)
    bin_centers = 0.5 * (bins[:-1] + bins[1:])
    
    # Round off bin_centers to 3 decimals
    bin_centers = np.round(bin_centers, 3)
    
    # Convert int32 to int and then to Python list for JSON serialization
    hist = hist.astype(int).tolist()

    daily_return_data = [{'x': round(bin_center, 3), 'y': hist_val} for bin_center, hist_val in zip(bin_centers, hist)]
    return jsonify(daily_return_data)

@app.route('/stock_prediction', methods=['GET'])
def stock_prediction():
    stock_symbol = request.args.get('stock_name', '^NSEBANK')  # Example stock symbol (Apple Inc.)
    end = datetime.now()
    start = datetime(end.year - 1, end.month, end.day)

    yf.pdr_override()
    stock_data = pdr.get_data_yahoo(stock_symbol, start=start, end=end)
    stock_name = stock_symbol.split('.')[0]

    # Preprocess data for LSTM
    data = stock_data.filter(['Close'])
    dataset = data.values
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(dataset)
    training_data_len = int(np.ceil(len(dataset) * .95 ))

    train_data = scaled_data[0:int(training_data_len), :]
    x_train, y_train = [], []
    for i in range(60, len(train_data)):
        x_train.append(train_data[i-60:i, 0])
        y_train.append(train_data[i, 0])
    x_train, y_train = np.array(x_train), np.array(y_train)
    x_train = np.reshape(x_train, (x_train.shape[0], x_train.shape[1], 1))

    # Making predictions
    test_data = scaled_data[training_data_len - 60:, :]
    x_test = []
    y_test = dataset[training_data_len:, :]
    for i in range(60, len(test_data)):
        x_test.append(test_data[i-60:i, 0])
    x_test = np.array(x_test)
    x_test = np.reshape(x_test, (x_test.shape[0], x_test.shape[1], 1))
    predictions = model.predict(x_test)
    predictions = scaler.inverse_transform(predictions)

    # Plotting predictions
    train = data[:training_data_len]
    valid = data[training_data_len:]
    valid['Predictions'] = predictions
    plt.figure(figsize=(10, 6))
    plt.plot(train['Close'])
    plt.plot(valid[['Close', 'Predictions']])
    plt.legend(['Train', 'Val', 'Predictions'], loc='lower right')
    plt.title(f"Predictions for {stock_name}")
    plt.xlabel('Date')
    plt.ylabel('Close Price')
    plt.tight_layout()

    # Save the plot as an image
    image_path = f"{stock_name}_prediction.png"
    plt.savefig(image_path)

    return send_file(image_path, mimetype='image/png')

@app.route('/stock_price', methods=['GET'])
def stock_price():
    stock_name = request.args.get('stock_name')
    if not stock_name:
        return jsonify({"error": "Stock name not provided"}), 400

    try:
        stock = yf.Ticker(stock_name)
        price = stock.history(period="1d")['Close'].iloc[-1]
        return jsonify({"price": price})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/stock_info', methods=['GET'])
def stock_info():
    stock_symbol = request.args.get('stock_name')
    if not stock_symbol:
        return jsonify({"error": "Stock name not provided"}), 400

    try:
        stock = yf.Ticker(stock_symbol)
        info = stock.info
        basic_info = {
            "symbol": info.get("symbol"),
            "company_name": info.get("longName"),
            "closing_price": info.get("regularMarketPreviousClose"),
            "market_cap": info.get("marketCap"),
            "volume": info.get("volume"),
            "average_volume": info.get("averageVolume"),
            "profit_margin": info.get("profitMargins"),
            "EBITDA": info.get("ebitda")
        }
        return jsonify(basic_info)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)