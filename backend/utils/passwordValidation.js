const validatePassword = (password) => {
  const requirements = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  return {
    isValid: Object.values(requirements).every(req => req),
    errors: [
      !requirements.minLength && 'Password must be at least 8 characters',
      !requirements.hasUpperCase && 'Password must contain at least one uppercase letter',
      !requirements.hasLowerCase && 'Password must contain at least one lowercase letter',
      !requirements.hasNumbers && 'Password must contain at least one number',
      !requirements.hasSpecialChar && 'Password must contain at least one special character'
    ].filter(Boolean)
  };
};

module.exports = { validatePassword }; 