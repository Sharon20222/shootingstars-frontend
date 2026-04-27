//////////////////////////////////////////////////////
// 📡 1. DATA FETCH (Yahoo Finance-like API)
//////////////////////////////////////////////////////

async function getData(ticker) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=6mo&interval=1d`;

  const res = await fetch(url);
  const json = await res.json();

  const r = json.chart.result[0];

  return {
    open: r.indicators.quote[0].open,
    high: r.indicators.quote[0].high,
    low: r.indicators.quote[0].low,
    close: r.indicators.quote[0].close,
    volume: r.indicators.quote[0].volume
  };
}

//////////////////////////////////////////////////////
// 📊 2. INDICATORS (ALL IN ONE PLACE)
//////////////////////////////////////////////////////

function SMA(data, n) {
  return data.map((_, i, a) =>
    i < n ? null :
    a.slice(i - n, i).reduce((x, y) => x + y) / n
  );
}

function EMA(data, n) {
  let k = 2 / (n + 1);
  let ema = [data[0]];

  for (let i = 1; i < data.length; i++) {
    ema.push(data[i] * k + ema[i - 1] * (1 - k));
  }

  return ema;
}

function RSI(data, n = 14) {
  let rsi = Array(data.length).fill(null);

  for (let i = n; i < data.length; i++) {
    let gain = 0, loss = 0;

    for (let j = i - n + 1; j <= i; j++) {
      let diff = data[j] - data[j - 1];
      if (diff > 0) gain += diff;
      else loss -= diff;
    }

    let rs = gain / (loss || 1);
    rsi[i] = 100 - (100 / (1 + rs));
  }

  return rsi;
}

function MACD(data) {
  let ema12 = EMA(data, 12);
  let ema26 = EMA(data, 26);

  return data.map((_, i) => ema12[i] - ema26[i]);
}

function Bollinger(data, n = 20) {
  return data.map((_, i, a) => {
    if (i < n) return null;

    let slice = a.slice(i - n, i);
    let mean = slice.reduce((x, y) => x + y) / n;

    let variance = slice.reduce((x, y) =>
      x + Math.pow(y - mean, 2), 0
    ) / n;

    let std = Math.sqrt(variance);

    return {
      upper: mean + 2 * std,
      lower: mean - 2 * std,
      mid: mean
    };
  });
}

function OBV(close, volume) {
  let obv = [0];

  for (let i = 1; i < close.length; i++) {
    if (close[i] > close[i - 1])
      obv.push(obv[i - 1] + volume[i]);
    else if (close[i] < close[i - 1])
      obv.push(obv[i - 1] - volume[i]);
    else
      obv.push(obv[i - 1]);
  }

  return obv;
}

//////////////////////////////////////////////////////
// 🕯 3. CANDLESTICK PATTERNS
//////////////////////////////////////////////////////

function isDoji(o, c, h, l) {
  return Math.abs(o - c) < (h - l) * 0.1;
}

function isHammer(o, c, h, l) {
  return (c > o) && ((o - l) > 2 * (c - o));
}

function isShootingStar(o, c, h, l) {
  return (h - Math.max(o, c)) > 2 * Math.abs(o - c);
}

function isEngulfing(po, pc, o, c) {
  return pc < po && c > o && c > po;
}

//////////////////////////////////////////////////////
// 📡 4. SIGNAL ENGINE (MULTI-FACTOR)
//////////////////////////////////////////////////////

function generateSignals(close, rsi, macd, bb) {
  let signals = [];

  for (let i = 20; i < close.length; i++) {

    if (close[i] > close[i - 1] && macd[i] > 0)
      signals.push("TREND BULL");

    if (close[i] < close[i - 1] && macd[i] < 0)
      signals.push("TREND BEAR");

    if (rsi[i] < 30)
      signals.push("OVERSOLD RSI");

    if (rsi[i] > 70)
      signals.push("OVERBOUGHT RSI");

    if (bb[i] && close[i] > bb[i].upper)
      signals.push("BREAKOUT UP");

    if (bb[i] && close[i] < bb[i].lower)
      signals.push("BREAKOUT DOWN");
  }

  return signals;
}

//////////////////////////////////////////////////////
// 🚀 5. MAIN RUN FUNCTION
//////////////////////////////////////////////////////

async function run() {

  const ticker = document.getElementById("ticker").value;
  const data = await getData(ticker);

  const close = data.close;
  const volume = data.volume;

  const sma = SMA(close, 10);
  const ema = EMA(close, 20);
  const rsi = RSI(close);
  const macd = MACD(close);
  const bb = Bollinger(close);
  const obv = OBV(close, volume);

  const signals = generateSignals(close, rsi, macd, bb);

  document.getElementById("signals").innerHTML =
    signals.map(s => `<p>${s}</p>`).join("");

  document.getElementById("candles").innerHTML =
    `
    <p>✔ Doji</p>
    <p>✔ Hammer</p>
    <p>✔ Shooting Star</p>
    <p>✔ Engulfing</p>
    `;

  console.log({
    sma, ema, rsi, macd, bb, obv
  });
}
