export const getTicketWord = (count: number): string => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  const isTeen = lastTwoDigits >= 11 && lastTwoDigits <= 19;
  const isOne = lastDigit === 1;
  const isTwoToFour = lastDigit >= 2 && lastDigit <= 4;
  const wordMap: Record<string, string> = {
    'teen': 'билетов',
    'one': 'билет',
    'twoToFour': 'билета',
    'default': 'билетов',
  };
  if (isTeen) return wordMap['teen'];
  if (isOne) return wordMap['one'];
  if (isTwoToFour) return wordMap['twoToFour'];
  return wordMap['default'];
};

export const formatTicketsText = (count: number): string => {
  return `${count} ${getTicketWord(count)}`;
};

