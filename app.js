const DERIV_APP_ID = "34ZfveN7Be9dqW8mOCJAe";
const AFFILIATE_TOKEN = "3A2CFHPG722B";

const DEFAULT_MINUTE_TIMEFRAMES = ['1', '2', '3', '5', '10', '15', '30'];
const DEFAULT_SHIFT_SECONDS = 8;
const MAX_RUNS_CAP = 7;
const DEFAULT_RUNS_TARGET = 6;

// Strictly synthetic indices only: Volatility, Volatility 1s, and Jump
const exhaustiveAssets = [
    { symbol: 'R_10',     name: 'Volatility 10',      market: 'volatility',    pip: 3, base: 6321.450, tv: 'FX:EURUSD', initialAdx: 27.4, initialWick: 0.16, smcZone: 'Bullish OB + FVG', playbook: 'OB Pullback' },
    { symbol: 'R_25',     name: 'Volatility 25',      market: 'volatility',    pip: 3, base: 3120.100, tv: 'FX:GBPUSD', initialAdx: 25.6, initialWick: 0.19, smcZone: 'Bearish OB + FVG', playbook: 'OB Pullback' },
    { symbol: 'R_50',     name: 'Volatility 50',      market: 'volatility',    pip: 3, base: 2450.750, tv: 'FX:USDJPY', initialAdx: 23.5, initialWick: 0.23, smcZone: 'Bullish 50% CE', playbook: 'FVG + 50% CE' },
    { symbol: 'R_75',     name: 'Volatility 75',      market: 'volatility',    pip: 3, base: 8940.200, tv: 'FX:AUDUSD', initialAdx: 26.2, initialWick: 0.18, smcZone: 'Bearish Sweep + OB', playbook: 'Liquidity Sweep' },
    { symbol: 'R_100',    name: 'Volatility 100',     market: 'volatility',    pip: 3, base: 4120.900, tv: 'FX:USDCAD', initialAdx: 22.7, initialWick: 0.25, smcZone: 'Bullish BOS + OB', playbook: 'OB Pullback' },
    { symbol: '1HZ10V',   name: 'Volatility 10 (1s)', market: 'volatility_1s', pip: 2, base: 9452.18,  tv: 'FX:EURUSD', initialAdx: 28.1, initialWick: 0.15, smcZone: 'Bearish Breaker+FVG', playbook: 'FVG + 50% CE' },
    { symbol: '1HZ25V',   name: 'Volatility 25 (1s)', market: 'volatility_1s', pip: 2, base: 5320.45,  tv: 'FX:GBPUSD', initialAdx: 24.8, initialWick: 0.21, smcZone: 'Bullish Sweep + CE', playbook: 'Liquidity Sweep' },
    { symbol: '1HZ50V',   name: 'Volatility 50 (1s)', market: 'volatility_1s', pip: 2, base: 48912.34, tv: 'FX:USDJPY', initialAdx: 21.9, initialWick: 0.27, smcZone: 'Bearish OB + CE', playbook: 'OB Pullback' },
    { symbol: '1HZ75V',   name: 'Volatility 75 (1s)', market: 'volatility_1s', pip: 2, base: 12450.80, tv: 'FX:AUDUSD', initialAdx: 26.7, initialWick: 0.17, smcZone: 'Bullish FVG + OB', playbook: 'FVG + 50% CE' },
    { symbol: '1HZ100V',  name: 'Volatility 100 (1s)',market: 'volatility_1s', pip: 2, base: 1428.64,  tv: 'FX:USDCHF', initialAdx: 23.0, initialWick: 0.22, smcZone: 'Bearish Sweep+FVG', playbook: 'Liquidity Sweep' },
    { symbol: 'JD10',     name: 'Jump 10 Index',      market: 'jump',          pip: 2, base: 1240.50,  tv: 'FX:EURGBP', initialAdx: 25.3, initialWick: 0.19, smcZone: 'Bullish OB + 50% CE', playbook: 'OB Pullback' },
    { symbol: 'JD25',     name: 'Jump 25 Index',      market: 'jump',          pip: 2, base: 2150.80,  tv: 'FX:NZDUSD', initialAdx: 18.1, initialWick: 0.49, smcZone: 'Choppy Inducement', playbook: 'Noisy Range' },
    { symbol: 'JD50',     name: 'Jump 50 Index',      market: 'jump',          pip: 2, base: 3420.10,  tv: 'FX:AUDJPY', initialAdx: 24.1, initialWick: 0.20, smcZone: 'Bearish FVG + OB', playbook: 'FVG + 50% CE' },
    { symbol: 'JD75',     name: 'Jump 75 Index',      market: 'jump',          pip: 2, base: 5120.40,  tv: 'FX:GBPJPY', initialAdx: 17.6, initialWick: 0.53, smcZone: 'Disrupted Spike', playbook: 'Noisy Spike' },
    { symbol: 'JD100',    name: 'Jump 100 Index',     market: 'jump',          pip: 2, base: 8940.20,  tv: 'FX:EURUSD', initialAdx: 23.6, initialWick: 0.24, smcZone: 'Bullish Sweep + OB', playbook: 'Liquidity Sweep' }
];

// Rise / Fall time-hold contracts only (CALL / PUT with duration_unit: 'm')
const RISE_FALL_TIME_SETUPS = [
    { direction: 'rise', name: 'RISE (CALL)', shortName: 'CALL', api: 'CALL', holdMinutes: 2, runs: 6, payoutMult: 0.92, boatId: 1 },
    { direction: 'fall', name: 'FALL (PUT)',  shortName: 'PUT',  api: 'PUT',  holdMinutes: 2, runs: 6, payoutMult: 0.92, boatId: 2 }
];

let currentCategory = 'all';
let currentParityFilter = 'all';
let rotationCursor = 0;
let signalCycleCursor = 0;
let currentSymbol = exhaustiveAssets[0].symbol;
let activeCandleTf = '5';
let rotationIntervalSec = DEFAULT_SHIFT_SECONDS;
let shiftTimer = null;
let shiftCountdown = DEFAULT_SHIFT_SECONDS;
let cooldownUntil = 0;
let marketDataStore = {};
let activeAccountMode = 'demo';
let simulatedBalance = 1000.00;
let sessionNetPnl = 0;
let sessionWins = 0;
let sessionLosses = 0;
let consecutiveLosses = 0;
let lastExecutionTimestamp = 0;
let activeAutomationMode = null;

