import React from 'react';
import { Settings, LogOut } from 'lucide-react';
import { Modal } from './Modal';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ProfileModal component displays user profile information and settings
 */
export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
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
        {/* User Info */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-neutral-600 rounded-full flex items-center justify-center">
            <span className="text-2xl font-semibold text-neutral-300">JD</span>
          </div>
          <div>
            <h3 className="text-white font-medium text-lg">John Doe</h3>
            <p className="text-neutral-400 text-sm">john.doe@example.com</p>
          </div>
        </div>

        {/* Account Type */}
        <div className="mb-6 p-4 bg-neutral-700/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Account Type</h4>
              <p className="text-neutral-400 text-sm">Personal Account</p>
            </div>
            <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
              Upgrade to Pro
            </button>
          </div>
        </div>

        {/* Settings Options */}
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-neutral-300 hover:bg-neutral-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-neutral-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}