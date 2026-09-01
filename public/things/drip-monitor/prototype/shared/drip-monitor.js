(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.DripMonitorShared = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const MEASUREMENT_SECONDS = 20;
  const ALERT_THRESHOLD_SECONDS = 10 * 60;

  const DROP_TYPES = [
    { id: 'adult', label: '成人', detail: '0.067 mL/滴', mlPerDrop: 0.067 },
    { id: 'standard', label: '标准 / 不确定', detail: '0.05 mL/滴', mlPerDrop: 0.05 },
    { id: 'child', label: '儿童', detail: '0.025 mL/滴', mlPerDrop: 0.025 }
  ];

  const BAG_OPTIONS = [
    { id: '50', label: '50 mL', value: 50 },
    { id: '100', label: '100 mL', value: 100 },
    { id: '250', label: '250 mL', value: 250 },
    { id: '500', label: '500 mL', value: 500 },
    { id: 'custom', label: '自定义', value: 0 }
  ];

  function pad(value) { return String(value).padStart(2, '0'); }

  function formatDuration(totalSeconds) {
    const safeSeconds = Math.max(0, Math.floor(totalSeconds));
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;
    if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`;
    return `${minutes}:${pad(seconds)}`;
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function positiveNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : 0;
  }

  function getDropType(id) {
    return DROP_TYPES.find((item) => item.id === id) || DROP_TYPES[1];
  }

  function calculateEstimate({ tapCount, remainingMl, dropTypeId, now = Date.now() }) {
    const drops = positiveNumber(tapCount);
    const remaining = positiveNumber(remainingMl);
    const dropType = getDropType(dropTypeId);
    if (!drops || !remaining) return null;
    const dropsPerMinute = (drops / MEASUREMENT_SECONDS) * 60;
    const mlPerMinute = dropsPerMinute * dropType.mlPerDrop;
    const remainingMinutes = remaining / mlPerMinute;
    const remainingSeconds = Math.ceil(remainingMinutes * 60);
    return {
      dropTypeId: dropType.id,
      remainingMl: remaining,
      dropsPerMinute,
      mlPerMinute,
      remainingSeconds,
      finishAt: now + remainingSeconds * 1000
    };
  }

  function estimateCurrentRemainingMl(session, now = Date.now()) {
    if (!session || !session.mlPerMinute || !session.finishAt) {
      return positiveNumber(session && session.remainingMl).toFixed(1);
    }
    const remainingMinutes = Math.max(0, (session.finishAt - now) / 60000);
    return Math.max(0, Number((remainingMinutes * session.mlPerMinute).toFixed(1)));
  }

  return {
    ALERT_THRESHOLD_SECONDS,
    BAG_OPTIONS,
    DROP_TYPES,
    MEASUREMENT_SECONDS,
    calculateEstimate,
    estimateCurrentRemainingMl,
    formatDuration,
    formatTime,
    getDropType,
    positiveNumber
  };
});
