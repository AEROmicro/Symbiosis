// Stock Exchange configurations
const EXCHANGES = {
  'US': { name: 'US Markets (NYSE/NASDAQ)', suffix: '', default: true },
  'LSE': { name: 'London Stock Exchange', suffix: '.L' },
  'TSE': { name: 'Tokyo Stock Exchange', suffix: '.T' },
  'HKG': { name: 'Hong Kong Stock Exchange', suffix: '.HK' },
  'FRA': { name: 'Frankfurt Stock Exchange', suffix: '.F' },
  'PAR': { name: 'Euronext Paris', suffix: '.PA' },
  'AMS': { name: 'Euronext Amsterdam', suffix: '.AS' },
  'SWX': { name: 'Swiss Exchange', suffix: '.SW' },
  'TSX': { name: 'Toronto Stock Exchange', suffix: '.TO' },
  'ASX': { name: 'Australian Stock Exchange', suffix: '.AX' },
  'NSE': { name: 'National Stock Exchange India', suffix: '.NS' },
  'BSE': { name: 'Bombay Stock Exchange', suffix: '.BO' },
  'KRX': { name: 'Korea Exchange', suffix: '.KS' },
  'SSE': { name: 'Shanghai Stock Exchange', suffix: '.SS' },
  'SZE': { name: 'Shenzhen Stock Exchange', suffix: '.SZ' }
};

// State
let currentExchange = localStorage.getItem('symbiosis_exchange') || 'US';
let watchlist = JSON.parse(localStorage.getItem('symbiosis_watchlist')) || ['^IXIC', '^GSPC', '^DJI'];
let selectedStock = localStorage.getItem('symbiosis_selected') || watchlist[0] || null;
let stockData = {};
let commandHistory = JSON.parse(localStorage.getItem('symbiosis_history')) || [];
let historyIndex = -1;
const sessionStart = Date.now();
const sessionId = Math.random().toString(36).substring(2, 10).toUpperCase();

// CORS Proxy for Yahoo Finance
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// Elements
const terminalLogs = document.getElementById('terminalLogs');
const terminalInput = document.getElementById('terminalInput');
const stockCards = document.getElementById('stockCards');
const detailPanel = document.getElementById('detailPanel');
const tickerTrack = document.getElementById('tickerTrack');
const clock = document.getElementById('clock');
const marketDot = document.getElementById('marketDot');
const marketStatus = document.getElementById('marketStatus');

// Save state to localStorage
function saveState() {
  localStorage.setItem('symbiosis_watchlist', JSON.stringify(watchlist));
  localStorage.setItem('symbiosis_selected', selectedStock);
  localStorage.setItem('symbiosis_exchange', currentExchange);
  localStorage.setItem('symbiosis_history', JSON.stringify(commandHistory.slice(0, 50)));
}

// Initialize
function init() {
  // Register service worker for PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('Service Worker registered'))
      .catch(err => console.log('Service Worker registration failed:', err));
  }

  updateClock();
  setInterval(updateClock, 1000);
  loadWatchlist();
  initTicker();
  setupTerminal();
  addLog('info', 'Type help for available commands');
  if (watchlist.length > 0 && selectedStock) {
    selectStock(selectedStock);
  }
  // Refresh data every 1 second for real-time accuracy
  setInterval(refreshAllStocks, 1000);
  // Refresh ticker every 5 seconds
  setInterval(initTicker, 5000);
}

// Clock and Market Status
function updateClock() {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString('en-US', { hour12: false });
  updateMarketStatus(now);
}

