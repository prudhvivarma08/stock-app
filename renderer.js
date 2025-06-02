const { ipcRenderer } = require('electron');
const { renderChart } = require('./chart');

let currentTimeRange = '1D';
let liveUpdateInterval = null;

async function fetchData() {
  const symbol = document.getElementById('stockSymbol').value.toUpperCase();
  const loading = document.getElementById('loading');
  const error = document.getElementById('error');

  if (!symbol) {
    error.textContent = 'Please enter a stock symbol';
    error.classList.remove('hidden');
    return;
  }

  loading.classList.remove('hidden');
  error.classList.add('hidden');

  try {
    const data = await ipcRenderer.invoke('fetch-stock-data', symbol, currentTimeRange);
    const { prices, metrics } = data;

    // Update metrics
    document.getElementById('open').textContent = metrics.open || 'N/A';
    document.getElementById('high').textContent = metrics.high || 'N/A';
    document.getElementById('low').textContent = metrics.low || 'N/A';
    document.getElementById('close').textContent = metrics.close || 'N/A';
    document.getElementById('volume').textContent = metrics.volume || 'N/A';

    // Render chart
    renderChart(prices, symbol, currentTimeRange);
  } catch (err) {
    error.textContent = `Error: ${err.message}`;
    error.classList.remove('hidden');
  } finally {
    loading.classList.add('hidden');
  }
}

function setTimeRange(range) {
  currentTimeRange = range;
  fetchData();
  // Reset live updates for non-Daily ranges
  if (range !== '1D' && liveUpdateInterval) {
    clearInterval(liveUpdateInterval);
    liveUpdateInterval = null;
    document.getElementById('liveUpdate').checked = false;
  }
}

function toggleLiveUpdate() {
  const liveUpdate = document.getElementById('liveUpdate').checked;
  if (liveUpdate && currentTimeRange === '1D') {
    liveUpdateInterval = setInterval(fetchData, 10000); // Poll every 10 seconds
  } else if (liveUpdateInterval) {
    clearInterval(liveUpdateInterval);
    liveUpdateInterval = null;
  }
}

// Attach event listeners
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('searchBtn').addEventListener('click', fetchData);
  document.getElementById('range1D').addEventListener('click', () => setTimeRange('1D'));
  document.getElementById('range1W').addEventListener('click', () => setTimeRange('1W'));
  document.getElementById('range1M').addEventListener('click', () => setTimeRange('1M'));
  document.getElementById('range1Y').addEventListener('click', () => setTimeRange('1Y'));
  document.getElementById('range5Y').addEventListener('click', () => setTimeRange('5Y'));
  document.getElementById('rangeMAX').addEventListener('click', () => setTimeRange('MAX'));
  document.getElementById('liveUpdate').addEventListener('change', toggleLiveUpdate);
});