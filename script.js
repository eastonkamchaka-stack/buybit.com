const AUTH_USERNAME = 'LetLoveLead@buybit';
const AUTH_PASSWORD = 'LetLoveLead420';
const AUTH_KEY = 'buybit-authenticated';
const REDIRECT_KEY = 'buybit-redirect';

const liveValues = document.querySelectorAll('.live-number');
const assetAmount = document.querySelector('.asset-number');
let baseAsset = 82000;

function formatNumber(value, isInt = false) {
  if (isInt) {
    return Math.round(value).toLocaleString('en-US');
  }
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function randomDelta(max) {
  return (Math.random() - 0.5) * max;
}

function updateLiveNumbers() {
  if (assetAmount) {
    baseAsset = Math.max(0.01, baseAsset + randomDelta(0.015));
    assetAmount.textContent = formatNumber(baseAsset);
  }

  liveValues.forEach((el) => {
    const original = parseFloat(el.dataset.value.replace(/,/g, '')) || 0;
    const formatInt = el.dataset.format === 'int';
    const delta = randomDelta(Math.max(original * 0.015, 0.4));
    const nextValue = Math.max(0, original + delta);
    el.textContent = formatNumber(nextValue, formatInt);
  });
}

function addSparkline() {
  const sparkline = document.querySelector('.sparkline');
  if (!sparkline) return;
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 220 70');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(svgNS, 'path');
  const points = [15,42, 40,28, 62,45, 90,30, 118,35, 146,20, 178,28, 205,24];
  const d = points.reduce((acc, point, index) => index === 0 ? `M ${point}` : `${acc} L ${point}`, '');
  path.setAttribute('d', d);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'rgba(241, 143, 4, 0.98)');
  path.setAttribute('stroke-width', '3');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  svg.appendChild(path);
  sparkline.appendChild(svg);
}

function animateChartPanels() {
  const charts = document.querySelectorAll('.chart-box, .chart-panel');
  charts.forEach((chart) => {
    chart.style.animation = 'pulse 8s ease-in-out infinite';
  });
}

/* Live trading chart (simulated feed) */
function initLiveTradingChart() {
  if (getPageName() !== 'trade.html') return;

  const panel = document.querySelector('.chart-panel');
  if (!panel) return;

  // Create canvas
  let canvas = panel.querySelector('canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    panel.appendChild(canvas);
  }
  const ctx = canvas.getContext('2d');

  function resize() {
    const rect = panel.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * devicePixelRatio);
    canvas.height = Math.floor(rect.height * devicePixelRatio);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }

  window.addEventListener('resize', resize);
  resize();

  // Seed prices array
  const tickerEl = document.querySelector('.trade-ticker');
  let base = 78287.6;
  if (tickerEl) {
    const txt = tickerEl.textContent.trim().split(' ')[0].replace(/,/g,'');
    const parsed = parseFloat(txt);
    if (!isNaN(parsed)) base = parsed;
  }

  const points = [];
  const maxPoints = 120;

  function randomMove(prev) {
    const vol = Math.max(0.05, Math.abs(prev) * 0.0006);
    return prev + (Math.random() - 0.5) * vol;
  }

  for (let i = 0; i < maxPoints; i++) {
    base = randomMove(base);
    points.push(base);
  }

  function draw() {
    const w = canvas.width / devicePixelRatio;
    const h = canvas.height / devicePixelRatio;
    ctx.clearRect(0,0,w,h);

    // background gradient
    const grad = ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0, 'rgba(241,143,4,0.06)');
    grad.addColorStop(1, 'rgba(8,10,16,0.02)');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,w,h);

    // chart area padding
    const padding = 8;
    const chartW = w - padding*2;
    const chartH = h - padding*2;

    // min/max
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = Math.max(0.0001, max - min);

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(241,143,4,0.98)';
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = padding + (i / (maxPoints - 1)) * chartW;
      const y = padding + (1 - (p - min) / range) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // fill under curve
    ctx.lineTo(padding + chartW, padding + chartH);
    ctx.lineTo(padding, padding + chartH);
    ctx.closePath();
    ctx.fillStyle = 'rgba(241,143,4,0.06)';
    ctx.fill();

    // draw latest price
    const latest = points[points.length-1];
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '12px Arial';
    ctx.fillText(latest.toFixed(2) + ' USD', padding + 6, padding + 14);
  }

  function tick() {
    const last = points[points.length-1];
    const next = randomMove(last);
    points.push(next);
    if (points.length > maxPoints) points.shift();
    draw();

    // update ticker text
    const tickerTextEl = document.querySelector('.trade-ticker');
    if (tickerTextEl) {
      const change = ((next - points[points.length-2]) / points[points.length-2]) * 100;
      const sign = change >= 0 ? '+' : '';
      tickerTextEl.innerHTML = next.toFixed(2) + ' <span class="' + (change>=0? 'positive':'negative') + '">' + sign + change.toFixed(2) + '%</span>';
    }
  }

  // run
  draw();
  const interval = setInterval(tick, 1000);

  // cleanup if navigating away
  window.addEventListener('beforeunload', () => clearInterval(interval));
}

