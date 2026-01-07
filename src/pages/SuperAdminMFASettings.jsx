import { useState, useEffect } from 'react';
import { Shield, Copy, CheckCircle, AlertTriangle, Download, Key } from 'lucide-react';
import {
  superAdminMFAStatus,
  superAdminMFASetup,
  superAdminMFAEnable,
  superAdminMFADisable
} from '../services/api';
import { useToastContext } from '../context/ToastContext';
import SEO from '../components/SEO';

export default function SuperAdminMFASettings() {
  const { toast } = useToastContext();
  const [loading, setLoading] = useState(true);
  const [mfaStatus, setMFAStatus] = useState(null);
  const [showSetup, setShowSetup] = useState(false);

  // Setup state
  const [setupData, setSetupData] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);

  // Disable state
  const [showDisable, setShowDisable] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableLoading, setDisableLoading] = useState(false);

  useEffect(() => {
    fetchMFAStatus();
  }, []);

  const fetchMFAStatus = async () => {
    try {
      setLoading(true);
      const data = await superAdminMFAStatus();
      setMFAStatus(data);
    } catch (error) {
      console.error('Failed to fetch MFA status:', error);
      toast.error('Failed to load MFA settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupMFA = async () => {
    try {
      setSetupLoading(true);
      const data = await superAdminMFASetup();
      setSetupData(data);
      setShowSetup(true);
      toast.success('MFA setup initiated. Scan the QR code.');
    } catch (error) {
      console.error('Failed to setup MFA:', error);
      toast.error(error.message || 'Failed to setup MFA');
    } finally {
      setSetupLoading(false);
    }
  };

  const handleEnableMFA = async (e) => {
    e.preventDefault();
    try {
      setSetupLoading(true);
      await superAdminMFAEnable(verificationCode);
      toast.success('MFA enabled successfully!');
      setShowSetup(false);
      setSetupData(null);
      setVerificationCode('');
      fetchMFAStatus();
    } catch (error) {
      console.error('Failed to enable MFA:', error);
      toast.error(error.message || 'Invalid verification code');
    } finally {
      setSetupLoading(false);
    }
  };

  const handleDisableMFA = async (e) => {
    e.preventDefault();
    try {
      setDisableLoading(true);
      await superAdminMFADisable(disablePassword);
      toast.success('MFA disabled successfully');
      setShowDisable(false);
      setDisablePassword('');
      fetchMFAStatus();
    } catch (error) {
      console.error('Failed to disable MFA:', error);
      toast.error(error.message || 'Failed to disable MFA');
    } finally {
      setDisableLoading(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const downloadBackupCodes = () => {
    if (!setupData || !setupData.backup_codes) return;

    const content = `SchoolHub Super Admin - MFA Backup Codes
Generated: ${new Date().toLocaleString()}

IMPORTANT: Store these codes securely. Each code can only be used once.

${setupData.backup_codes.map((code, i) => `${i + 1}. ${code}`).join('\n')}

Keep these codes in a safe place. If you lose access to your authenticator app,
you can use these backup codes to log in.`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schoolhub-mfa-backup-codes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Backup codes downloaded');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <SEO title="MFA Settings - Super Admin" />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Multi-Factor Authentication</h1>
          <p className="text-gray-500 mt-1">Enhance your account security with 2FA</p>
        </div>

        {/* Current Status Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${mfaStatus?.mfa_enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Shield className={`h-6 w-6 ${mfaStatus?.mfa_enabled ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {mfaStatus?.mfa_enabled ? 'MFA is Enabled' : 'MFA is Disabled'}
                </h3>
                <p className="text-sm text-gray-600">
                  {mfaStatus?.mfa_enabled
                    ? `Enabled on ${new Date(mfaStatus.mfa_enabled_at).toLocaleString()}`
                    : 'Your account is not protected by two-factor authentication'}
                </p>
              </div>
            </div>

            <div>
              {mfaStatus?.mfa_enabled ? (
                <button
                  onClick={() => setShowDisable(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Disable MFA
                </button>
              ) : (
                <button
                  onClick={handleSetupMFA}
                  disabled={setupLoading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-primary-400"
                >
                  {setupLoading ? 'Setting up...' : 'Enable MFA'}
                </button>
              )}
            </div>
          </div>

          {mfaStatus?.mfa_enabled && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Key className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Backup Codes Remaining</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">{mfaStatus.backup_codes_remaining}</p>
                {mfaStatus.backup_codes_remaining <= 2 && (
                  <p className="text-xs text-red-600 mt-1">Running low! Consider regenerating MFA.</p>
                )}
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Trusted Devices</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">{mfaStatus.trusted_devices_count}</p>
              </div>
            </div>
          )}
        </div>

        {/* Info Card */}
        {!mfaStatus?.mfa_enabled && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex">
              <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-yellow-900">Recommended Security Enhancement</h3>
                <p className="text-sm text-yellow-800 mt-1">
                  Enable multi-factor authentication to significantly improve the security of your super admin account.
                  MFA requires both your password and a code from your phone to log in.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Setup MFA Modal */}
        {showSetup && setupData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Setup Two-Factor Authentication</h2>

                <div className="space-y-6">
                  {/* Step 1: Scan QR Code */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Step 1: Scan QR Code</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Use Google Authenticator, Authy, or any TOTP-compatible app to scan this QR code:
                    </p>

                    <div className="flex justify-center bg-gray-50 p-6 rounded-lg">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(setupData.qr_code_url)}`}
                        alt="MFA QR Code"
                        className="w-48 h-48"
                      />
                    </div>

                    <div className="mt-4">
                      <p className="text-xs text-gray-600 mb-2">Or enter this secret key manually:</p>
                      <div className="flex items-center bg-gray-100 rounded-lg p-3">
                        <code className="flex-1 text-sm font-mono text-gray-900">{setupData.secret}</code>
                        <button
                          onClick={() => copyToClipboard(setupData.secret, 'Secret key')}
                          className="ml-2 p-2 text-gray-600 hover:text-gray-900"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Save Backup Codes */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Step 2: Save Backup Codes</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      <strong className="text-red-600">IMPORTANT:</strong> Save these backup codes in a secure place.
                      You can use them to access your account if you lose your phone.
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-2">
                        {setupData.backup_codes.map((code, index) => (
                          <div key={index} className="font-mono text-sm text-gray-900">
                            {index + 1}. {code}
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={downloadBackupCodes}
                      className="mt-3 flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download Backup Codes
                    </button>
                  </div>

                  {/* Step 3: Verify */}
                  <form onSubmit={handleEnableMFA}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Step 3: Verify Setup</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Enter the 6-digit code from your authenticator app to verify:
                    </p>

                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength="6"
                      required
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-center text-2xl tracking-widest font-mono"
                      placeholder="000000"
                    />

                    <div className="flex gap-3 mt-6">
                      <button
                        type="submit"
                        disabled={setupLoading || verificationCode.length !== 6}
                        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-primary-400"
                      >
                        {setupLoading ? 'Verifying...' : 'Enable MFA'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowSetup(false);
                          setSetupData(null);
                          setVerificationCode('');
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Disable MFA Modal */}
        {showDisable && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Disable Two-Factor Authentication</h2>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-800">
                        <strong>Warning:</strong> Disabling MFA will make your account less secure.
                        You will only need your password to log in.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleDisableMFA}>
                  <div className="mb-6">
                    <label htmlFor="disable-password" className="block text-sm font-medium text-gray-700 mb-2">
                      Enter your password to confirm:
                    </label>
                    <input
                      id="disable-password"
                      type="password"
                      required
                      value={disablePassword}
                      onChange={(e) => setDisablePassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Your password"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={disableLoading}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400"
                    >
                      {disableLoading ? 'Disabling...' : 'Disable MFA'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDisable(false);
                        setDisablePassword('');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