function updateMarketStatus(now) {
  // Get times for different markets
  const nyTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const londonTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/London' }));
  const tokyoTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  
  const nyHours = nyTime.getHours();
  const nyMinutes = nyTime.getMinutes();
  const nyDay = nyTime.getDay();
  const nyTimeNum = nyHours * 60 + nyMinutes;
  
  const londonHours = londonTime.getHours();
  const londonMinutes = londonTime.getMinutes();
  const londonDay = londonTime.getDay();
  const londonTimeNum = londonHours * 60 + londonMinutes;
  
  const tokyoHours = tokyoTime.getHours();
  const tokyoMinutes = tokyoTime.getMinutes();
  const tokyoDay = tokyoTime.getDay();
  const tokyoTimeNum = tokyoHours * 60 + tokyoMinutes;

  // Check if any major market is open
  const isNYWeekday = nyDay >= 1 && nyDay <= 5;
  const isNYOpen = isNYWeekday && nyTimeNum >= 570 && nyTimeNum < 960; // 9:30 AM - 4:00 PM ET
  
  const isLondonWeekday = londonDay >= 1 && londonDay <= 5;
  const isLondonOpen = isLondonWeekday && londonTimeNum >= 480 && londonTimeNum < 1000; // 8:00 AM - 4:30 PM GMT
  
  const isTokyoWeekday = tokyoDay >= 1 && tokyoDay <= 5;
  const isTokyoOpen = isTokyoWeekday && tokyoTimeNum >= 540 && tokyoTimeNum < 900; // 9:00 AM - 3:00 PM JST

  if (isNYOpen || isLondonOpen || isTokyoOpen) {
    marketDot.classList.add('open');
    let openMarkets = [];
    if (isNYOpen) openMarkets.push('NYSE');
    if (isLondonOpen) openMarkets.push('LSE');
    if (isTokyoOpen) openMarkets.push('TSE');
    marketStatus.textContent = `${openMarkets.join('/')} OPEN`;
  } else {
    marketDot.classList.remove('open');
    marketStatus.textContent = 'MARKETS CLOSED';
  }
}

// Ticker
async function initTicker() {
  const indices = [
    { symbol: '^GSPC', name: 'S&P 500' },
    { symbol: '^IXIC', name: 'NASDAQ' },
    { symbol: '^DJI', name: 'DOW' },
    { symbol: '^FTSE', name: 'FTSE 100' },
    { symbol: '^N225', name: 'NIKKEI' },
    { symbol: 'BTC-USD', name: 'BTC' },
    { symbol: 'ETH-USD', name: 'ETH' },
    { symbol: 'GC=F', name: 'GOLD' },
    { symbol: 'CL=F', name: 'OIL' },
    { symbol: 'EURUSD=X', name: 'EUR/USD' }
  ];

  let tickerHTML = '';
  for (const idx of indices) {
    const data = await fetchStockData(idx.symbol);
    if (data) {
      const changeClass = data.change >= 0 ? 'positive' : 'negative';
      const changeSign = data.change >= 0 ? '+' : '';
      tickerHTML += `
        <div class="ticker-item">
          <span class="ticker-symbol">${idx.name}</span>
          <span class="ticker-price">${formatPrice(data.price)}</span>
          <span class="ticker-change ${changeClass}">${changeSign}${data.changePercent.toFixed(2)}%</span>
        </div>
      `;
    }
  }
  // Duplicate multiple times for seamless infinite loop
  tickerTrack.innerHTML = tickerHTML + tickerHTML + tickerHTML + tickerHTML;
}

// Fetch stock data
async function fetchStockData(symbol) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const response = await fetch(CORS_PROXY + encodeURIComponent(url));
    const data = await response.json();

    if (data.chart?.result?.[0]) {
      const result = data.chart.result[0];
      const meta = result.meta;
      const quote = result.indicators?.quote?.[0];

      return {
        symbol: meta.symbol,
        name: meta.shortName || meta.longName || meta.symbol,
        price: meta.regularMarketPrice,
        previousClose: meta.previousClose || meta.chartPreviousClose,
        change: meta.regularMarketPrice - (meta.previousClose || meta.chartPreviousClose),
        changePercent: ((meta.regularMarketPrice - (meta.previousClose || meta.chartPreviousClose)) / (meta.previousClose || meta.chartPreviousClose)) * 100,
        high: quote?.high?.[quote.high.length - 1] || meta.regularMarketDayHigh,
        low: quote?.low?.[quote.low.length - 1] || meta.regularMarketDayLow,
        open: quote?.open?.[0] || meta.regularMarketOpen,
        volume: meta.regularMarketVolume,
        marketCap: meta.marketCap,
        exchange: meta.exchangeName || meta.exchange
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return null;
  }
}

