import React, { useState, useMemo } from 'react';
import {
  Wallet,
  ArrowRight,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Fingerprint,
  Loader2,
  Shield,
  Check,
} from 'lucide-react';
import { PageId, UserProfile } from '../types/finance';

interface AuthPageProps {
  onLogin: (email: string, name: string, password: string, register: boolean) => Promise<void>;
  defaultProfile: UserProfile;
  onNavigate?: (page: PageId) => void;
  isAuthenticated?: boolean;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onLogin,
  defaultProfile,
  onNavigate,
  isAuthenticated = false,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState(defaultProfile.email || '');
  const [name, setName] = useState(defaultProfile.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMethodLoading, setAuthMethodLoading] = useState<'google' | 'passkey' | 'github' | null>(null);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  // Live Email Validation
  const isValidEmail = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }, [email]);

  // Live Password Strength Evaluation (for Registration)
  const passwordCriteria = useMemo(() => {
    return {
      length: password.length >= 8,
      number: /\d/.test(password),
      uppercase: /[A-Z]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
  }, [password]);

  const passwordScore = useMemo(() => {
    let score = 0;
    if (passwordCriteria.length) score++;
    if (passwordCriteria.number) score++;
    if (passwordCriteria.uppercase) score++;
    if (passwordCriteria.special) score++;
    return score;
  }, [passwordCriteria]);

  const passwordStrengthLabel = useMemo(() => {
    if (password.length === 0) return { label: '', color: 'bg-slate-200' };
    if (passwordScore <= 1) return { label: 'Weak', color: 'bg-rose-500' };
    if (passwordScore === 2) return { label: 'Moderate', color: 'bg-amber-500' };
    if (passwordScore === 3) return { label: 'Good', color: 'bg-blue-500' };
    return { label: 'Strong', color: 'bg-emerald-500' };
  }, [password, passwordScore]);

  // Handle Caps Lock detection
  const handleKeyEvents = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockActive(e.getModifierState('CapsLock'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isValidEmail) {
      setErrorMessage('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (isRegister) {
      if (!name.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }
    }

    setIsSubmitting(true);
    setTimeout(async () => {
      setIsSubmitting(false);
      try {
        await onLogin(email.trim(), name.trim() || 'Personal User', password, isRegister);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Unable to authenticate');
      }
    }, 450);
  };

  const handleSocialAuth = (method: 'google' | 'passkey' | 'github') => {
    setErrorMessage('');
    setAuthMethodLoading(method);

    setTimeout(async () => {
      setAuthMethodLoading(null);
      const simulatedEmail =
        method === 'google'
          ? 'user.google@gmail.com'
          : method === 'passkey'
          ? defaultProfile.email || 'biometric.user@fintech.local'
          : 'developer@github.com';
      const simulatedName =
        method === 'google'
          ? 'Google Verified User'
          : method === 'passkey'
          ? 'TouchID Secured User'
          : 'GitHub Developer';
      try {
        await onLogin(simulatedEmail, simulatedName, 'DemoSocialPassword123!', false);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Social sign-in is unavailable');
      }
    }, 600);
  };

  const handleSendReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail && !email) return;
    setIsSendingReset(true);
    setTimeout(() => {
      setIsSendingReset(false);
      setForgotSuccess(true);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative selection:bg-amber-300 selection:text-slate-950">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-200/40 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md w-full mx-auto relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-300 border-2 border-slate-900 flex items-center justify-center text-slate-950 shadow-[3.5px_3.5px_0px_#0f172a] mb-3 transition-transform hover:rotate-6 hover:scale-105 cursor-pointer">
            <Wallet className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Personal Finance Tracker
          </h2>
          <p className="text-xs font-bold text-slate-500 mt-1">
            {isRegister ? '🌟 Set up your credentials to begin tracking' : '👋 Sign in to access your personal dashboard'}
          </p>
        </div>

        {/* Authentication Card */}
        <div className="cartoon-card p-6 sm:p-8">
          {/* If user is already authenticated */}
          {isAuthenticated && (
            <div className="mb-6 p-3.5 bg-amber-50 border-2 border-slate-900 rounded-xl flex items-center justify-between gap-3 text-xs shadow-[2px_2px_0px_#0f172a]">
              <div className="min-w-0">
                <span className="font-black text-slate-950 block truncate">
                  Signed In as {defaultProfile.name}
                </span>
                <span className="text-slate-600 font-bold text-[11px] truncate block">{defaultProfile.email}</span>
              </div>
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="cartoon-btn-primary px-3 py-1.5 text-xs flex items-center gap-1 shrink-0"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              )}
            </div>
          )}

          {/* Interactive Tab Switcher: Login vs Register */}
          <div className="flex items-center p-1 bg-amber-100/70 border-2 border-slate-900 rounded-xl mb-6 shadow-[2px_2px_0px_#0f172a]">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-black rounded-lg transition-all duration-150 cursor-pointer ${
                !isRegister
                  ? 'bg-amber-300 text-slate-950 border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#0f172a]'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-black rounded-lg transition-all duration-150 cursor-pointer ${
                isRegister
                  ? 'bg-amber-300 text-slate-950 border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#0f172a]'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error notification banner */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-100 border-2 border-slate-900 text-rose-950 text-xs rounded-xl flex items-start gap-2 shadow-[2px_2px_0px_#0f172a] font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-700 stroke-[2.5]" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Main Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.5]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="e.g. Alex Morgan"
                    className="cartoon-input w-full pl-9 pr-3 py-2 text-sm font-bold text-slate-900 placeholder-slate-400"
                  />
                </div>
              </div>
            )}

            {/* Email Address with live validation indicator */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-black text-slate-900">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                {isValidEmail && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700">
                    <Check className="w-3 h-3 stroke-[2.5]" /> Valid
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.5]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="name@example.com"
                  className="cartoon-input w-full pl-9 pr-8 py-2 text-sm font-bold text-slate-900 placeholder-slate-400 font-mono"
                />
                {isValidEmail && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
                )}
              </div>
            </div>

            {/* Password input with eye toggle & Caps Lock detector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-black text-slate-900">
                  Password <span className="text-rose-500">*</span>
                </label>
                {capsLockActive && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-950 bg-amber-300 px-1.5 py-0.5 rounded border border-slate-900 shadow-[1px_1px_0px_#0f172a]">
                    Caps Lock ON
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.5]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onKeyDown={handleKeyEvents}
                  onKeyUp={handleKeyEvents}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="••••••••"
                  className="cartoon-input w-full pl-9 pr-10 py-2 text-sm font-bold text-slate-900 placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 transition-colors p-0.5 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4 stroke-[2.5]" /> : <Eye className="w-4 h-4 stroke-[2.5]" />}
                </button>
              </div>

              {/* Interactive Password Strength Meter (when registering) */}
              {isRegister && password.length > 0 && (
                <div className="mt-2 space-y-1.5 bg-slate-50 p-2.5 rounded-xl border-2 border-slate-900">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 font-bold">Password Strength</span>
                    <span className="font-black text-slate-950 font-mono text-[11px]">
                      {passwordStrengthLabel.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 h-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full rounded-full border border-slate-900 transition-all duration-300 ${
                          step <= passwordScore ? passwordStrengthLabel.color : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 font-bold pt-0.5">
                    <span className={passwordCriteria.length ? 'text-emerald-700' : ''}>
                      ✓ 8+ chars
                    </span>
                    <span className={passwordCriteria.number ? 'text-emerald-700' : ''}>
                      ✓ Number
                    </span>
                    <span className={passwordCriteria.uppercase ? 'text-emerald-700' : ''}>
                      ✓ Uppercase
                    </span>
                    <span className={passwordCriteria.special ? 'text-emerald-700' : ''}>
                      ✓ Symbol
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password (when registering) */}
            {isRegister && (
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1.5">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.5]" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="••••••••"
                    className="cartoon-input w-full pl-9 pr-10 py-2 text-sm font-bold text-slate-900 placeholder-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 transition-colors p-0.5 cursor-pointer"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4 stroke-[2.5]" /> : <Eye className="w-4 h-4 stroke-[2.5]" />}
                  </button>
                </div>
              </div>
            )}

            {/* Remember Me and Forgot Password Controls */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-800 font-bold hover:text-slate-950 transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-2 border-slate-900 text-blue-600 focus:ring-0"
                />
                <span>Remember me</span>
              </label>

              {!isRegister && (
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-blue-700 hover:text-blue-900 font-black transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="cartoon-btn-primary w-full py-2.5 px-4 text-sm font-black flex items-center justify-center gap-2 mt-3 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                  <span>{isRegister ? 'Creating Account...' : 'Authenticating...'}</span>
                </>
              ) : (
                <>
                  <span>{isRegister ? 'Create Account & Open Dashboard' : 'Log In to Dashboard'}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Social / Fast Authentication Simulation Section */}
          <div className="mt-6">
            <div className="relative flex items-center justify-center">
              <div className="border-t-2 border-slate-900 w-full" />
              <span className="bg-white px-3 text-[11px] font-black text-slate-500 uppercase tracking-wider shrink-0">
                Or fast verify with
              </span>
              <div className="border-t-2 border-slate-900 w-full" />
            </div>

            <div className="grid grid-cols-2 gap-2.5 mt-4">
              {/* Passkey / Biometrics Button */}
              <button
                type="button"
                onClick={() => handleSocialAuth('passkey')}
                disabled={authMethodLoading !== null}
                className="cartoon-btn-secondary flex items-center justify-center gap-2 py-2 px-3 text-xs"
                title="Sign in with device biometrics or passkey"
              >
                {authMethodLoading === 'passkey' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 stroke-[2.5]" />
                ) : (
                  <Fingerprint className="w-4 h-4 text-blue-600 stroke-[2.5]" />
                )}
                <span>Passkey</span>
              </button>

              {/* Google Fast Auth Button */}
              <button
                type="button"
                onClick={() => handleSocialAuth('google')}
                disabled={authMethodLoading !== null}
                className="cartoon-btn-secondary flex items-center justify-center gap-2 py-2 px-3 text-xs"
                title="Continue with Google Account"
              >
                {authMethodLoading === 'google' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500 stroke-[2.5]" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1s.7 5.4 1.9 7.8l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                    />
                  </svg>
                )}
                <span>Google</span>
              </button>
            </div>
          </div>

          {/* Toggle link between Login and Register */}
          <div className="mt-5 text-center text-xs text-slate-600 border-t-2 border-slate-100 pt-4 font-bold">
            {isRegister ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setErrorMessage('');
                  }}
                  className="text-blue-700 hover:text-blue-900 font-black ml-1 cursor-pointer"
                >
                  Sign in
                </button>
              </span>
            ) : (
              <span>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setErrorMessage('');
                  }}
                  className="text-blue-700 hover:text-blue-900 font-black ml-1 cursor-pointer"
                >
                  Create account
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Security badge footnote */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500 font-bold">
          <Shield className="w-3.5 h-3.5 text-slate-600 stroke-[2.5]" />
          <span>Local storage encryption · Zero telemetry</span>
        </div>
      </div>

      {/* Interactive Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="cartoon-card p-6 max-w-sm w-full text-left">
            <h3 className="text-base font-black text-slate-900 mb-1">Reset Password</h3>
            <p className="text-xs font-bold text-slate-500 mb-4">
              Enter your account email to dispatch simulated recovery instructions.
            </p>

            {forgotSuccess ? (
              <div className="p-3.5 bg-emerald-100 border-2 border-slate-900 rounded-xl text-emerald-950 text-xs mb-4 flex items-start gap-2.5 shadow-[2px_2px_0px_#0f172a]">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5 stroke-[2.5]" />
                <div>
                  <span className="font-black block">Password recovery initiated</span>
                  <p className="text-[11px] text-emerald-800 mt-0.5 font-bold">
                    Recovery simulation dispatched to{' '}
                    <strong className="font-mono">{forgotEmail || email || 'your email'}</strong>.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendReset} className="mb-4">
                <label className="block text-xs font-black text-slate-900 mb-1.5">
                  Your Account Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={forgotEmail || email}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="cartoon-input w-full px-3 py-2 text-sm font-bold text-slate-900 font-mono"
                  autoFocus
                />
              </form>
            )}

            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSuccess(false);
                }}
                className="cartoon-btn-secondary px-3.5 py-2 text-xs"
              >
                Close
              </button>
              {!forgotSuccess && (
                <button
                  type="button"
                  onClick={handleSendReset}
                  disabled={isSendingReset}
                  className="cartoon-btn-primary px-3.5 py-2 text-xs flex items-center gap-1.5 disabled:opacity-70"
                >
                  {isSendingReset && <Loader2 className="w-3 h-3 animate-spin stroke-[2.5]" />}
                  <span>Send Reset Link</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