function getSelectedRunsTarget(defaultRuns = DEFAULT_RUNS_TARGET) {
    const val = parseInt(document.getElementById('runs-target-input')?.value, 10);
    if (!isNaN(val) && val >= 1 && val <= MAX_RUNS_CAP) return val;
    return defaultRuns;
}

function getSelectedHoldMinutes() {
    const val = parseInt(document.getElementById('hold-minutes-input')?.value, 10);
    if (!isNaN(val) && val >= 1 && val <= 10) return val;
    return 2;
}

function updateHoldMinutesOverride() {
    const mins = getSelectedHoldMinutes();
    Object.values(marketDataStore).forEach(st => {
        st.holdMinutes = mins;
        st.strategy.holdMinutes = mins;
    });
    updateSignalUI(currentSymbol);
    renderScanner();
}

function updateRunsTargetOverride() {
    const st = marketDataStore[currentSymbol];
    if (st) {
        st.runsTarget = getSelectedRunsTarget(DEFAULT_RUNS_TARGET);
        st.runsCompleted = 0;
        updateSignalUI(currentSymbol);
    }
}

function updateRotationIntervalFromInput() {
    const val = parseInt(document.getElementById('loss-cooldown-sec')?.value, 10);
    rotationIntervalSec = (!isNaN(val) && val >= 4 && val <= 30) ? val : DEFAULT_SHIFT_SECONDS;
    shiftCountdown = Math.min(shiftCountdown, rotationIntervalSec);
    const pill = document.getElementById('shift-countdown-pill');
    if (pill) pill.innerText = `${shiftCountdown}s`;
}

function computeSmcEntryAndIndicators(prices, fallbackAdx = 25, fallbackWick = 0.18, direction = 'rise', pipSize = 2) {
    if (!prices || prices.length < 8) {
        const base = prices && prices.length ? prices[prices.length - 1] : 0;
        return {
            adx: fallbackAdx,
            rsi: direction === 'rise' ? 58.5 : 41.5,
            emaBias: direction === 'rise' ? 'BULLISH' : 'BEARISH',
            noiseRatio: fallbackWick,
            entryPoint: Number(base).toFixed(pipSize)
        };
    }
    const recent = prices.slice(-25);
    let gains = 0;
    let losses = 0;
    let totalRange = 0;
    const netMove = Math.abs(recent[recent.length - 1] - recent[0]);
    for (let i = 1; i < recent.length; i++) {
        const diff = recent[i] - recent[i - 1];
        totalRange += Math.abs(diff);
        if (diff > 0) gains += diff;
        else if (diff < 0) losses += Math.abs(diff);
    }
    const rs = losses === 0 ? 10 : gains / losses;
    const rsi = Number((100 - (100 / (1 + rs))).toFixed(1));
    const trendStrength = Math.abs(rsi - 50);
    const adx = Number(Math.min(45, Math.max(15, 19.5 + trendStrength * 0.9)).toFixed(1));

    const k = 2 / (20 + 1);
    let ema = recent[0];
    for (let i = 1; i < recent.length; i++) {
        ema = recent[i] * k + ema * (1 - k);
    }
    const latest = recent[recent.length - 1];
    const emaBias = latest >= ema ? 'BULLISH' : 'BEARISH';
    const rawNoise = totalRange > 0 ? Math.max(0.08, Math.min(0.65, 1 - (netMove / (totalRange + 1e-9)) * 0.65)) : fallbackWick;
    const noiseRatio = Number(((rawNoise + fallbackWick) / 2).toFixed(2));

    // SMC 50% equilibrium / Order Block entry anchor
    const sliceWindow = recent.slice(-8);
    const swingLow = Math.min(...sliceWindow);
    const swingHigh = Math.max(...sliceWindow);
    const eq50 = (swingHigh + swingLow) / 2;
    const rawEntry = direction === 'rise'
        ? Math.min(latest, (eq50 + swingLow) / 2)
        : Math.max(latest, (eq50 + swingHigh) / 2);

    return {
        adx,
        rsi,
        emaBias,
        noiseRatio,
        entryPoint: Number(rawEntry).toFixed(pipSize)
    };
}

function getMarketTypeLabel(marketKey) {
    if (marketKey === 'volatility_1s') return 'Vol 1s';
    if (marketKey === 'jump') return 'Jump';
    return 'Volatility';
}

exhaustiveAssets.forEach((a, idx) => {
    const tf = DEFAULT_MINUTE_TIMEFRAMES[idx % DEFAULT_MINUTE_TIMEFRAMES.length];
    const startDir = idx % 2 === 0 ? 'rise' : 'fall';
    const strat = RISE_FALL_TIME_SETUPS.find(s => s.direction === startDir) || RISE_FALL_TIME_SETUPS[0];
    const holdMin = getSelectedHoldMinutes();
    const initCalc = computeSmcEntryAndIndicators([a.base], a.initialAdx, a.initialWick, startDir, a.pip);

    marketDataStore[a.symbol] = {
        name: a.name,
        market: a.market,
        pip: a.pip,
        price: a.base.toFixed(a.pip),
        entryPoint: initCalc.entryPoint,
        entryLockedDir: startDir,
        priceHistory: [a.base],
        timeframe: tf,
        holdMinutes: holdMin,
        runsTarget: DEFAULT_RUNS_TARGET,
        runsCompleted: 0,
        strategy: { ...strat, holdMinutes: holdMin },
        smcZone: a.smcZone,
        playbook: a.playbook,
        adx: a.initialAdx,
        rsi: startDir === 'rise' ? 58.5 : 41.5,
        emaBias: startDir === 'rise' ? 'BULLISH' : 'BEARISH',
        wickRatio: a.initialWick,
        lastTickDir: 'up'
    };
});

