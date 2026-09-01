const SESSION_KEY = 'drip-monitor-web-session';

const {
  ALERT_THRESHOLD_SECONDS,
  BAG_OPTIONS: bagOptions,
  DROP_TYPES: dropTypes,
  MEASUREMENT_SECONDS,
  calculateEstimate,
  estimateCurrentRemainingMl,
  formatDuration,
  formatTime,
  positiveNumber
} = window.DripMonitorShared;

const state = {
  selectedDropTypeId: 'standard',
  selectedBagId: '250',
  customVolume: '',
  tapCount: 0,
  session: null,
  measurementTimer: null,
  countdownTimer: null,
  alertSoundPlayed: false
};

const els = {
  setup: document.querySelector('#setup-screen'),
  measure: document.querySelector('#measure-screen'),
  countdownScreen: document.querySelector('#countdown-screen'),
  dropTypeOptions: document.querySelector('#drop-type-options'),
  bagOptions: document.querySelector('#bag-options'),
  customVolumeField: document.querySelector('#custom-volume-field'),
  customVolume: document.querySelector('#custom-volume'),
  remainingAmount: document.querySelector('#remaining-amount'),
  startMeasurement: document.querySelector('#start-measurement'),
  tapButton: document.querySelector('#tap-button'),
  tapCount: document.querySelector('#tap-count'),
  measurementRemaining: document.querySelector('#measurement-remaining'),
  measurementElapsed: document.querySelector('#measurement-elapsed'),
  measureWarning: document.querySelector('#measure-warning'),
  restartMeasurement: document.querySelector('#restart-measurement'),
  alertBox: document.querySelector('#alert-box'),
  acknowledgeAlert: document.querySelector('#acknowledge-alert'),
  countdown: document.querySelector('#countdown'),
  finishTime: document.querySelector('#finish-time'),
  countdownWarning: document.querySelector('#countdown-warning'),
  dropsPerMinute: document.querySelector('#drops-per-minute'),
  mlPerMinute: document.querySelector('#ml-per-minute'),
  remainingNow: document.querySelector('#remaining-now'),
  redoMeasurement: document.querySelector('#redo-measurement'),
  adjustRemaining: document.querySelector('#adjust-remaining'),
  endSession: document.querySelector('#end-session')
};

function remainingMl() { return positiveNumber(els.remainingAmount.value); }

function showScreen(screenName) {
  els.setup.classList.toggle('hidden', screenName !== 'setup');
  els.measure.classList.toggle('hidden', screenName !== 'measure');
  els.countdownScreen.classList.toggle('hidden', screenName !== 'countdown');
}

function renderOptions() {
  els.dropTypeOptions.innerHTML = '';
  dropTypes.forEach((type) => {
    const button = document.createElement('button');
    button.className = `option ${state.selectedDropTypeId === type.id ? 'selected' : ''}`;
    button.type = 'button';
    button.innerHTML = `<strong>${type.label}</strong><span>${type.detail}</span>`;
    button.addEventListener('click', () => {
      state.selectedDropTypeId = type.id;
      renderOptions();
    });
    els.dropTypeOptions.appendChild(button);
  });

  els.bagOptions.innerHTML = '';
  bagOptions.forEach((option) => {
    const button = document.createElement('button');
    button.className = `volume ${state.selectedBagId === option.id ? 'selected' : ''}`;
    button.type = 'button';
    button.textContent = option.label;
    button.addEventListener('click', () => {
      state.selectedBagId = option.id;
      if (option.id === 'custom') {
        els.customVolumeField.classList.remove('hidden');
        els.remainingAmount.value = state.customVolume;
      } else {
        els.customVolumeField.classList.add('hidden');
        els.remainingAmount.value = String(option.value);
      }
      renderOptions();
    });
    els.bagOptions.appendChild(button);
  });
}

function clearTimers() {
  if (state.measurementTimer) clearInterval(state.measurementTimer);
  if (state.countdownTimer) clearInterval(state.countdownTimer);
  state.measurementTimer = null;
  state.countdownTimer = null;
}

function persistSession() {
  if (state.session) localStorage.setItem(SESSION_KEY, JSON.stringify(state.session));
}

function removeSession() {
  state.session = null;
  localStorage.removeItem(SESSION_KEY);
}

function startMeasurement() {
  if (remainingMl() <= 0) {
    alert('请输入大于 0 mL 的剩余液量。');
    return;
  }
  clearTimers();
  removeSession();
  state.tapCount = 0;
  els.tapCount.textContent = '0';
  els.measurementRemaining.textContent = String(MEASUREMENT_SECONDS);
  els.measurementElapsed.textContent = '0';
  els.measureWarning.classList.add('hidden');
  showScreen('measure');
  const startedAt = Date.now();
  state.measurementTimer = setInterval(() => {
    const elapsed = Math.min(MEASUREMENT_SECONDS, Math.floor((Date.now() - startedAt) / 1000));
    const remaining = Math.max(0, MEASUREMENT_SECONDS - elapsed);
    els.measurementElapsed.textContent = String(elapsed);
    els.measurementRemaining.textContent = String(remaining);
    if (remaining === 0) finishMeasurement();
  }, 250);
}

function recordDrop() {
  if (els.measure.classList.contains('hidden')) return;
  state.tapCount += 1;
  els.tapCount.textContent = String(state.tapCount);
  if ('vibrate' in navigator) navigator.vibrate(20);
}

