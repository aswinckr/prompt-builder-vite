import React from "react";
import { Settings, LogOut } from "lucide-react";
import { Modal } from "./Modal";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn?: boolean;
  onSignIn?: () => void;
}

/**
 * ProfileModal component displays user profile information and settings
 */
export function ProfileModal({
  isOpen,
  onClose,
  isLoggedIn = false,
  onSignIn,
}: ProfileModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Profile Settings"
      size="md"
      mobileBehavior="fullscreen"
      aria-labelledby="profile-modal-title"
    >
      {/* Modal Content */}
      <div className="p-6">
        {isLoggedIn ? (
          <>
            {/* User Info */}
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-600">
                <span className="text-2xl font-semibold text-neutral-300">
                  JD
                </span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">John Doe</h3>
                <p className="text-sm text-neutral-400">john.doe@example.com</p>
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
              <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-400 transition-colors hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-red-500">
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <p className="text-sm text-neutral-400">
                Sign in to access your profile and saved prompts
              </p>
            </div>
            <button
              onClick={onSignIn}
              className="flex w-full max-w-xs items-center justify-center gap-3 rounded-lg bg-white px-6 py-3 font-medium text-gray-900 transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-900"
            >
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
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