function getPageName() {
  return window.location.pathname.split('/').pop() || 'index.html';
}

function isAuthenticated() {
  return sessionStorage.getItem(AUTH_KEY) === 'true';
}

function saveRedirectTarget() {
  sessionStorage.setItem(REDIRECT_KEY, getPageName());
}

function getRedirectTarget() {
  return sessionStorage.getItem(REDIRECT_KEY) || 'overview.html';
}

function clearRedirectTarget() {
  sessionStorage.removeItem(REDIRECT_KEY);
}

function requireAuth() {
  const pageName = getPageName();
  if (pageName === 'login.html' || pageName === 'index.html' || pageName === 'btc-compliance.html') {
    return;
  }
  if (!isAuthenticated()) {
    saveRedirectTarget();
    window.location.href = 'login.html';
  }
}

function handleLoginPage() {
  if (getPageName() !== 'login.html') {
    return;
  }

  const usernameInput = document.querySelector('#login-username');
  const passwordInput = document.querySelector('#login-password');
  const loginButton = document.querySelector('#login-submit');
  const errorElement = document.querySelector('#auth-error');

  if (!usernameInput || !passwordInput || !loginButton || !errorElement) {
    return;
  }

  if (isAuthenticated()) {
    const destination = getRedirectTarget();
    clearRedirectTarget();
    window.location.href = destination;
    return;
  }

  function showError(message) {
    errorElement.textContent = message;
  }

  function attemptLogin() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (username === AUTH_USERNAME && password === AUTH_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, 'true');
      clearRedirectTarget();
      window.location.href = getRedirectTarget();
      return;
    }

    showError('Invalid username or password. Please try again.');
  }

  loginButton.addEventListener('click', attemptLogin);
  passwordInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      attemptLogin();
    }
  });
}

function handleLegalConsent() {
  const contractCheckbox = document.querySelector('#contract-accept');
  const complianceCheckbox = document.querySelector('#compliance-accept');
  const contractButton = document.querySelector('#next-to-compliance');
  const agreeButton = document.querySelector('#agree-to-login');

  if (contractCheckbox && contractButton) {
    contractCheckbox.addEventListener('change', () => {
      contractButton.disabled = !contractCheckbox.checked;
    });
    contractButton.addEventListener('click', () => {
      if (contractCheckbox.checked) {
        window.location.href = 'btc-compliance.html';
      }
    });
  }

  if (complianceCheckbox && agreeButton) {
    complianceCheckbox.addEventListener('change', () => {
      agreeButton.disabled = !complianceCheckbox.checked;
    });
    agreeButton.addEventListener('click', () => {
      if (complianceCheckbox.checked) {
        window.location.href = 'login.html';
      }
    });
  }
}

function populateProfileFromSession() {
  if (!isAuthenticated()) {
    return;
  }

  const profileName = document.querySelector('#profile-name');
  if (profileName) {
    profileName.textContent = AUTH_USERNAME;
  }
}

function attachLogoutHandlers() {
  const logoutButtons = document.querySelectorAll('.logout-btn');
  logoutButtons.forEach((button) => {
    button.addEventListener('click', () => {
      sessionStorage.removeItem(AUTH_KEY);
      clearRedirectTarget();
      window.location.href = 'login.html';
    });
  });
}

window.addEventListener('DOMContentLoaded', () => {
  requireAuth();
  handleLoginPage();
  handleLegalConsent();
  populateProfileFromSession();
  attachLogoutHandlers();
  addSparkline();
  initLiveTradingChart();
  animateChartPanels();
  updateLiveNumbers();
  setInterval(updateLiveNumbers, 2200);
});
