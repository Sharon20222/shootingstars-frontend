from flask import Flask, jsonify, request
import yfinance as yf
from indicators import compute_indicators
from candles import detect_candles
from signals import generate_signals

app = Flask(__name__)

@app.route("/analyze/<ticker>")
def analyze(ticker):
    stock = yf.Ticker(ticker)
    df = stock.history(period="6mo")

    data = {
        "close": df["Close"].tolist(),
        "open": df["Open"].tolist(),
        "high": df["High"].tolist(),
        "low": df["Low"].tolist(),
    }

    indicators = compute_indicators(df)
    candles = detect_candles(df)
    signals = generate_signals(df, indicators)

    return jsonify({
        "data": data,
        "indicators": indicators,
        "candles": candles,
        "signals": signals
    })

if __name__ == "__main__":
    app.run(debug=True)