// Strict Playbook + A+ SMC + Indicator Approval Gate for Rise / Fall Time-Hold Contracts
function evaluateRiseFallSmcApproval(st) {
    const minAdx = parseFloat(document.getElementById('filter-min-adx')?.value) || 20;
    const maxWick = parseFloat(document.getElementById('filter-max-wick')?.value) || 0.40;

    const adxOk = st.adx >= minAdx;
    const noiseOk = st.wickRatio <= maxWick;
    const smcClean = !/choppy|disrupted/i.test(st.smcZone);
    const playbookClean = !/noisy/i.test(st.playbook);
    const trendAligned = st.strategy.direction === 'rise'
        ? (st.emaBias === 'BULLISH' && st.rsi >= 48 && st.rsi <= 78)
        : (st.emaBias === 'BEARISH' && st.rsi >= 22 && st.rsi <= 52);

    const reasons = [];
    if (!smcClean || !playbookClean) reasons.push(`SMC/Playbook noise (${st.smcZone})`);
    if (!noiseOk) reasons.push(`Noise ${st.wickRatio} > ${maxWick}`);
    if (!adxOk) reasons.push(`ADX ${st.adx} < ${minAdx}`);
    if (!trendAligned) reasons.push(`${st.strategy.shortName} vs ${st.emaBias}/RSI ${st.rsi}`);

    const isApproved = smcClean && playbookClean && noiseOk && adxOk && trendAligned;
    const score = st.adx - (st.wickRatio * 25);

    return {
        isApproved,
        score,
        approvalLabel: isApproved ? `A+ ${st.strategy.shortName}` : 'NULL SIGNAL',
        statusText: isApproved
            ? `APPROVED: ${st.playbook} + ${st.smcZone} -> ${st.strategy.name} (Hold ${st.holdMinutes}m • ADX ${st.adx} • RSI ${st.rsi})`
            : `NULL SIGNAL (${reasons.slice(0, 2).join(' | ')})`
    };
}

function refreshAllFilterStatuses() {
    updateSignalUI(currentSymbol);
    renderScanner();
}

function logTransaction(msg, isHighlight = false) {
    const logContainer = document.getElementById('live-transaction-log');
    if (!logContainer) return;
    if (logContainer.querySelector('.italic')) logContainer.innerHTML = '';

    const time = new Date().toLocaleTimeString();
    const row = document.createElement('div');
    row.className = isHighlight
        ? 'p-1.5 rounded bg-emerald-950/80 border border-fxgreen text-fxgreen font-bold'
        : 'p-1 rounded bg-slate-950 border border-slate-800/80 text-slate-300';
    row.innerText = `[${time}] ${msg}`;
    logContainer.prepend(row);
    if (logContainer.children.length > 25) logContainer.lastChild.remove();
}

function dismissSplash() {
    const s = document.getElementById('splash-screen');
    if (s) { s.style.opacity = '0'; setTimeout(() => s.style.display = 'none', 300); }
}

function authDeriv() {
    if (window.derivApiInstance) {
        window.derivApiInstance.startOAuthLogin(AFFILIATE_TOKEN);
    }
}

function openDerivCashier(action) {
    const cashierUrl = action === 'withdraw'
        ? 'https://app.deriv.com/account/cashier/withdrawal'
        : 'https://app.deriv.com/account/cashier/deposit';
    window.open(cashierUrl, '_blank');
}

async function handleAccountSelect(accountId) {
    if (window.derivApiInstance && accountId) {
        const ok = await window.derivApiInstance.connectAuthenticatedWebSocket(accountId);
        if (ok) {
            const acc = window.derivApiInstance.accounts.find(a => a.account === accountId);
            const mode = acc && !acc.isVirtual ? 'real' : 'demo';
            activeAccountMode = mode;
            document.getElementById('btn-demo').className = mode === 'demo' ? "px-3 py-1 rounded-lg font-bold bg-emerald-600 text-white transition" : "px-3 py-1 rounded-lg font-semibold text-slate-400";
            document.getElementById('btn-real').className = mode === 'real' ? "px-3 py-1 rounded-lg font-bold bg-gold text-slate-950 transition" : "px-3 py-1 rounded-lg font-semibold text-slate-400";
            document.getElementById('account-id-label').innerText = mode === 'real' ? 'Real Balance' : 'Demo Balance';
            logTransaction(`Connected OTP WebSocket to ${accountId}`, true);
        }
    }
}

async function setMode(mode) {
    activeAccountMode = mode;
    document.getElementById('btn-demo').className = mode === 'demo' ? "px-3 py-1 rounded-lg font-bold bg-emerald-600 text-white transition" : "px-3 py-1 rounded-lg font-semibold text-slate-400";
    document.getElementById('btn-real').className = mode === 'real' ? "px-3 py-1 rounded-lg font-bold bg-gold text-slate-950 transition" : "px-3 py-1 rounded-lg font-semibold text-slate-400";
    document.getElementById('account-id-label').innerText = mode === 'real' ? 'Real Balance' : 'Demo Balance';

    if (window.derivApiInstance) {
        const switched = await window.derivApiInstance.switchAccountMode(mode);
        if (switched) {
            const sel = document.getElementById('account-selector');
            if (sel) sel.value = switched.account;
            logTransaction(`Switched to ${mode.toUpperCase()} Account (${switched.account})`, true);
        }
    }
}

function switchParityFilter(filterKey) {
    currentParityFilter = filterKey;
    ['all', 'rise', 'fall', 'aplus'].forEach(k => {
        const btn = document.getElementById(`pf-${k}`);
        if (btn) {
            btn.className = k === filterKey
                ? "bg-cyan-600 text-white font-bold py-1 px-1 rounded"
                : "bg-slate-900 text-slate-300 py-1 px-1 rounded border border-slate-800";
        }
    });
    renderScanner();
}

function switchCategory(cat) {
    currentCategory = cat;
    ['all', 'volatility', 'volatility_1s', 'jump'].forEach(c => {
        const btn = document.getElementById(`cat-${c}`);
        if (btn) {
            btn.className = c === cat
                ? "bg-emerald-600 text-white font-bold py-1.5 px-1 rounded-lg transition"
                : "bg-slate-900 text-slate-300 py-1.5 px-1 rounded-lg transition border border-slate-800";
        }
    });
    renderScanner();
}

function changeChartTimeframe(tf, syncState = true) {
    activeCandleTf = String(tf);
    document.querySelectorAll('.tf-btn').forEach(btn => {
        btn.className = btn.dataset.tf === activeCandleTf
            ? "tf-btn px-2 py-1 rounded bg-emerald-600 text-white font-bold"
            : "tf-btn px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300";
    });
    if (syncState && marketDataStore[currentSymbol]) {
        marketDataStore[currentSymbol].timeframe = activeCandleTf;
        updateSignalUI(currentSymbol);
    }
    initTradingView(currentSymbol, activeCandleTf);
}

function toggleChartFullscreen() {
    const w = document.getElementById('chart-card-wrapper');
    w.classList.toggle('fixed'); w.classList.toggle('inset-4'); w.classList.toggle('z-50');
}

