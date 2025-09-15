import React, { useState } from 'react';
import { Download, X, Smartphone, Monitor, Info } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallBannerProps {
  className?: string;
  variant?: 'banner' | 'card' | 'modal';
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ 
  className = '', 
  variant = 'banner' 
}) => {
  const {
    isInstallable,
    isInstalled,
    isStandalone,
    platform,
    showInstallBanner,
    promptInstall,
    dismissInstallBanner,
    getInstallInstructions,
    isPWASupported
  } = usePWAInstall();

  const [showInstructions, setShowInstructions] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // Don't show if already installed or not supported
  if (isInstalled || isStandalone || !isPWASupported) {
    return null;
  }

  // Don't show banner variant if not prompted to show
  if (variant === 'banner' && !showInstallBanner) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);
    
    try {
      if (isInstallable) {
        const success = await promptInstall();
        if (!success) {
          // Show manual instructions for platforms that don't support prompt
          setShowInstructions(true);
        }
      } else {
        // Show manual instructions
        setShowInstructions(true);
      }
    } catch (error) {
      console.error('Install failed:', error);
      setShowInstructions(true);
    } finally {
      setIsInstalling(false);
    }
  };

  const instructions = getInstallInstructions();
  const isIOS = platform === 'ios';
  const isMobile = platform === 'ios' || platform === 'android';

  if (showInstructions) {
    return (
      <InstallInstructionsModal
        instructions={instructions}
        onClose={() => setShowInstructions(false)}
        className={className}
      />
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-green-500 to-green-600 text-white p-4 ${className}`}>
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            {isMobile ? (
              <Smartphone className="w-6 h-6 flex-shrink-0" />
            ) : (
              <Monitor className="w-6 h-6 flex-shrink-0" />
            )}
            <div>
              <h3 className="font-semibold text-lg">Install Farm Management App</h3>
              <p className="text-green-100 text-sm">
                Get quick access and work offline with our app
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isInstalling ? (
                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Install
            </button>
            
            <button
              onClick={dismissInstallBanner}
              className="text-green-100 hover:text-white p-2 rounded-lg transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg shadow-sm p-6 ${className}`}>
        <div className="flex items-start gap-4">
          <div className="bg-green-100 p-3 rounded-lg">
            {isMobile ? (
              <Smartphone className="w-6 h-6 text-green-600" />
            ) : (
              <Monitor className="w-6 h-6 text-green-600" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 mb-2">
              Install Farm Management App
            </h3>
            <p className="text-gray-600 mb-4">
              Install our app for quick access, offline functionality, and a better experience.
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isInstalling ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Install App
              </button>
              
              <button
                onClick={() => setShowInstructions(true)}
                className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Info className="w-4 h-4" />
                How to install
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Install instructions modal
const InstallInstructionsModal: React.FC<{
  instructions: {
    title: string;
    steps: string[];
    icon: string;
  };
  onClose: () => void;
  className?: string;
}> = ({ instructions, onClose, className = '' }) => {
  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 ${className}`}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{instructions.icon}</span>
            <h2 className="text-xl font-semibold text-gray-900">
              {instructions.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-3 mb-6">
          {instructions.steps.map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                {index + 1}
              </div>
              <p className="text-gray-700">{step}</p>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

// Compact install button for header/navbar
export const CompactInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isStandalone, promptInstall } = usePWAInstall();
  const [isInstalling, setIsInstalling] = useState(false);

  if (isInstalled || isStandalone || !isInstallable) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      await promptInstall();
    } catch (error) {
      console.error('Install failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <button
      onClick={handleInstall}
      disabled={isInstalling}
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50 ${className}`}
    >
      {isInstalling ? (
        <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      <span className="hidden sm:inline">Install</span>
    </button>
  );
};