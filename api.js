const axios = require('axios');
const { apiKey, apiSecret, baseUrl } = require('./config');

async function fetchStockData(symbol, timeRange) {
  try {
    const rangeMap = {
      '1D': '1min',
      '1W': '1day',
      '1M': '1day',
      '1Y': '1day',
      '5Y': '1day',
      'MAX': '1day'
    };
    const interval = rangeMap[timeRange] || '1day';

    const endpoint = `${baseUrl}/market-data/price-history`;
    const response = await axios.get(endpoint, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-Api-Secret': apiSecret
      },
      params: {
        symbol: symbol.toUpperCase(),
        interval,
        period: timeRange === '1D' ? '1d' : timeRange.toLowerCase()
      },
      timeout: 5000 // 5-second timeout
    });

    const data = response.data.data || [];
    return {
      prices: data.map(item => ({
        timestamp: item.date,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume
      })),
      metrics: data.length > 0 ? {
        open: data[data.length - 1].open,
        high: data[data.length - 1].high,
        low: data[data.length - 1].low,
        close: data[data.length - 1].close,
        volume: data[data.length - 1].volume
      } : {}
    };
  } catch (error) {
    if (error.response?.status === 429) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return fetchStockData(symbol, timeRange);
    }
    throw new Error(error.response?.data?.message || error.message);
  }
}

module.exports = { fetchStockData };