function initTradingView(sym, tf = '5') {
    const c = document.getElementById('tradingview_advanced_chart');
    if (!c || typeof TradingView === 'undefined') return;
    c.innerHTML = '';
    const assetObj = exhaustiveAssets.find(a => a.symbol === sym);
    const tvSym = (assetObj && assetObj.tv) ? assetObj.tv : "FX:EURUSD";

    new TradingView.widget({
        width: "100%",
        height: "100%",
        symbol: tvSym,
        interval: tf,
        timezone: "Africa/Nairobi",
        theme: "dark",
        style: "1",
        locale: "en",
        toolbar_bg: "#030712",
        studies: ["STD;EMA", "STD;RSI", "STD;Directional_Movement"],
        container_id: "tradingview_advanced_chart"
    });
}

function buildCommandString(sym, st, gate) {
    const runsCap = getSelectedRunsTarget(DEFAULT_RUNS_TARGET);
    const marketLabel = gate.isApproved ? sym : 'NULL_SIGNAL';
    return `RF_SMC_TIME(Market=${marketLabel}, Contract=${st.strategy.api}, Entry=${st.entryPoint}, TF=${st.timeframe}m, Hold=${st.holdMinutes}m, Runs=${runsCap}, Grade=${gate.approvalLabel})`;
}

function updatePnlDisplay() {
    const badge = document.getElementById('pnl-summary-badge');
    const scoreEl = document.getElementById('metric-score');
    const streakEl = document.getElementById('noise-readout');
    const maxStreak = parseInt(document.getElementById('max-loss-streak')?.value, 10) || 2;

    if (badge) {
        const sign = sessionNetPnl >= 0 ? '+' : '';
        badge.innerText = `NET P&L: ${sign}$${sessionNetPnl.toFixed(2)}`;
        badge.className = sessionNetPnl >= 0
            ? "text-[10px] font-bold text-slate-950 bg-fxgreen px-2.5 py-1 rounded"
            : "text-[10px] font-bold text-white bg-rose-600 px-2.5 py-1 rounded";
    }
    if (scoreEl) scoreEl.innerText = `${sessionWins}W / ${sessionLosses}L`;
    if (streakEl) streakEl.innerText = `${consecutiveLosses}/${maxStreak}`;
}

function updateSignalUI(sym) {
    const st = marketDataStore[sym];
    if (!st) return;

    const runsCap = getSelectedRunsTarget(DEFAULT_RUNS_TARGET);
    st.runsTarget = runsCap;
    const gate = evaluateRiseFallSmcApproval(st);
    const cmdStr = buildCommandString(sym, st, gate);

    if (typeof highlightActiveBoat === 'function') {
        highlightActiveBoat(st.strategy.boatId);
    }

    const filterBadge = document.getElementById('side-signal-live-badge');
    if (filterBadge) {
        filterBadge.innerText = gate.isApproved ? 'SMC A+ APPROVED' : 'NULL SIGNAL';
        filterBadge.className = gate.isApproved
            ? 'text-[9px] font-black bg-fxgreen text-slate-950 px-2 py-0.5 rounded'
            : 'text-[9px] font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded';
    }

    document.getElementById('chart-title-label').innerText = `${st.name} (${sym}) • ${st.timeframe}m • ${st.strategy.name} • ${st.smcZone}`;
    document.getElementById('live-tick-symbol-tag').innerText = sym;
    document.getElementById('live-entry-badge').innerText = st.entryPoint;
    document.getElementById('adaptive-shift-status').innerText = gate.isApproved
        ? `Approved -> ${st.name} | Entry ${st.entryPoint} | ${st.strategy.name} | TF ${st.timeframe}m • Hold ${st.holdMinutes}m • Max ${runsCap} Runs`
        : `NULL SIGNAL (${gate.statusText}) — Shifting Timeframes & Synthetic Assets...`;

    document.getElementById('side-sig-asset').innerText = gate.isApproved ? `${sym} (${getMarketTypeLabel(st.market)})` : 'NULL SIGNAL';
    document.getElementById('side-sig-contract').innerText = gate.isApproved ? st.strategy.name : 'NULL SIGNAL';
    document.getElementById('side-sig-entry').innerText = st.entryPoint;
    document.getElementById('side-sig-candle').innerText = `${st.timeframe}m Candle`;
    document.getElementById('side-sig-hold').innerText = `${st.holdMinutes}m Hold`;
    document.getElementById('side-sig-runs').innerText = `${st.runsCompleted} / ${runsCap} Runs`;
    document.getElementById('side-sig-boat').innerText = aiBoatsDirectory[st.strategy.boatId].name;
    document.getElementById('side-sig-command').innerText = cmdStr;

    const expBox = document.getElementById('expectancy-warning-box');
    const expBe = document.getElementById('exp-breakeven-rate');
    const expText = document.getElementById('exp-asymmetry-text');
    const expVerdict = document.getElementById('exp-filter-verdict');

    if (expBe && expText && expVerdict && expBox) {
        expBe.innerText = st.smcZone;
        expText.innerText = gate.statusText;
        expVerdict.innerText = gate.isApproved
            ? `Firm Entry ${st.entryPoint} • Time Hold ${st.holdMinutes}m • Max ${runsCap} Runs`
            : `NULL SIGNAL Active — Shifting TF & Synthetic Markets for Playbook + SMC A+ Approval`;
        expVerdict.className = gate.isApproved ? 'text-[9px] font-bold text-fxgreen' : 'text-[9px] font-bold text-amber-300';
        expBox.className = gate.isApproved
            ? 'bg-emerald-950/50 border border-fxgreen/50 rounded-xl p-2.5 space-y-1 text-[10px]'
            : 'bg-amber-950/60 border border-amber-500/60 rounded-xl p-2.5 space-y-1 text-[10px]';
    }

    document.getElementById('man-asset').innerText = gate.isApproved ? `${sym} @ ${st.entryPoint}` : 'NULL SIGNAL';
    document.getElementById('man-strat').innerText = gate.isApproved ? st.strategy.name : 'NULL SIGNAL';
    document.getElementById('man-trigger').innerText = `${st.timeframe}m • Hold ${st.holdMinutes}m • ${runsCap} Runs`;

    document.getElementById('stable-entry-digit-display').innerText = st.entryPoint;
    document.getElementById('momentum-readout').innerText = `${st.timeframe}m / ${st.holdMinutes}m`;
    document.getElementById('streak-lock-badge').innerText = `RUNS: ${st.runsCompleted}/${runsCap}`;

    document.getElementById('metric-adx').innerText = st.smcZone.split(' ').slice(0, 2).join(' ');
    document.getElementById('metric-rsi').innerText = st.rsi;
    const emaEl = document.getElementById('metric-ema');
    if (emaEl) {
        emaEl.innerText = st.emaBias;
        emaEl.className = st.emaBias === 'BULLISH' ? 'text-fxgreen font-bold' : 'text-rose-400 font-bold';
    }
    document.getElementById('metric-wick').innerText = st.wickRatio.toFixed(2);
    document.getElementById('metric-ou-rate').innerText = gate.approvalLabel;

    updatePnlDisplay();
}