// Search stocks
async function searchStocks(query) {
  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`;
    const response = await fetch(CORS_PROXY + encodeURIComponent(url));
    const data = await response.json();
    
    if (data.quotes && data.quotes.length > 0) {
      return data.quotes.map(q => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        exchange: q.exchange,
        type: q.quoteType
      }));
    }
    return [];
  } catch (error) {
    console.error('Error searching stocks:', error);
    return [];
  }
}

// Fetch chart data
async function fetchChartData(symbol, range = '1mo') {
  try {
    const intervals = { '1d': '5m', '5d': '15m', '1mo': '1h', '3mo': '1d', '6mo': '1d', '1y': '1d', '5y': '1wk' };
    const interval = intervals[range] || '1d';
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`;
    const response = await fetch(CORS_PROXY + encodeURIComponent(url));
    const data = await response.json();

    if (data.chart?.result?.[0]) {
      const result = data.chart.result[0];
      const timestamps = result.timestamp || [];
      const quote = result.indicators?.quote?.[0] || {};

      return timestamps.map((ts, i) => ({
        time: ts * 1000,
        close: quote.close?.[i],
        open: quote.open?.[i],
        high: quote.high?.[i],
        low: quote.low?.[i]
      })).filter(d => d.close != null);
    }
    return [];
  } catch (error) {
    console.error('Error fetching chart data:', error);
    return [];
  }
}

// Load watchlist
async function loadWatchlist() {
  for (const symbol of watchlist) {
    await loadStock(symbol);
  }
  renderStockCards();
}

async function loadStock(symbol) {
  const data = await fetchStockData(symbol);
  if (data) {
    stockData[symbol] = data;
  }
}

async function refreshAllStocks() {
  for (const symbol of watchlist) {
    await loadStock(symbol);
  }
  renderStockCards();
  if (selectedStock && stockData[selectedStock]) {
    updatePriceDisplay(selectedStock);
  }
}

// Update just the price display without re-rendering everything
function updatePriceDisplay(symbol) {
  const data = stockData[symbol];
  if (!data) return;
  
  const priceEl = document.querySelector('.detail-price');
  const changeEl = document.querySelector('.detail-change');
  
  if (priceEl && changeEl) {
    const changeClass = data.change >= 0 ? 'positive' : 'negative';
    const changeSign = data.change >= 0 ? '+' : '';
    priceEl.textContent = `$${formatPrice(data.price)}`;
    changeEl.textContent = `${changeSign}${data.change.toFixed(2)} (${changeSign}${data.changePercent.toFixed(2)}%)`;
    changeEl.className = `detail-change ${changeClass}`;
  }
}

// Render stock cards
function renderStockCards() {
  if (watchlist.length === 0) {
    stockCards.innerHTML = '<div class="empty-state"><div>No stocks in watchlist</div></div>';
    return;
  }

  stockCards.innerHTML = watchlist.map(symbol => {
    const data = stockData[symbol];
    if (!data) return `<div class="stock-card" onclick="selectStock('${symbol}')"><div class="loading"><div class="spinner"></div>Loading ${symbol}...</div></div>`;

    const changeClass = data.change >= 0 ? 'positive' : 'negative';
    const changeSign = data.change >= 0 ? '+' : '';
    const isSelected = symbol === selectedStock;

    return `
      <div class="stock-card ${isSelected ? 'selected' : ''}" onclick="selectStock('${symbol}')">
        <div class="stock-card-header">
          <div>
            <div class="stock-symbol">${symbol}</div>
            <div class="stock-name">${data.name}</div>
          </div>
          <button class="remove-btn" onclick="event.stopPropagation(); removeStock('${symbol}')">&times;</button>
        </div>
        <div class="stock-price">$${formatPrice(data.price)}</div>
        <div class="stock-change ${changeClass}">${changeSign}${data.change.toFixed(2)} (${changeSign}${data.changePercent.toFixed(2)}%)</div>
      </div>
    `;
  }).join('');
}

// Select stock
async function selectStock(symbol) {
  selectedStock = symbol;
  saveState();
  renderStockCards();
  await renderDetailPanel(symbol);
}

