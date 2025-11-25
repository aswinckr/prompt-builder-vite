import React, { useState } from "react";
import { Settings, LogOut, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Modal } from "./Modal";
import { useAuthState, useAuthActions } from "../contexts/AuthContext";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void; // Optional callback for successful authentication
  onAuthFailure?: () => void; // Optional callback for authentication failure/cancellation
}

/**
 * ProfileModal component displays user profile information and settings
 */
export function ProfileModal({
  isOpen,
  onClose,
  onAuthSuccess,
  onAuthFailure,
}: ProfileModalProps) {
  const { user, isLoading, error, isAuthenticated } = useAuthState();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, signOut, clearError } = useAuthActions();

  // Track previous auth state to detect successful authentication
  const [wasAuthenticated, setWasAuthenticated] = useState(isAuthenticated);

  // Check for successful authentication
  React.useEffect(() => {
    if (!wasAuthenticated && isAuthenticated && onAuthSuccess) {
      onAuthSuccess();
    }
    setWasAuthenticated(isAuthenticated);
  }, [isAuthenticated, wasAuthenticated, onAuthSuccess]);

  // Handle authentication failure when modal closes without successful auth
  const handleClose = () => {
    if (!isAuthenticated && onAuthFailure) {
      onAuthFailure();
    }
    clearError(); // Clear any existing errors
    onClose();
  };

  // Form states
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [imageError, setImageError] = useState(false);

  // Reset form when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setSuccessMessage('');
      setAuthTab('signin');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setImageError(false);
    }
  }, [isOpen]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmail(email, password);
      // Modal will be closed by the useEffect that detects successful auth
    } catch (error) {
      // Error is handled by auth context, no additional handling needed
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    try {
      await signUpWithEmail(email, password);
      setSuccessMessage('Account created! Please check your email to confirm your account.');
      setAuthTab('signin');
    } catch (error) {
      // Error is handled by auth context
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      alert('Please enter your email address first');
      return;
    }
    try {
      await resetPassword(email);
      setSuccessMessage('Password reset email sent! Please check your inbox.');
    } catch (error) {
      // Error is handled by auth context
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // Modal will be closed by the useEffect that detects successful auth
    } catch (error) {
      // Error is handled by auth context
    }
  };

  // Handle successful authentication by closing modal and calling callback
  React.useEffect(() => {
    if (isAuthenticated && isOpen) {
      // Small delay to allow auth state to settle
      const timer = setTimeout(() => {
        handleClose();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Profile Settings"
      size="md"
      mobileBehavior="fullscreen"
      aria-labelledby="profile-modal-title"
    >
      {/* Modal Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-600 border-t-white"></div>
            <p className="text-sm text-neutral-400">Loading...</p>
          </div>
        ) : isAuthenticated ? (
          <>
            {/* Error Display */}
            {error && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                <p className="text-sm text-red-400">{error}</p>
                <button
                  onClick={clearError}
                  className="mt-2 text-xs text-red-300 hover:text-red-200 underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* User Info */}
            <div className="mb-6 flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-neutral-600 overflow-hidden">
                {user?.user_metadata?.avatar_url && !imageError ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Avatar"
                    className="h-16 w-16 rounded-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="h-16 w-16 flex items-center justify-center">
                    <span className="text-2xl font-semibold text-neutral-300">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                </h3>
                <p className="text-sm text-neutral-400">{user?.email}</p>
              </div>
            </div>

            {/* Account Type */}
            <div className="mb-6 rounded-lg bg-neutral-700/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Account Type</h4>
                  <p className="text-sm text-neutral-400">Personal Account</p>
                </div>
                <button className="rounded bg-blue-500 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  Upgrade to Pro
                </button>
              </div>
            </div>

            {/* Settings Options */}
            <div className="space-y-2">
              <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-neutral-300 transition-colors hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <Settings size={18} />
                <span>Settings</span>
              </button>
              <button
                onClick={signOut}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-400 transition-colors hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-6">
            {/* Success Message Display */}
            {successMessage && (
              <div className="w-full max-w-md rounded-lg bg-green-500/10 border border-green-500/20 p-3">
                <p className="text-sm text-green-400">{successMessage}</p>
                <button
                  onClick={() => setSuccessMessage('')}
                  className="mt-2 text-xs text-green-300 hover:text-green-200 underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="w-full max-w-md rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                <p className="text-sm text-red-400">{error}</p>
                <button
                  onClick={clearError}
                  className="mt-2 text-xs text-red-300 hover:text-red-200 underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div className="w-full max-w-md">
              <div className="text-center mb-6">
                <p className="text-sm text-neutral-400">
                  Sign in to access your profile and saved prompts
                </p>
              </div>

              {/* Email/Password Authentication */}
              <>
                {/* Sign In/Sign Up Tabs */}
                <div className="mb-6">
                  <div className="flex rounded-lg bg-neutral-800 p-1">
                    <button
                      onClick={() => setAuthTab('signin')}
                      className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        authTab === 'signin'
                          ? 'bg-neutral-700 text-white'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setAuthTab('signup')}
                      className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        authTab === 'signup'
                          ? 'bg-neutral-700 text-white'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={authTab === 'signin' ? handleEmailSignIn : handleEmailSignUp} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full pl-10 pr-10 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {authTab === 'signup' && (
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-300 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          minLength={6}
                          className="w-full pl-10 pr-10 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        {authTab === 'signin' ? 'Signing in...' : 'Creating account...'}
                      </div>
                    ) : (
                      authTab === 'signin' ? 'Sign In' : 'Create Account'
                    )}
                  </button>
                </form>

                {/* Password Reset */}
                {authTab === 'signin' && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={handlePasswordReset}
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}

                {/* Divider */}
                <div className="my-6 flex items-center">
                  <div className="flex-1 border-t border-neutral-700"></div>
                  <span className="px-4 text-sm text-neutral-500">or</span>
                  <div className="flex-1 border-t border-neutral-700"></div>
                </div>

                {/* Google OAuth Button */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-3 rounded-lg bg-white px-6 py-3 font-medium text-gray-900 transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Sign in with Google
                    </>
                  )}
                </button>
              </>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}