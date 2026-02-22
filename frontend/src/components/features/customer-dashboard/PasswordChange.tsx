"use client";
import React, { useState } from 'react';
import { Eye, EyeOff, Shield, Check, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface PasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordChangeProps {
  onSave?: () => void;
  onCancel?: () => void;
}

export default function PasswordChange({ onSave, onCancel }: PasswordChangeProps) {
  const { changePassword } = useAuth();
  const [formData, setFormData] = useState<PasswordFormData>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PasswordFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validatePassword = (password: string): string[] => {
    const issues: string[] = [];
    
    if (password.length < 8) {
      issues.push('At least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      issues.push('One uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      issues.push('One lowercase letter');
    }
    if (!/\d/.test(password)) {
      issues.push('One number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      issues.push('One special character');
    }
    
    return issues;
  };

  const getPasswordStrength = (password: string): { strength: number; color: string; text: string } => {
    const issues = validatePassword(password);
    const strength = Math.max(0, 100 - (issues.length * 20));
    
    if (strength === 0) return { strength, color: 'bg-red-500', text: 'Weak' };
    if (strength <= 40) return { strength, color: 'bg-orange-500', text: 'Fair' };
    if (strength <= 60) return { strength, color: 'bg-yellow-500', text: 'Good' };
    if (strength <= 80) return { strength, color: 'bg-green-500', text: 'Strong' };
    return { strength, color: 'bg-green-600', text: 'Very Strong' };
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PasswordFormData, string>> = {};

    if (!formData.oldPassword.trim()) {
      newErrors.oldPassword = 'Current password is required';
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else {
      const issues = validatePassword(formData.newPassword);
      if (issues.length > 0) {
        newErrors.newPassword = 'Password does not meet security requirements';
      }
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.oldPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof PasswordFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (field === 'newPassword' && formData.confirmPassword) {
      if (value !== formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
    if (field === 'confirmPassword' && value === formData.newPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await changePassword(formData.oldPassword, formData.newPassword);
      setIsSuccess(true);
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        onSave?.();
      }, 2000);
    } catch (error) {
      console.error('Error changing password:', error);
      setErrors({ oldPassword: 'Current password is incorrect' });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);
  const passwordIssues = validatePassword(formData.newPassword);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Shield className="text-blue-600" size={24} />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
            <p className="text-sm text-gray-600 mt-1">Update your password to keep your account secure</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {isSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <Check className="text-green-600" size={20} />
            <div>
              <p className="text-green-900 font-medium">Password Changed Successfully</p>
              <p className="text-green-700 text-sm">Your password has been updated.</p>
            </div>
          </div>
        )}

        {/* Current Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.old ? 'text' : 'password'}
              value={formData.oldPassword}
              onChange={(e) => handleInputChange('oldPassword', e.target.value)}
              className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.oldPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your current password"
            />
            <button
              type="button"
              onClick={() => setShowPasswords(prev => ({ ...prev, old: !prev.old }))}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.old ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.oldPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.oldPassword}</p>
          )}
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.new ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.newPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your new password"
            />
            <button
              type="button"
              onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          {formData.newPassword && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Password Strength</span>
                <span className="text-sm font-medium" style={{ color: passwordStrength.color.replace('bg-', 'text-') }}>
                  {passwordStrength.text}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`${passwordStrength.color} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${passwordStrength.strength}%` }}
                ></div>
              </div>
              
              {/* Password Requirements */}
              <div className="mt-3 space-y-1">
                <p className="text-xs font-medium text-gray-700">Password must contain:</p>
                {[
                  { text: 'At least 8 characters', met: formData.newPassword.length >= 8 },
                  { text: 'One uppercase letter', met: /[A-Z]/.test(formData.newPassword) },
                  { text: 'One lowercase letter', met: /[a-z]/.test(formData.newPassword) },
                  { text: 'One number', met: /\d/.test(formData.newPassword) },
                  { text: 'One special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) },
                ].map((requirement, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    {requirement.met ? (
                      <Check className="text-green-600" size={12} />
                    ) : (
                      <X className="text-gray-400" size={12} />
                    )}
                    <span className={requirement.met ? 'text-green-700' : 'text-gray-500'}>
                      {requirement.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {errors.newPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Confirm your new password"
            />
            <button
              type="button"
              onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Security Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Security Tips</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Use a unique password that you don't use for other accounts</li>
            <li>• Consider using a password manager to generate and store strong passwords</li>
            <li>• Enable two-factor authentication for additional security</li>
            <li>• Never share your password with anyone</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <X size={16} />
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || isSuccess}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Shield size={16} />
            )}
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
}