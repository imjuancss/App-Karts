export const formatMsToTime = (ms) => {
  if (!ms || ms === Infinity) return "00:00.000";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
};

export const formatTimeInput = (value) => {
  // Return value directly without intrusive mask mangling
  return value;
};

export const parseTimeToMs = (timeStr) => {
  if (!timeStr) return 0;
  const str = String(timeStr).trim().replace(',', '.');
  if (!str) return 0;

  // Format MM:SS.SSS or MM:SS
  if (str.includes(':')) {
    const parts = str.split(':');
    const mins = parseInt(parts[0], 10) || 0;
    const secParts = (parts[1] || '').split('.');
    const secs = parseInt(secParts[0], 10) || 0;
    let ms = 0;
    if (secParts[1] !== undefined) {
      const msStr = secParts[1].slice(0, 3);
      ms = parseInt(msStr.padEnd(3, '0'), 10) || 0;
    }
    return (mins * 60000) + (secs * 1000) + ms;
  }

  // Format SS.SSS or SS
  if (str.includes('.')) {
    const parts = str.split('.');
    const totalSecs = parseInt(parts[0], 10) || 0;
    const msStr = (parts[1] || '').slice(0, 3);
    const ms = parseInt(msStr.padEnd(3, '0'), 10) || 0;

    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return (mins * 60000) + (secs * 1000) + ms;
  }

  // Pure digits without dot or colon (e.g. "44", "52")
  const secs = parseInt(str, 10);
  if (!isNaN(secs)) {
    return secs * 1000;
  }

  return 0;
};

export const formatGap = (leaderMs, currentMs) => {
  if (leaderMs === currentMs) return 'Leader';
  const diff = currentMs - leaderMs;
  const seconds = Math.floor(diff / 1000);
  const milliseconds = diff % 1000;
  return `+${seconds}.${milliseconds.toString().padStart(3, '0')}s`;
};