// Render detail panel
async function renderDetailPanel(symbol) {
  const data = stockData[symbol];
  if (!data) {
    detailPanel.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';
    return;
  }

  const changeClass = data.change >= 0 ? 'positive' : 'negative';
  const changeSign = data.change >= 0 ? '+' : '';

  detailPanel.innerHTML = `
    <div class="detail-header">
      <div class="detail-symbol">${symbol}</div>
      <div class="detail-name">${data.name}</div>
      <div class="detail-exchange">${data.exchange || 'N/A'}</div>
      <div class="detail-price-section">
        <div class="detail-price">$${formatPrice(data.price)}</div>
        <div class="detail-change ${changeClass}">${changeSign}${data.change.toFixed(2)} (${changeSign}${data.changePercent.toFixed(2)}%)</div>
      </div>
    </div>
    
    <div class="chart-container">
      <div class="chart-header">
        <div class="chart-timeframes">
          <button class="timeframe-btn active" onclick="updateChart('${symbol}', '1d', this)">1D</button>
          <button class="timeframe-btn" onclick="updateChart('${symbol}', '5d', this)">5D</button>
          <button class="timeframe-btn" onclick="updateChart('${symbol}', '1mo', this)">1M</button>
          <button class="timeframe-btn" onclick="updateChart('${symbol}', '3mo', this)">3M</button>
          <button class="timeframe-btn" onclick="updateChart('${symbol}', '6mo', this)">6M</button>
          <button class="timeframe-btn" onclick="updateChart('${symbol}', '1y', this)">1Y</button>
          <button class="timeframe-btn" onclick="updateChart('${symbol}', '5y', this)">5Y</button>
        </div>
      </div>
      <div id="chartArea"><div class="loading"><div class="spinner"></div>Loading chart...</div></div>
    </div>
    
    <div class="detail-stats">
      <div class="stat-item">
        <div class="stat-label">OPEN</div>
        <div class="stat-value">$${formatPrice(data.open)}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">PREV CLOSE</div>
        <div class="stat-value">$${formatPrice(data.previousClose)}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">DAY HIGH</div>
        <div class="stat-value">$${formatPrice(data.high)}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">DAY LOW</div>
        <div class="stat-value">$${formatPrice(data.low)}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">VOLUME</div>
        <div class="stat-value">${formatVolume(data.volume)}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">MARKET CAP</div>
        <div class="stat-value">${formatMarketCap(data.marketCap)}</div>
      </div>
    </div>
  `;

  // Load chart
  updateChart(symbol, '1d');
}

