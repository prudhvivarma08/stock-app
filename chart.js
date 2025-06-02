const Chart = require('chart.js');
const { FinancialController, CandlestickElement } = require('chartjs-chart-financial');

Chart.register(FinancialController, CandlestickElement);

let stockChart;

function renderChart(data, symbol, timeRange) {
  const ctx = document.getElementById('stockChart').getContext('2d');
  
  if (stockChart) {
    stockChart.destroy();
  }

  stockChart = new Chart(ctx, {
    type: timeRange === '1D' ? 'candlestick' : 'line',
    data: {
      datasets: [{
        label: `${symbol} Price`,
        data: timeRange === '1D' 
          ? data.map(item => ({
              t: new Date(item.timestamp).toLocaleString(),
              o: item.open,
              h: item.high,
              l: item.low,
              c: item.close
            }))
          : data.map(item => ({
              x: new Date(item.timestamp).toLocaleString(),
              y: item.close
            })),
        borderColor: 'blue',
        fill: false
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: 'Time' } },
        y: { title: { display: true, text: 'Price' } }
      }
    }
  });
}

module.exports = { renderChart };