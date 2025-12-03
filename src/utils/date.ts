const isValidDate = (date: Date): boolean => {
  return !isNaN(date.getTime());
};

export const formatDate = (date: Date | string): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!isValidDate(d)) return '';
  const formatter = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
  });
  return formatter.format(d);
};

export const formatTime = (date: Date | string): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!isValidDate(d)) return '';
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const formatDateTime = (date: Date | string): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!isValidDate(d)) return '';
  return `${formatDate(d)} ${formatTime(d)}`;
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const formatMap: Record<string, string> = {
    'both': `${hours}ч ${mins}м`,
    'hours': `${hours}ч`,
    'minutes': `${mins}м`,
  };
  const key = hours > 0 && mins > 0 ? 'both' : hours > 0 ? 'hours' : 'minutes';
  return formatMap[key];
};