// Update chart
async function updateChart(symbol, range, btn) {
  if (btn) {
    document.querySelectorAll('.timeframe-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  const chartArea = document.getElementById('chartArea');
  chartArea.innerHTML = '<div class="loading"><div class="spinner"></div>Loading chart...</div>';

  const chartData = await fetchChartData(symbol, range);
  if (chartData.length < 2) {
    chartArea.innerHTML = '<div class="empty-state">No chart data available</div>';
    return;
  }

  // Calculate chart
  const prices = chartData.map(d => d.close);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  const width = 340;
  const height = 200;
  const padding = 10;

  const firstPrice = chartData[0].open || chartData[0].close;
  const lastPrice = chartData[chartData.length - 1].close;
  const change = lastPrice - firstPrice;
  const changePercent = (change / firstPrice) * 100;
  const isPositive = change >= 0;
  const colorClass = isPositive ? 'positive' : 'negative';

  // Create path
  const points = chartData.map((d, i) => {
    const x = padding + (i / (chartData.length - 1)) * (width - 2 * padding);
    const y = padding + (1 - (d.close - minPrice) / priceRange) * (height - 2 * padding);
    return `${x},${y}`;
  });

  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `M ${padding},${height - padding} L ${points.join(' L ')} L ${width - padding},${height - padding} Z`;

  chartArea.innerHTML = `
    <div style="margin-bottom: 0.5rem; font-size: 0.875rem;">
      <span style="font-weight: 600;">$${formatPrice(lastPrice)}</span>
      <span class="${colorClass}" style="margin-left: 0.5rem;">${change >= 0 ? '+' : ''}${change.toFixed(2)} (${change >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)</span>
    </div>
    <svg class="chart-svg" viewBox="0 0 ${width} ${height}">
      <path class="chart-area ${colorClass}" d="${areaPath}" />
      <path class="chart-line ${colorClass}" d="${linePath}" />
    </svg>
  `;
}

// Terminal
function setupTerminal() {
  terminalInput.addEventListener('keydown', handleKeyDown);
}

function handleKeyDown(e) {
  if (e.key === 'Enter') {
    processCommand(terminalInput.value);
    terminalInput.value = '';
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      terminalInput.value = commandHistory[historyIndex];
    }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (historyIndex > 0) {
      historyIndex--;
      terminalInput.value = commandHistory[historyIndex];
    } else {
      historyIndex = -1;
      terminalInput.value = '';
    }
  } else if (e.key === 'Tab') {
    e.preventDefault();
    const commands = ['help', 'add', 'remove', 'list', 'clear', 'clearall', 'popular', 'info', 'compare', 'system', 'search', 'exchange', 'exchanges'];
    const match = commands.find(c => c.startsWith(terminalInput.value.toLowerCase()));
    if (match) terminalInput.value = match + ' ';
  }
}

async function processCommand(input) {
  if (!input.trim()) return;

  const parts = input.trim().split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);

  addLog('system', `> ${input}`, true);
  commandHistory.unshift(input);
  historyIndex = -1;
  saveState();

  switch (cmd) {
    case 'help':
      addLog('info', '--- Available Commands ---');
      addLog('info', 'add <SYMBOL>    - Add stock to watchlist');
      addLog('info', 'remove <SYMBOL> - Remove stock from watchlist');
      addLog('info', 'search <QUERY>  - Search for stocks');
      addLog('info', 'info <SYMBOL>   - Show real-time stock info');
      addLog('info', 'compare A B     - Compare two stocks');
      addLog('info', 'list            - Show watched stocks');
      addLog('info', 'popular         - Show popular stocks');
      addLog('info', 'exchanges       - List available exchanges');
      addLog('info', 'exchange <CODE> - Set default exchange');
      addLog('info', 'system          - Show system info');
      addLog('info', 'clear           - Clear terminal output');
      addLog('info', 'clearall        - Remove all stocks');
      break;

    case 'search':
      if (!args[0]) {
        addLog('error', 'Usage: search <QUERY>');
        break;
      }
      await searchStock(args.join(' '));
      break;

    case 'add':
      if (!args[0]) {
        addLog('error', 'Usage: add <SYMBOL>');
        break;
      }
      await addStock(args[0].toUpperCase());
      break;

    case 'remove':
    case 'rm':
      if (!args[0]) {
        addLog('error', 'Usage: remove <SYMBOL>');
        break;
      }
      removeStock(args[0].toUpperCase());
      break;

    case 'list':
    case 'ls':
      if (watchlist.length === 0) {
        addLog('warning', 'Watchlist is empty');
      } else {
        addLog('info', `Watching ${watchlist.length} stocks: ${watchlist.join(', ')}`);
      }
      break;

    case 'clear':
    case 'cls':
      terminalLogs.innerHTML = '';
      break;

    case 'clearall':
      watchlist = [];
      stockData = {};
      selectedStock = null;
      saveState();
      renderStockCards();
      detailPanel.innerHTML = '<div class="empty-state"><div class="empty-icon">>_</div><div>Watchlist cleared</div></div>';
      addLog('success', 'All stocks removed');
      break;

    case 'exchanges':
      addLog('info', '--- Available Exchanges ---');
      Object.entries(EXCHANGES).forEach(([code, info]) => {
        addLog('info', `${code.padEnd(5)} - ${info.name}${info.default ? ' (default)' : ''}`);
      });
      addLog('info', '');
      addLog('info', `Current: ${currentExchange} (${EXCHANGES[currentExchange].name})`);
      addLog('info', 'Use: exchange <CODE> to change');
      break;

    case 'exchange':
      if (!args[0]) {
        addLog('info', `Current exchange: ${currentExchange} (${EXCHANGES[currentExchange].name})`);
        break;
      }
      const code = args[0].toUpperCase();
      if (EXCHANGES[code]) {
        currentExchange = code;
        saveState();
        addLog('success', `Exchange set to ${code} (${EXCHANGES[code].name})`);
      } else {
        addLog('error', `Unknown exchange: ${code}. Use 'exchanges' to see available options.`);
      }
      break;

    case 'popular':
      addLog('info', '--- Popular Stocks ---');
      addLog('info', 'US Tech: AAPL, GOOGL, MSFT, NVDA, META, AMZN');
      addLog('info', 'US Finance: JPM, BAC, GS, V, MA');
      addLog('info', 'US EV/Auto: TSLA, RIVN, F, GM');
      addLog('info', 'US ETFs: SPY, QQQ, DIA, IWM, VTI');
      addLog('info', 'Indices: ^GSPC, ^IXIC, ^DJI, ^FTSE, ^N225');
      addLog('info', 'Crypto: BTC-USD, ETH-USD, SOL-USD');
      addLog('info', 'UK: HSBA.L, BP.L, SHEL.L, VOD.L');
      addLog('info', 'Japan: 7203.T (Toyota), 6758.T (Sony)');
      break;

    case 'info':
      if (!args[0]) {
        addLog('error', 'Usage: info <SYMBOL>');
        break;
      }
      await showStockInfo(args[0].toUpperCase());
      break;

    case 'compare':
    case 'cmp':
      if (args.length < 2) {
        addLog('error', 'Usage: compare <SYMBOL1> <SYMBOL2>');
        break;
      }
      await compareStocks(args[0].toUpperCase(), args[1].toUpperCase());
      break;

    case 'system':
      const uptime = Math.floor((Date.now() - sessionStart) / 1000);
      const uptimeStr = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${uptime % 60}s`;
      addLog('info', '');
      addLog('info', '  +=========================================+');
      addLog('info', '  |     >_  SYMBIOSIS TERMINAL              |');
      addLog('info', '  +=========================================+');
      addLog('info', '');
      addLog('info', `  Version      : 2.0.0 (PWA enabled)`);
      addLog('info', `  Runtime      : Vanilla JS / ES6+`);
      addLog('info', `  Data Source  : Yahoo Finance API`);
      addLog('info', `  CORS Proxy   : allorigins.win`);
      addLog('info', `  Uptime       : ${uptimeStr}`);
      addLog('info', `  Session ID   : ${sessionId}`);
      addLog('info', `  Watchlist    : ${watchlist.length} symbol${watchlist.length !== 1 ? 's' : ''} tracked`);
      addLog('info', `  Exchange     : ${currentExchange} (${EXCHANGES[currentExchange].name})`);
      addLog('info', `  Platform     : ${navigator.platform}`);
      addLog('info', `  Display      : ${window.screen.width}x${window.screen.height}`);
      addLog('info', `  Timezone     : ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
      addLog('info', `  Storage      : localStorage enabled`);
      addLog('info', '');
      break;

    default:
      addLog('error', `Command not found: ${cmd}. Type 'help' for available commands.`);
  }

  scrollToBottom();
}

