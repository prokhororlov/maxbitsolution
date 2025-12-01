export const validateUsername = (username: string): string | null => {
  const isValid = username.length >= 8;
  return isValid ? null : 'Логин должен содержать минимум 8 символов';
};

export const validatePassword = (password: string): string | null => {
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-ZА-Я]/.test(password);
  const hasNumber = /\d/.test(password);

  if (!hasMinLength) {
    return 'Пароль должен содержать минимум 8 символов';
  }
  if (!hasUpperCase) {
    return 'Пароль должен содержать минимум 1 заглавную букву';
  }
  if (!hasNumber) {
    return 'Пароль должен содержать минимум 1 цифру';
  }
  return null;
};

export const validatePasswordConfirmation = (
  password: string,
  confirmation: string
): string | null => {
  const matches = password === confirmation;
  return matches ? null : 'Пароль не совпадает';
};