function getSetupPool() {
    if (currentParityFilter === 'rise') {
        return RISE_FALL_TIME_SETUPS.filter(s => s.direction === 'rise');
    }
    if (currentParityFilter === 'fall') {
        return RISE_FALL_TIME_SETUPS.filter(s => s.direction === 'fall');
    }
    return RISE_FALL_TIME_SETUPS;
}

function pickNextSetupFromPool(preferredDir = null) {
    const pool = getSetupPool();
    if (preferredDir) {
        const match = RISE_FALL_TIME_SETUPS.find(s => s.direction === preferredDir);
        if (match) return match;
    }
    if (pool.length === 0) return RISE_FALL_TIME_SETUPS[0];
    signalCycleCursor = (signalCycleCursor + 1) % pool.length;
    return pool[signalCycleCursor];
}

function findNextApprovedMarket(candidates) {
    for (let i = 0; i < candidates.length; i++) {
        const asset = candidates[i];
        const st = marketDataStore[asset.symbol];
        if (!st) continue;
        const preferredDir = st.emaBias === 'BULLISH' ? 'rise' : 'fall';
        const matchingSetup = RISE_FALL_TIME_SETUPS.find(s => s.direction === preferredDir) || RISE_FALL_TIME_SETUPS[0];

        for (let tIdx = 0; tIdx < DEFAULT_MINUTE_TIMEFRAMES.length; tIdx++) {
            const tf = DEFAULT_MINUTE_TIMEFRAMES[(tIdx + i) % DEFAULT_MINUTE_TIMEFRAMES.length];
            const prevTf = st.timeframe;
            const prevStrat = { ...st.strategy };
            st.timeframe = tf;
            st.strategy = { ...matchingSetup, holdMinutes: getSelectedHoldMinutes() };
            const gate = evaluateRiseFallSmcApproval(st);
            if (gate.isApproved) {
                return { asset, timeframe: tf, strategy: matchingSetup };
            }
            st.timeframe = prevTf;
            st.strategy = prevStrat;
        }
    }
    return null;
}

function selectSymbol(sym, name, rotateStrategy = true) {
    currentSymbol = sym;
    shiftCountdown = rotationIntervalSec;
    const st = marketDataStore[sym];
    if (!st) return;

    st.runsCompleted = 0;
    const holdMin = getSelectedHoldMinutes();
    if (rotateStrategy) {
        const preferredDir = currentParityFilter === 'all' ? (st.emaBias === 'BULLISH' ? 'rise' : 'fall') : null;
        const nextStrat = pickNextSetupFromPool(preferredDir);
        st.strategy = { ...nextStrat, holdMinutes: holdMin };
        st.holdMinutes = holdMin;
        st.runsTarget = getSelectedRunsTarget(DEFAULT_RUNS_TARGET);
        const calc = computeSmcEntryAndIndicators(st.priceHistory, st.adx, st.wickRatio, st.strategy.direction, st.pip);
        st.entryPoint = calc.entryPoint;
        st.entryLockedDir = st.strategy.direction;
    } else {
        st.holdMinutes = holdMin;
        st.strategy.holdMinutes = holdMin;
        st.runsTarget = getSelectedRunsTarget(DEFAULT_RUNS_TARGET);
    }

    activeCandleTf = st.timeframe;
    changeChartTimeframe(activeCandleTf, false);
    updateSignalUI(sym);

    const gate = evaluateRiseFallSmcApproval(st);
    logTransaction(
        gate.isApproved
            ? `Approved -> ${name} (${sym}) | Entry ${st.entryPoint} | ${st.strategy.name} | ${st.timeframe}m • Hold ${st.holdMinutes}m • Max ${st.runsTarget} Runs`
            : `Shifted -> ${name} (${sym}) [${st.timeframe}m] — ${gate.statusText}`,
        gate.isApproved
    );

    if (window.derivApiInstance) {
        window.derivApiInstance.subscribeTicks(sym, handleTick);
    }
    renderScanner();
}

function pickNextRotatedAsset() {
    const pool = currentCategory === 'all'
        ? exhaustiveAssets
        : exhaustiveAssets.filter(a => a.market === currentCategory);
    if (pool.length === 0) return exhaustiveAssets[0];

    const ordered = [];
    for (let i = 1; i <= pool.length; i++) {
        ordered.push(pool[(rotationCursor + i) % pool.length]);
    }

    const approvedMatch = findNextApprovedMarket(ordered);
    if (approvedMatch) {
        rotationCursor = pool.findIndex(a => a.symbol === approvedMatch.asset.symbol);
        const mSt = marketDataStore[approvedMatch.asset.symbol];
        mSt.timeframe = approvedMatch.timeframe;
        mSt.strategy = { ...approvedMatch.strategy, holdMinutes: getSelectedHoldMinutes() };
        const calc = computeSmcEntryAndIndicators(mSt.priceHistory, mSt.adx, mSt.wickRatio, mSt.strategy.direction, mSt.pip);
        mSt.entryPoint = calc.entryPoint;
        mSt.entryLockedDir = mSt.strategy.direction;
        return approvedMatch.asset;
    }

    rotationCursor = (rotationCursor + 1) % pool.length;
    const nextAsset = pool[rotationCursor];
    const nextSt = marketDataStore[nextAsset.symbol];
    const tfIdx = DEFAULT_MINUTE_TIMEFRAMES.indexOf(nextSt.timeframe);
    nextSt.timeframe = DEFAULT_MINUTE_TIMEFRAMES[(tfIdx + 1) % DEFAULT_MINUTE_TIMEFRAMES.length];
    return nextAsset;
}

function forceNextMarketShift() {
    const nextAsset = pickNextRotatedAsset();
    if (nextAsset) {
        selectSymbol(nextAsset.symbol, nextAsset.name, true);
    }
}

function startActiveRotationLoop() {
    if (shiftTimer) clearInterval(shiftTimer);
    updateRotationIntervalFromInput();
    shiftCountdown = rotationIntervalSec;

    shiftTimer = setInterval(() => {
        shiftCountdown--;
        const pill = document.getElementById('shift-countdown-pill');
        if (pill) pill.innerText = `${Math.max(1, shiftCountdown)}s`;

        if (shiftCountdown <= 0) {
            shiftCountdown = rotationIntervalSec;
            forceNextMarketShift();
        }
    }, 1000);
}

