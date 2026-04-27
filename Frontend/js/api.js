const BASE_URL = "https://shootingstars-api.onrender.com";

async function fetchData(ticker) {
  try {
    const res = await fetch(`${BASE_URL}/analyze/${ticker}`);
    
    if (!res.ok) {
      throw new Error("API request failed");
    }

    const data = await res.json();
    return data;

  } catch (err) {
    console.error("Data fetch error:", err);
    return null;
  }
}