async function searchStock(query) {
  addLog('system', `Searching for "${query}"...`);
  const results = await searchStocks(query);
  
  if (results.length === 0) {
    addLog('warning', 'No results found');
    return;
  }
  
  addLog('info', `--- Found ${results.length} result(s) ---`);
  results.forEach(r => {
    addLog('info', `${r.symbol.padEnd(12)} ${r.name.substring(0, 30).padEnd(32)} [${r.exchange || 'N/A'}]`);
  });
  addLog('info', '');
  addLog('info', 'Use: add <SYMBOL> to add to watchlist');
}

async function addStock(symbol) {
  // Apply exchange suffix if not already present and not a special symbol
  let fullSymbol = symbol;
  if (currentExchange !== 'US' && !symbol.includes('.') && !symbol.startsWith('^') && !symbol.includes('-')) {
    fullSymbol = symbol + EXCHANGES[currentExchange].suffix;
  }
  
  if (watchlist.includes(fullSymbol)) {
    addLog('warning', `${fullSymbol} is already in watchlist`);
    return;
  }

  addLog('system', `Validating ${fullSymbol}...`);
  const data = await fetchStockData(fullSymbol);

  if (data) {
    watchlist.push(fullSymbol);
    stockData[fullSymbol] = data;
    saveState();
    renderStockCards();
    addLog('success', `Added ${fullSymbol} (${data.name}) @ $${formatPrice(data.price)}`);
    selectStock(fullSymbol);
  } else {
    addLog('error', `Symbol '${fullSymbol}' not found or invalid`);
  }
}