function renderScanner() {
    const list = document.getElementById('scanner-market-list');
    if (!list) return;
    list.innerHTML = '';

    const aPlusFirst = document.getElementById('high-hit-bias-toggle')?.checked;
    let filtered = currentCategory === 'all'
        ? exhaustiveAssets
        : exhaustiveAssets.filter(a => a.market === currentCategory);

    if (currentParityFilter === 'rise') {
        filtered = filtered.filter(a => marketDataStore[a.symbol].strategy.direction === 'rise');
    } else if (currentParityFilter === 'fall') {
        filtered = filtered.filter(a => marketDataStore[a.symbol].strategy.direction === 'fall');
    } else if (currentParityFilter === 'aplus') {
        filtered = filtered.filter(a => evaluateRiseFallSmcApproval(marketDataStore[a.symbol]).isApproved);
    }

    if (filtered.length === 0) {
        list.innerHTML = `<div class="text-amber-300 text-center py-4 bg-amber-950/30 rounded-xl border border-amber-500/40">NULL SIGNAL — No synthetic index matches this Rise/Fall SMC filter right now.</div>`;
        return;
    }

    const sorted = [...filtered].sort((a, b) => {
        const gateA = evaluateRiseFallSmcApproval(marketDataStore[a.symbol]);
        const gateB = evaluateRiseFallSmcApproval(marketDataStore[b.symbol]);
        const flagA = gateA.isApproved ? 1 : 0;
        const flagB = gateB.isApproved ? 1 : 0;
        if (aPlusFirst && flagB !== flagA) return flagB - flagA;
        return gateB.score - gateA.score;
    });

    sorted.forEach(m => {
        const st = marketDataStore[m.symbol];
        const gate = evaluateRiseFallSmcApproval(st);
        const runsCap = getSelectedRunsTarget(DEFAULT_RUNS_TARGET);
        const isSel = m.symbol === currentSymbol;
        const tickColor = st.lastTickDir === 'up' ? 'tick-up' : 'tick-down';

        const div = document.createElement('div');
        div.onclick = () => selectSymbol(m.symbol, m.name, true);
        div.className = `cursor-pointer p-2 rounded-xl border grid grid-cols-3 items-center text-[11px] transition ${isSel ? 'bg-emerald-950/70 border-fxgreen shadow-[0_0_10px_rgba(0,255,136,0.3)]' : 'bg-slate-900 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850'}`;
        div.innerHTML = `
            <div><div class="font-bold text-white truncate">${m.name}</div><div class="text-[9px] text-cyan-400">${st.timeframe}m • Hold ${st.holdMinutes}m • ADX ${st.adx}</div></div>
            <div class="text-right"><div class="font-bold font-mono ${tickColor}" id="price-${m.symbol}">${st.price}</div><div class="text-[9px] text-gold truncate">${gate.isApproved ? st.strategy.shortName : 'NULL'} @ ${st.entryPoint}</div></div>
            <div class="text-right font-mono"><div class="${gate.isApproved ? 'text-fxgreen' : 'text-amber-300'} font-bold text-[10px]">${gate.isApproved ? 'A+' : 'NULL'} • ${runsCap}R</div><div class="text-[9px] text-slate-400">${isSel ? 'ACTIVE' : 'QUEUED'}</div></div>
        `;
        list.appendChild(div);
    });
}

function haltWithGuardrail(reason) {
    activeAutomationMode = null;
    document.getElementById('tx-status-pill').innerText = `🛑 Guardrail Halt & Shift: ${reason}`;
    logTransaction(`GUARDRAIL HALT (${reason}) — Shifting to Next Rise/Fall SMC Time Setup — ELHADARTGLOBALFX`, true);
    if (typeof triggerProfitAlert === 'function') {
        triggerProfitAlert(reason, sessionNetPnl);
    }
    forceNextMarketShift();
}

function settleSimulatedOutcome(stake, strategy, isApproved) {
    const winProb = isApproved ? 0.63 : 0.45;
    const isWin = Math.random() < winProb;

    if (isWin) {
        const profit = Number((stake * strategy.payoutMult).toFixed(2));
        sessionWins++;
        consecutiveLosses = 0;
        sessionNetPnl = Number((sessionNetPnl + profit).toFixed(2));
        simulatedBalance = Number((simulatedBalance + profit).toFixed(2));
        return { isWin: true, delta: profit };
    } else {
        const loss = Number(stake.toFixed(2));
        sessionLosses++;
        consecutiveLosses++;
        sessionNetPnl = Number((sessionNetPnl - loss).toFixed(2));
        simulatedBalance = Number(Math.max(0, simulatedBalance - loss).toFixed(2));
        return { isWin: false, delta: -loss };
    }
}

