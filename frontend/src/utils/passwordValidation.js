const checkPasswordRequirements = (newPassword = '', confirmPassword = '') => {
  return {
    minLength: (newPassword || '').length >= 8,
    hasUpperCase: /[A-Z]/.test(newPassword || ''),
    hasLowerCase: /[a-z]/.test(newPassword || ''),
    hasNumbers: /\d/.test(newPassword || ''),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword || ''),
    newConfirmMatch: newPassword === confirmPassword
  };
};

const validatePassword = (newPassword, confirmPassword = '') => {
  const requirements = checkPasswordRequirements(newPassword, confirmPassword);
  return {
    isValid: Object.values(requirements).every(req => req),
    errors: [
      !requirements.minLength && 'Password must be at least 8 characters',
      !requirements.hasUpperCase && 'Password must contain at least one uppercase letter',
      !requirements.hasLowerCase && 'Password must contain at least one lowercase letter',
      !requirements.hasNumbers && 'Password must contain at least one number',
      !requirements.hasSpecialChar && 'Password must contain at least one special character',
      !requirements.newConfirmMatch && 'Passwords do not match'
    ].filter(Boolean)
  };
};

{/* <div className="space-y-4">
  <div>
    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
      Current Password<span className="text-red-500">*</span>
    </label>
    <input
      id="currentPassword"
      name="currentPassword"
      type="password"
      value={formData.currentPassword}
      onChange={handleInputChange}
      className="border p-2 rounded w-full"
      aria-label="Current password"
    />
  </div>

  <div>
    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
      New Password
    </label>
    <input
      id="newPassword"
      name="newPassword"
      type="password"
      value={formData.newPassword}
      onChange={handleInputChange}
      className="border p-2 rounded w-full"
      aria-label="New password"
    />
  </div>

  <div>
    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
      Confirm Password
    </label>
    <input
      id="confirmPassword"
      name="confirmPassword"
      type="password"
      value={formData.confirmPassword}
      onChange={handleInputChange}
      className="border p-2 rounded w-full"
      aria-label="Confirm password"
    />
  </div>

  <div className="text-sm text-gray-600 mt-1">
    Password must contain:
    <ul className="list-inside">
      <li className={`flex items-center ${passwordRequirements.minLength ? 'text-green-600' : 'text-red-600'}`}>
        {passwordRequirements.minLength ? (
          <FaCheck className="mr-2 inline" />
        ) : (
          <FaTimes className="mr-2 inline" />
        )}
        At least 8 characters
      </li>
      <li className={`flex items-center ${passwordRequirements.hasUpperCase ? 'text-green-600' : 'text-red-600'}`}>
        {passwordRequirements.hasUpperCase ? (
          <FaCheck className="mr-2 inline" />
        ) : (
          <FaTimes className="mr-2 inline" />
        )}
        One uppercase letter
      </li>
      <li className={`flex items-center ${passwordRequirements.hasLowerCase ? 'text-green-600' : 'text-red-600'}`}>
        {passwordRequirements.hasLowerCase ? (
          <FaCheck className="mr-2 inline" />
        ) : (
          <FaTimes className="mr-2 inline" />
        )}
        One lowercase letter
      </li>
      <li className={`flex items-center ${passwordRequirements.hasNumbers ? 'text-green-600' : 'text-red-600'}`}>
        {passwordRequirements.hasNumbers ? (
          <FaCheck className="mr-2 inline" />
        ) : (
          <FaTimes className="mr-2 inline" />
        )}
        One number
      </li>
      <li className={`flex items-center ${passwordRequirements.hasSpecialChar ? 'text-green-600' : 'text-red-600'}`}>
        {passwordRequirements.hasSpecialChar ? (
          <FaCheck className="mr-2 inline" />
        ) : (
          <FaTimes className="mr-2 inline" />
        )}
        One special character (!@#$%^&amp;*(),.?&quot;:{}|&lt;&gt;)
      </li>
      <li className={`flex items-center ${passwordRequirements.newConfirmMatch ? 'text-green-600' : 'text-red-600'}`}>
        {passwordRequirements.newConfirmMatch ? (
          <FaCheck className="mr-2 inline" />
        ) : (
          <FaTimes className="mr-2 inline" />
        )}
        Passwords match
      </li>
    </ul>
  </div>

  <button
    type="button"
    onClick={handlePasswordChange}
    className={`p-2 rounded transition-colors duration-200 ${
      !formData.currentPassword || !formData.newPassword || !formData.confirmPassword
        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
        : 'bg-blue-500 text-white hover:bg-blue-600'
    }`}
    disabled={!formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
  >
    Update Password
  </button>
</div>
</div> */}

// export { checkPasswordRequirements, validatePassword };
// export default validatePassword;
export { checkPasswordRequirements };