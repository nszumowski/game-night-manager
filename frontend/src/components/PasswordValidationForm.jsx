import React from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { checkPasswordRequirements } from '../utils/passwordValidation';

const PasswordValidationForm = ({ 
  newPassword, 
  confirmPassword, 
  showCurrentPassword = false, 
  currentPassword,
  onPasswordChange,
  onSubmit,
  submitButtonText,
  isLoading = false
}) => {
  const passwordRequirements = checkPasswordRequirements(newPassword, confirmPassword);
  
  return (
    <div className="space-y-4">
      {showCurrentPassword && (
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Current Password<span className="text-red-500">*</span>
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            value={currentPassword}
            onChange={onPasswordChange}
            className="border p-2 rounded w-full"
            aria-label="Current password"
          />
        </div>
      )}

      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
          {showCurrentPassword ? 'New Password' : 'Password'}
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          value={newPassword}
          onChange={onPasswordChange}
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
          value={confirmPassword}
          onChange={onPasswordChange}
          className="border p-2 rounded w-full"
          aria-label="Confirm password"
        />
      </div>

      <div className="text-sm text-gray-600 mt-1">
        Password must contain:
        <ul className="list-inside space-y-1">
          {Object.entries(passwordRequirements).map(([key, value]) => {
            if (key === 'newConfirmMatch') return null;
            const requirements = {
              minLength: 'At least 8 characters',
              hasUpperCase: 'One uppercase letter',
              hasLowerCase: 'One lowercase letter',
              hasNumbers: 'One number',
              hasSpecialChar: 'One special character (!@#$%^&*(),.?":{}|<>)'
            };
            
            return (
              <li key={key} className={`flex items-center ${value ? 'text-green-600' : 'text-red-600'}`}>
                {value ? <FaCheck className="mr-2 inline" /> : <FaTimes className="mr-2 inline" />}
                {requirements[key]}
              </li>
            );
          })}
          <li className={`flex items-center ${passwordRequirements.newConfirmMatch ? 'text-green-600' : 'text-red-600'}`}>
            {passwordRequirements.newConfirmMatch ? <FaCheck className="mr-2 inline" /> : <FaTimes className="mr-2 inline" />}
            Passwords match
          </li>
        </ul>
      </div>

      <button
        type="submit"
        onClick={onSubmit}
        className={`p-2 rounded transition-colors duration-200 ${
          !Object.values(passwordRequirements).every(Boolean)
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
        disabled={!Object.values(passwordRequirements).every(Boolean) || isLoading}
      >
        {isLoading ? 'Processing...' : submitButtonText}
      </button>
    </div>
  );
};

export default PasswordValidationForm; 