export const validateUsername = (username: string): string | null => {
  const isValid = username.length >= 8;
  return isValid ? null : 'Логин должен содержать минимум 8 символов';
};

export const validatePassword = (password: string): string | null => {
  if (password.length < 8) return 'Пароль должен содержать минимум 8 символов';
  if (!/[A-ZА-Я]/.test(password)) return 'Пароль должен содержать минимум 1 заглавную букву';
  if (!/\d/.test(password)) return 'Пароль должен содержать минимум 1 цифру';
  return null;
};

export const validatePasswordConfirmation = (
  password: string,
  confirmation: string
): string | null => {
  const matches = password === confirmation;
  return matches ? null : 'Пароль не совпадает';
};

