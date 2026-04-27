async function loadCandles() {
  const ticker = document.getElementById("ticker").value;
  const res = await fetchData(ticker);

  const candles = res.candles;

  let html = "<h3>Detected Patterns:</h3>";

  candles.forEach(c => {
    html += `<p>📍 Index ${c[0]} → ${c[1]}</p>`;
  });

  document.getElementById("candles").innerHTML = html;
}
