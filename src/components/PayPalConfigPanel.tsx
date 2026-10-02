import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Shield, 
  Eye, 
  EyeOff, 
  Save, 
  Check, 
  AlertCircle, 
  Lock, 
  Key, 
  Globe, 
  Webhook,
  Info,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { savePayPalConfig, getPayPalStatus } from '../services/paypalApi';
import type { PayPalConnectionStatus } from '../services/paypalApi';

interface PayPalConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const PayPalConfigPanel: React.FC<PayPalConfigPanelProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<PayPalConnectionStatus>({ connected: false, environment: null });
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  
  const [formData, setFormData] = useState({
    environment: 'live' as 'sandbox' | 'live',
    clientId: '',
    clientSecret: '',
    webhookId: '',
  });

  const [showSecrets, setShowSecrets] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  const loadStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const result = await getPayPalStatus();
      setStatus(result);
      setIsEditing(!result.connected);
    } catch (error) {
      console.error('Failed to load PayPal status:', error);
      setIsEditing(true);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientId.trim()) {
      newErrors.clientId = 'Client ID is required';
    } else if (formData.clientId.includes(' ')) {
      newErrors.clientId = 'Client ID contains invalid spaces';
    }

    if (!formData.environment) {
      newErrors.environment = 'Please select an environment';
    }

    if (!formData.clientSecret.trim()) {
      newErrors.clientSecret = 'Client Secret is required for server-side verification';
    } else if (formData.clientSecret.includes(' ')) {
      newErrors.clientSecret = 'Client Secret contains invalid spaces';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    
    try {
      const result = await savePayPalConfig({
        environment: formData.environment,
        clientId: formData.clientId.trim(),
        clientSecret: formData.clientSecret.trim(),
        webhookId: formData.webhookId.trim(),
      });

      if (result.success) {
        setSaveSuccess(true);
        setIsEditing(false);
        await loadStatus();
        
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setErrors({ submit: result.message || 'Failed to save configuration' });
      }
    } catch (error) {
      setErrors({ submit: 'Failed to save configuration. Please try again.' });
      console.error('Error saving config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleClose = () => {
    setErrors({});
    setSaveSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-gray-900 to-black p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <Settings className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">PayPal Configuration</h2>
                  <p className="text-gray-400 text-sm">Secure payment gateway settings</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6">
            {isCheckingStatus ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-heartsync" />
              </div>
            ) : (
              <>
                <AnimatePresence>
                  {saveSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2"
                    >
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-green-700 font-medium">Configuration saved successfully!</span>
                    </motion.div>
                  )}
                  
                  {errors.submit && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2"
                    >
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <span className="text-red-700 font-medium">{errors.submit}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {status.connected && !isEditing ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-800">PayPal is Connected</span>
                      </div>
                      <p className="text-sm text-green-600">
                        Environment: <span className="font-bold uppercase">{status.environment}</span>
                      </p>
                      {status.clientIdMasked && (
                        <p className="text-sm text-green-600 mt-1">
                          Client ID: <span className="font-mono">...{status.clientIdMasked}</span>
                        </p>
                      )}
                      {status.lastConfigured && (
                        <p className="text-xs text-green-500 mt-1">
                          Last configured: {new Date(status.lastConfigured).toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-700">
                          Your PayPal credentials are securely stored on the backend server. 
                          The Client Secret is never exposed to the browser.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex-1 py-3 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                      >
                        Edit Configuration
                      </button>
                      <button
                        onClick={loadStatus}
                        className="px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-yellow-700">
                        <strong>Admin Only:</strong> Enter your PayPal LIVE business credentials below. 
                        These will be securely encrypted and stored on the backend server.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Globe className="w-4 h-4 inline mr-1.5" />
                        PayPal Environment
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => handleInputChange('environment', 'sandbox')}
                          className={`p-3 rounded-xl border-2 font-medium transition-all ${
                            formData.environment === 'sandbox'
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <span className="block text-sm">Sandbox</span>
                          <span className="text-xs opacity-60">Testing</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInputChange('environment', 'live')}
                          className={`p-3 rounded-xl border-2 font-medium transition-all ${
                            formData.environment === 'live'
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <span className="block text-sm">Live</span>
                          <span className="text-xs opacity-60">Production</span>
                        </button>
                      </div>
                      {errors.environment && (
                        <p className="text-heartsync text-xs mt-1">{errors.environment}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Key className="w-4 h-4 inline mr-1.5" />
                        Client ID
                      </label>
                      <input
                        type="text"
                        value={formData.clientId}
                        onChange={(e) => handleInputChange('clientId', e.target.value)}
                        placeholder="Enter your PayPal Client ID"
                        className={`w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-heartsync/30 transition-all font-mono ${
                          errors.clientId ? 'border-2 border-heartsync' : 'border border-gray-200'
                        }`}
                      />
                      {errors.clientId && (
                        <p className="text-heartsync text-xs mt-1">{errors.clientId}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Lock className="w-4 h-4 inline mr-1.5" />
                        Client Secret
                        <span className="text-xs text-gray-400 ml-1">(Required - backend use only)</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showSecrets ? 'text' : 'password'}
                          value={formData.clientSecret}
                          onChange={(e) => handleInputChange('clientSecret', e.target.value)}
                          placeholder="Enter Client Secret"
                          className={`w-full px-4 py-3 pr-10 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-heartsync/30 transition-all font-mono ${
                            errors.clientSecret ? 'border-2 border-heartsync' : 'border border-gray-200'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecrets(!showSecrets)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.clientSecret && (
                        <p className="text-heartsync text-xs mt-1">{errors.clientSecret}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Webhook className="w-4 h-4 inline mr-1.5" />
                        Webhook ID
                        <span className="text-xs text-gray-400 ml-1">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.webhookId}
                        onChange={(e) => handleInputChange('webhookId', e.target.value)}
                        placeholder="Enter Webhook ID"
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-heartsync/30 transition-all font-mono border border-gray-200"
                      />
                    </div>

                    <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-start gap-2">
                        <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-green-700">
                          <strong>Security Guarantee:</strong> Your Client Secret will be encrypted and stored 
                          securely on the backend server. It will <strong>never</strong> be exposed to the browser 
                          or accessible from the frontend.
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleClose}
                        className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex-1 py-3 bg-heartsync text-white font-semibold rounded-xl hover:bg-heartsync-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Configuration
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PayPalConfigPanel;
