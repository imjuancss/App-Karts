export const formatMsToTime = (ms) => {
  if (!ms || ms === Infinity) return "00:00.000";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
};

export const formatTimeInput = (value) => {
  let digits = value.replace(/\D/g, '');
  if (digits.length > 7) digits = digits.slice(0, 7);
  if (!digits) return '';

  if (digits.length >= 5) {
    let ssVal = 0;
    if (digits.length === 5) ssVal = parseInt(digits.slice(0, 2), 10);
    else if (digits.length === 6) ssVal = parseInt(digits.slice(1, 3), 10);
    else if (digits.length === 7) ssVal = parseInt(digits.slice(2, 4), 10);

    if (ssVal > 59) {
      if (digits.length === 5) digits = '59' + digits.slice(2);
      else if (digits.length === 6) digits = digits[0] + '59' + digits.slice(3);
      else if (digits.length === 7) digits = digits.slice(0, 2) + '59' + digits.slice(4);
    }
  }

  const len = digits.length;
  if (len === 1) return `0.00${digits}`;
  if (len === 2) return `0.0${digits}`;
  if (len === 3) return `0.${digits}`;
  if (len === 4) return `${digits[0]}.${digits.slice(1)}`;
  if (len === 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (len === 6) return `${digits[0]}:${digits.slice(1, 3)}.${digits.slice(3)}`;
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}.${digits.slice(4)}`;
};

export const parseTimeToMs = (timeStr) => {
  const parts = timeStr.trim().split(':');
  if (parts.length === 2) {
    const mins = parseInt(parts[0], 10);
    const secsParts = parts[1].split('.');
    const secs = parseInt(secsParts[0], 10);
    const ms = secsParts[1] ? parseInt(secsParts[1].padEnd(3, '0').slice(0, 3), 10) : 0;
    return (mins * 60000) + (secs * 1000) + ms;
  } else if (parts.length === 1) {
    const secsParts = parts[0].split('.');
    const secs = parseInt(secsParts[0], 10);
    const ms = secsParts[1] ? parseInt(secsParts[1].padEnd(3, '0').slice(0, 3), 10) : 0;
    return (secs * 1000) + ms;
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