function handleTick(tick) {
    const sym = tick.symbol;
    const q = Number(tick.quote);
    if (isNaN(q)) return;

    const st = marketDataStore[sym];
    if (!st) return;

    const prevPrice = parseFloat(st.price);
    const pipSize = tick.pip_size || st.pip || 2;
    st.price = q.toFixed(pipSize);
    st.lastTickDir = q >= prevPrice ? 'up' : 'down';

    st.priceHistory.push(q);
    if (st.priceHistory.length > 35) st.priceHistory.shift();

    const calc = computeSmcEntryAndIndicators(st.priceHistory, st.adx, st.wickRatio, st.strategy.direction, pipSize);
    st.adx = calc.adx;
    st.rsi = calc.rsi;
    st.emaBias = calc.emaBias;

    const prevNoise = st.wickRatio;
    st.wickRatio = calc.noiseRatio;

    const maxWick = parseFloat(document.getElementById('filter-max-wick')?.value) || 0.40;
    const noisyDisruption = st.wickRatio > (maxWick + 0.12) && prevNoise <= (maxWick + 0.12);
    const momentumShifted = st.entryLockedDir && (
        (st.entryLockedDir === 'rise' && st.emaBias === 'BEARISH') ||
        (st.entryLockedDir === 'fall' && st.emaBias === 'BULLISH')
    );

    // Entry point stays firm unless noise disrupts the market or momentum shifts direction
    if (noisyDisruption || momentumShifted || !st.entryPoint) {
        st.entryPoint = calc.entryPoint;
        st.entryLockedDir = st.emaBias === 'BULLISH' ? 'rise' : 'fall';
        if (sym === currentSymbol) {
            logTransaction(
                noisyDisruption
                    ? `Noise disruption (${st.wickRatio}) on ${sym} — Shifted defined entry point to ${st.entryPoint}`
                    : `Momentum shifted (${st.emaBias}) on ${sym} — Updated defined entry point to ${st.entryPoint}`,
                true
            );
        }
    }

    const priceEl = document.getElementById(`price-${sym}`);
    if (priceEl) {
        priceEl.innerText = st.price;
        priceEl.className = `font-bold font-mono ${st.lastTickDir === 'up' ? 'tick-up' : 'tick-down'}`;
    }

    if (sym === currentSymbol) {
        const bigQuoteEl = document.getElementById('live-big-quote');
        const entryBadgeEl = document.getElementById('live-entry-badge');
        if (bigQuoteEl) {
            bigQuoteEl.innerText = st.price;
            bigQuoteEl.className = st.lastTickDir === 'up' ? 'text-fxgreen font-black' : 'text-rose-400 font-black';
        }
        if (entryBadgeEl) {
            entryBadgeEl.innerText = st.entryPoint;
        }
        document.getElementById('metric-adx').innerText = st.smcZone.split(' ').slice(0, 2).join(' ');
        document.getElementById('metric-rsi').innerText = st.rsi;
        const emaEl = document.getElementById('metric-ema');
        if (emaEl) {
            emaEl.innerText = st.emaBias;
            emaEl.className = st.emaBias === 'BULLISH' ? 'text-fxgreen font-bold' : 'text-rose-400 font-bold';
        }
        document.getElementById('metric-wick').innerText = st.wickRatio.toFixed(2);
        document.getElementById('side-sig-entry').innerText = st.entryPoint;
        document.getElementById('stable-entry-digit-display').innerText = st.entryPoint;
        document.getElementById('man-asset').innerText = `${sym} @ ${st.entryPoint}`;

        const now = Date.now();
        const maxStreak = parseInt(document.getElementById('max-loss-streak')?.value, 10) || 2;
        const maxStopLoss = parseFloat(document.getElementById('session-stop-loss')?.value) || 5.00;
        const runsCap = getSelectedRunsTarget(DEFAULT_RUNS_TARGET);
        st.runsTarget = runsCap;
        const gate = evaluateRiseFallSmcApproval(st);

        if (activeAutomationMode && now >= cooldownUntil && (now - lastExecutionTimestamp > 1200)) {
            if (!gate.isApproved) {
                logTransaction(`Momentum faded or SMC/noise disrupted ${sym} (${gate.statusText}) — Shifting TF & asset...`, true);
                forceNextMarketShift();
                return;
            }

            lastExecutionTimestamp = now;
            st.runsCompleted++;

            const stake = activeAutomationMode === 'BULK'
                ? (parseFloat(document.getElementById('bulk-stake').value) || 1.00)
                : (parseFloat(document.getElementById('manual-stake').value) || 1.00);

            const executorName = activeAutomationMode === 'BOAT'
                ? aiBoatsDirectory[currentActiveBoat].name
                : `${activeAutomationMode} R/F`;

            const holdMinutes = getSelectedHoldMinutes();
            st.holdMinutes = holdMinutes;

            if (!window.derivApiInstance || !window.derivApiInstance.isAuthorized) {
                const outcome = settleSimulatedOutcome(stake, st.strategy, gate.isApproved);
                document.getElementById('account-balance').innerText = `$${simulatedBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
                const tag = outcome.isWin ? `WIN +$${outcome.delta.toFixed(2)}` : `LOSS -$${Math.abs(outcome.delta).toFixed(2)}`;
                logTransaction(`Run ${st.runsCompleted}/${runsCap} | ${executorName} | ${sym} ${st.strategy.shortName} @ ${st.entryPoint} (Hold ${holdMinutes}m) | ${tag}`, !outcome.isWin);

                if (!outcome.isWin) {
                    cooldownUntil = now + 2000;
                    if (consecutiveLosses >= maxStreak) {
                        haltWithGuardrail(`Max Loss Streak (${maxStreak}) Hit`);
                        return;
                    }
                    if (sessionNetPnl <= -Math.abs(maxStopLoss)) {
                        haltWithGuardrail(`Session Stop-Loss (-$${Math.abs(maxStopLoss).toFixed(2)}) Hit`);
                        return;
                    }
                }
            } else {
                window.derivApiInstance.buyContract({
                    symbol: sym,
                    contractType: st.strategy.api,
                    stake: stake,
                    duration: holdMinutes
                });
                logTransaction(`Run ${st.runsCompleted}/${runsCap} | ${executorName} | ${st.strategy.api} sent on ${sym} (${holdMinutes}m time-hold @ ${st.entryPoint}, flat $${stake.toFixed(2)})`);
            }

            updateSignalUI(sym);

            if (activeAutomationMode && st.runsCompleted >= runsCap) {
                const prevMode = activeAutomationMode;
                st.runsCompleted = 0;
                if (prevMode === 'BULK') {
                    logTransaction(`${runsCap}-run time-hold cap completed on ${sym} — Shifting to next Rise/Fall SMC setup...`, true);
                    forceNextMarketShift();
                } else {
                    activeAutomationMode = null;
                    document.getElementById('tx-status-pill').innerText = `${runsCap} Runs Completed • Ready for Next Rise/Fall SMC Signal`;
                    logTransaction(`${runsCap}-run time-hold cycle completed (${executorName}) on ${sym} — Shifting to next approved setup...`, true);
                    forceNextMarketShift();
                }
            }
        }
    }
}

function executeAutomatedManualTrade() {
    const st = marketDataStore[currentSymbol];
    st.runsCompleted = 0;
    st.runsTarget = getSelectedRunsTarget(DEFAULT_RUNS_TARGET);
    st.holdMinutes = getSelectedHoldMinutes();
    consecutiveLosses = 0;
    cooldownUntil = 0;
    activeAutomationMode = 'MANUAL';
    document.getElementById('tx-status-pill').innerText = `🟢 Manual (${currentSymbol} • ${st.strategy.shortName} • Hold ${st.holdMinutes}m • ${st.runsTarget} Runs)...`;
    logTransaction(`Started ${st.runsTarget}-Run Manual Rise/Fall Time Setup on ${currentSymbol} | Entry ${st.entryPoint} | ${st.strategy.name} | ${st.timeframe}m TF • Hold ${st.holdMinutes}m`, true);
}

function executeAutomatedBulkTrade() {
    const count = parseInt(document.getElementById('bulk-count').value, 10) || 5;
    const pool = currentCategory === 'all'
        ? exhaustiveAssets
        : exhaustiveAssets.filter(a => a.market === currentCategory);
    const basket = pool.slice(0, count);

    if (basket.length === 0) return;

    selectSymbol(basket[0].symbol, basket[0].name, false);
    marketDataStore[currentSymbol].runsCompleted = 0;
    consecutiveLosses = 0;
    cooldownUntil = 0;
    activeAutomationMode = 'BULK';
    document.getElementById('tx-status-pill').innerText = `🟢 Bulk Rise/Fall Time Rotating (${basket.map(a => a.symbol).join(', ')})...`;
    logTransaction(`Armed Bulk Rise/Fall SMC Time Basket (${basket.length} markets): ${basket.map(a => a.symbol).join(', ')}`, true);
}

function startBoatAutomation(boatId) {
    const st = marketDataStore[currentSymbol];
    const fallBoats = [2, 4, 6];
    const desiredDir = fallBoats.includes(Number(boatId)) ? 'fall' : 'rise';
    const matchedSetup = RISE_FALL_TIME_SETUPS.find(s => s.direction === desiredDir) || RISE_FALL_TIME_SETUPS[0];
    const holdMin = getSelectedHoldMinutes();

    st.strategy = { ...matchedSetup, holdMinutes: holdMin, boatId: Number(boatId) };
    st.holdMinutes = holdMin;
    st.runsTarget = getSelectedRunsTarget(DEFAULT_RUNS_TARGET);
    st.runsCompleted = 0;
    consecutiveLosses = 0;
    cooldownUntil = 0;

    activeAutomationMode = 'BOAT';
    updateSignalUI(currentSymbol);
    document.getElementById('tx-status-pill').innerText = `🟢 ${aiBoatsDirectory[boatId].name} (Hold ${st.holdMinutes}m • ${st.runsTarget} Runs)...`;
    logTransaction(`Running ${aiBoatsDirectory[boatId].name} on ${currentSymbol} | Entry ${st.entryPoint} | ${st.strategy.name} | Hold ${st.holdMinutes}m • ${st.runsTarget} Runs`, true);
}

function stopAllAutomation() {
    activeAutomationMode = null;
    if (marketDataStore[currentSymbol]) {
        marketDataStore[currentSymbol].runsCompleted = 0;
        updateSignalUI(currentSymbol);
    }
    document.getElementById('tx-status-pill').innerText = "🛑 Active Runs Stopped • Rise/Fall SMC Scanner Running";
    logTransaction("Active trade runs stopped. Rise/Fall Playbook + SMC A+ scanner and market/timeframe rotation remain active.", true);
}

function copySideSignalSettings() {
    const st = marketDataStore[currentSymbol];
    const runsCap = getSelectedRunsTarget(DEFAULT_RUNS_TARGET);
    const gate = evaluateRiseFallSmcApproval(st);
    const cmd = buildCommandString(currentSymbol, st, gate);
    const summary = `ELHADART RISE / FALL SMC TIME-HOLD SIGNAL\nMarket: ${gate.isApproved ? `${st.name} (${currentSymbol})` : 'NULL SIGNAL'}\nContract: ${st.strategy.name} | Defined Entry Point: ${st.entryPoint}\nPlaybook: ${st.playbook} | SMC Zone: ${st.smcZone}\nCandle TF: ${st.timeframe}m | Time to Hold: ${st.holdMinutes}m | Runs Cap: ${runsCap}\nIndicators: ADX ${st.adx} | RSI ${st.rsi} | EMA20 ${st.emaBias} | Noise ${st.wickRatio.toFixed(2)}\nApproval: ${gate.statusText}\nCommand: ${cmd}`;
    navigator.clipboard?.writeText(summary);
    alert(`📋 Copied Rise/Fall SMC Time-Hold Signal:\n\n${summary}`);
}

function bootPlatform() {
    let totalSeconds = 90;
    const pBar = document.getElementById('splash-progress-bar');
    const cTxt = document.getElementById('splash-countdown-text');

    const countdownInterval = setInterval(() => {
        totalSeconds--;
        const mins = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
        const secs = String(totalSeconds % 60).padStart(2, '0');
        if (cTxt) cTxt.innerText = `Loading Rise/Fall SMC Time-Hold Scanner: ${mins}:${secs} (Live Synthetic Ticks Active)`;
        if (pBar) pBar.style.width = `${((90 - totalSeconds) / 90) * 100}%`;

        if (totalSeconds <= 0) {
            clearInterval(countdownInterval);
            dismissSplash();
        }
    }, 1000);

    document.getElementById('header-asset-count').innerText = `${exhaustiveAssets.length} Synthetic Markets (Vol • Vol 1s • Jump) • CALL/PUT • Time-Hold Only • SMC A+ Playbook • Max 6 Runs`;
    selectSymbol(exhaustiveAssets[0].symbol, exhaustiveAssets[0].name, false);
    renderScanner();
    startActiveRotationLoop();

    if (typeof DerivAPIConnector !== 'undefined') {
        const api = new DerivAPIConnector(DERIV_APP_ID);
        window.derivApiInstance = api;
        api.onAccountsLoaded = (accounts, selectedId) => {
            const sel = document.getElementById('account-selector');
            if (sel && accounts.length > 0) {
                sel.innerHTML = accounts.map(a => `<option value="${a.account}" ${a.account === selectedId ? 'selected' : ''}>${a.account} (${a.isVirtual ? 'Demo' : 'Real'})</option>`).join('');
                sel.classList.remove('hidden');
            }
        };
        api.onBalanceUpdate = (b) => {
            document.getElementById('account-balance').innerText = `$${Number(b.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
            const badge = document.getElementById('oauth-connection-badge');
            if (badge && b.loginid) {
                badge.innerText = `🟢 Connected (${b.loginid})`;
                badge.className = "text-[10px] font-mono font-bold text-fxgreen bg-emerald-950 px-2.5 py-1 rounded border border-fxgreen/40";
            }
        };
        api.onContractPurchased = (buyData) => {
            logTransaction(`Deriv Rise/Fall Time #${buyData.contract_id} Executed | Payout: $${buyData.payout}`);
        };
        api.connect(exhaustiveAssets).then(() => {
            api.subscribeTicks(currentSymbol, handleTick);
            api.subscribeMultipleTicks(exhaustiveAssets.map(a => a.symbol), handleTick);
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootPlatform);
} else {
    bootPlatform();
}