function removeStock(symbol) {
  if (!watchlist.includes(symbol)) {
    addLog('warning', `${symbol} is not in watchlist`);
    return;
  }

  watchlist = watchlist.filter(s => s !== symbol);
  delete stockData[symbol];

  if (selectedStock === symbol) {
    selectedStock = watchlist[0] || null;
    if (selectedStock) {
      selectStock(selectedStock);
    } else {
      detailPanel.innerHTML = '<div class="empty-state"><div class="empty-icon">>_</div><div>Select a stock to view details</div></div>';
    }
  }

  saveState();
  renderStockCards();
  addLog('success', `Removed ${symbol} from watchlist`);
}

async function showStockInfo(symbol) {
  addLog('system', `Fetching info for ${symbol}...`);
  const data = await fetchStockData(symbol);

  if (data) {
    const changeSign = data.change >= 0 ? '+' : '';
    addLog('info', `--- ${data.symbol} ---`);
    addLog('info', `Name: ${data.name}`);
    addLog('info', `Exchange: ${data.exchange || 'N/A'}`);
    addLog('info', `Price: $${formatPrice(data.price)}`);
    addLog('info', `Change: ${changeSign}$${data.change.toFixed(2)} (${changeSign}${data.changePercent.toFixed(2)}%)`);
    addLog('info', `Day Range: $${formatPrice(data.low)} - $${formatPrice(data.high)}`);
    addLog('info', `Market Cap: ${formatMarketCap(data.marketCap)}`);
    addLog('info', `Watching: ${watchlist.includes(symbol) ? 'Yes' : 'No'}`);
  } else {
    addLog('error', `Symbol '${symbol}' not found`);
  }
}

async function compareStocks(s1, s2) {
  addLog('system', `Comparing ${s1} vs ${s2}...`);

  const [d1, d2] = await Promise.all([
    fetchStockData(s1),
    fetchStockData(s2)
  ]);

  if (!d1 || !d2) {
    addLog('error', 'Could not fetch data for one or both symbols');
    return;
  }

  addLog('info', `--- ${s1} vs ${s2} ---`);
  addLog('info', '');
  addLog('info', `Price:       $${formatPrice(d1.price).padStart(10)} | $${formatPrice(d2.price).padStart(10)}`);
  addLog('info', `Change:      ${(d1.changePercent >= 0 ? '+' : '') + d1.changePercent.toFixed(2).padStart(9)}% | ${(d2.changePercent >= 0 ? '+' : '') + d2.changePercent.toFixed(2).padStart(9)}%`);
  addLog('info', `Market Cap:  ${formatMarketCap(d1.marketCap).padStart(10)} | ${formatMarketCap(d2.marketCap).padStart(10)}`);
  addLog('info', '');
  const winner = d1.changePercent > d2.changePercent ? s1 : d2.changePercent > d1.changePercent ? s2 : 'TIE';
  addLog('success', `Today's performer: ${winner}`);
}

// Utility functions
function formatPrice(price) {
  if (price == null) return 'N/A';
  return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatVolume(volume) {
  if (volume == null) return 'N/A';
  if (volume >= 1e9) return (volume / 1e9).toFixed(2) + 'B';
  if (volume >= 1e6) return (volume / 1e6).toFixed(2) + 'M';
  if (volume >= 1e3) return (volume / 1e3).toFixed(2) + 'K';
  return volume.toString();
}

function formatMarketCap(cap) {
  if (cap == null) return 'N/A';
  if (cap >= 1e12) return '$' + (cap / 1e12).toFixed(2) + 'T';
  if (cap >= 1e9) return '$' + (cap / 1e9).toFixed(2) + 'B';
  if (cap >= 1e6) return '$' + (cap / 1e6).toFixed(2) + 'M';
  return '$' + cap.toLocaleString();
}

function addLog(type, message, isCommand = false) {
  const line = document.createElement('div');
  line.className = `log-line ${type}`;
  
  if (!isCommand) {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    line.innerHTML = `<span class="log-timestamp">[${timestamp}]</span>${message}`;
  } else {
    line.textContent = message;
  }
  
  terminalLogs.appendChild(line);
  scrollToBottom();
}

function scrollToBottom() {
  terminalLogs.scrollTop = terminalLogs.scrollHeight;
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