function finishMeasurement() {
  if (state.measurementTimer) clearInterval(state.measurementTimer);
  state.measurementTimer = null;
  if (state.tapCount <= 0) {
    els.measureWarning.classList.remove('hidden');
    return;
  }
  const estimate = calculateEstimate({
    tapCount: state.tapCount,
    remainingMl: remainingMl(),
    dropTypeId: state.selectedDropTypeId
  });
  if (!estimate) {
    els.measureWarning.classList.remove('hidden');
    return;
  }
  state.session = {
    ...estimate,
    bagId: state.selectedBagId,
    customVolume: state.customVolume,
    tapCount: state.tapCount,
    measuredAt: Date.now(),
    alertAcknowledged: false
  };
  state.alertSoundPlayed = false;
  renderCountdownDetails();
  startCountdown();
  persistSession();
  showScreen('countdown');
}

function renderCountdownDetails() {
  if (!state.session) return;
  els.dropsPerMinute.textContent = Number(state.session.dropsPerMinute).toFixed(1);
  els.mlPerMinute.textContent = Number(state.session.mlPerMinute).toFixed(2);
  els.remainingNow.textContent = String(estimateCurrentRemainingMl(state.session));
  els.countdownWarning.classList.toggle('hidden', state.session.tapCount >= 4);
  els.countdownWarning.textContent = `本次仅记录了 ${state.session.tapCount} 滴，估算可信度较低。`;
}

function startCountdown() {
  if (state.countdownTimer) clearInterval(state.countdownTimer);
  updateCountdown();
  state.countdownTimer = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
  if (!state.session) return;
  const remainingSeconds = Math.max(0, Math.ceil((state.session.finishAt - Date.now()) / 1000));
  const shouldAlert = remainingSeconds > 0 && remainingSeconds <= ALERT_THRESHOLD_SECONDS && !state.session.alertAcknowledged;
  els.countdown.textContent = formatDuration(remainingSeconds);
  els.finishTime.textContent = formatTime(state.session.finishAt);
  els.remainingNow.textContent = String(estimateCurrentRemainingMl(state.session));
  els.alertBox.classList.toggle('hidden', !shouldAlert && !(remainingSeconds === 0 && !state.session.alertAcknowledged));
  if ((shouldAlert || remainingSeconds === 0) && !state.alertSoundPlayed) {
    triggerAlertSimulation();
    state.alertSoundPlayed = true;
  }
  if (remainingSeconds === 0 && state.countdownTimer) {
    clearInterval(state.countdownTimer);
    state.countdownTimer = null;
  }
  persistSession();
}

function triggerAlertSimulation() {
  if ('vibrate' in navigator) navigator.vibrate([250, 120, 250]);
  try {
    /** @type {Window & { webkitAudioContext?: typeof AudioContext }} */
    const browserWindow = window;
    const AudioContextConstructor = browserWindow.AudioContext || browserWindow.webkitAudioContext;
    if (!AudioContextConstructor) return;
    const audioContext = new AudioContextConstructor();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.frequency.value = 880;
    gain.gain.value = 0.08;
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.25);
  } catch (error) {
    // 某些浏览器会阻止未交互页面播放声音，但震动和页面提示仍然可用。
  }
}

function acknowledgeAlert() {
  if (state.session) state.session.alertAcknowledged = true;
  els.alertBox.classList.add('hidden');
  persistSession();
}

function adjustRemaining() {
  const estimated = estimateCurrentRemainingMl(state.session);
  clearTimers();
  removeSession();
  state.selectedBagId = 'custom';
  state.customVolume = String(estimated);
  els.customVolume.value = state.customVolume;
  els.remainingAmount.value = state.customVolume;
  els.customVolumeField.classList.remove('hidden');
  renderOptions();
  showScreen('setup');
}

function endSession() {
  clearTimers();
  removeSession();
  state.tapCount = 0;
  state.alertSoundPlayed = false;
  els.tapCount.textContent = '0';
  els.countdown.textContent = '0:00';
  els.finishTime.textContent = '--:--';
  els.alertBox.classList.add('hidden');
  showScreen('setup');
}

function restoreSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    if (!saved.finishAt || saved.finishAt <= Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return;
    }
    state.session = saved;
    state.selectedDropTypeId = saved.dropTypeId || 'standard';
    state.selectedBagId = saved.bagId || 'custom';
    state.customVolume = saved.customVolume || '';
    els.remainingAmount.value = String(estimateCurrentRemainingMl(saved));
    els.customVolume.value = state.customVolume;
    els.customVolumeField.classList.toggle('hidden', state.selectedBagId !== 'custom');
    renderOptions();
    renderCountdownDetails();
    startCountdown();
    showScreen('countdown');
  } catch (error) {
    localStorage.removeItem(SESSION_KEY);
  }
}

function wireEvents() {
  els.customVolume.addEventListener('input', () => {
    state.customVolume = els.customVolume.value;
    state.selectedBagId = 'custom';
    els.remainingAmount.value = els.customVolume.value;
    renderOptions();
  });
  els.remainingAmount.addEventListener('input', () => {
    if (state.selectedBagId === 'custom') {
      state.customVolume = els.remainingAmount.value;
      els.customVolume.value = els.remainingAmount.value;
    }
  });
  els.startMeasurement.addEventListener('click', startMeasurement);
  els.restartMeasurement.addEventListener('click', startMeasurement);
  els.tapButton.addEventListener('click', recordDrop);
  els.acknowledgeAlert.addEventListener('click', acknowledgeAlert);
  els.redoMeasurement.addEventListener('click', startMeasurement);
  els.adjustRemaining.addEventListener('click', adjustRemaining);
  els.endSession.addEventListener('click', endSession);
  window.addEventListener('beforeunload', persistSession);
}

renderOptions();
wireEvents();
restoreSession();
