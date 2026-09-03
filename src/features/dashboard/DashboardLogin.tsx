import React, { useState, useEffect } from 'react';
import { Lock, LogIn, AlertCircle, Eye, EyeOff, Clipboard as ClipboardIcon } from 'lucide-react';
import { TEXTS } from '../../config/config';

interface DashboardLoginProps {
  onLogin: (username: string, password: string) => Promise<boolean> | boolean;
}

const DashboardLogin: React.FC<DashboardLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  const [remainingTimeText, setRemainingTimeText] = useState('');

  useEffect(() => {
    const lockedUntil = localStorage.getItem('login_lockout_until');
    if (lockedUntil) {
      const time = parseInt(lockedUntil, 10);
      if (time > Date.now()) {
        setLockoutTime(time);
      } else {
        localStorage.removeItem('login_lockout_until');
        localStorage.removeItem('login_failed_attempts');
      }
    }
  }, []);

  useEffect(() => {
    if (!lockoutTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now >= lockoutTime) {
        setLockoutTime(null);
        localStorage.removeItem('login_lockout_until');
        localStorage.removeItem('login_failed_attempts');
        setError('');
      } else {
        const diff = lockoutTime - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (hours > 0) {
          setRemainingTimeText(`${hours} jam ${minutes} menit ${seconds} detik`);
        } else if (minutes > 0) {
          setRemainingTimeText(`${minutes} menit ${seconds} detik`);
        } else {
          setRemainingTimeText(`${seconds} detik`);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTime && Date.now() < lockoutTime) {
      return;
    }

    if (!username.trim() || !password.trim()) {
      setError(TEXTS.dashboard.login.emptyError);
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onLogin(username, password);
      if (!success) {
        const attempts = parseInt(localStorage.getItem('login_failed_attempts') || '0', 10) + 1;
        localStorage.setItem('login_failed_attempts', attempts.toString());

        if (attempts >= 3) {
          const until = Date.now() + 24 * 60 * 60 * 1000;
          localStorage.setItem('login_lockout_until', until.toString());
          setLockoutTime(until);
          setError('');
        } else {
          setError(`${TEXTS.dashboard.login.wrongCredentialsPrefix}${3 - attempts}${TEXTS.dashboard.login.wrongCredentialsSuffix}`);
        }
        setPassword('');
      } else {
        localStorage.removeItem('login_failed_attempts');
        localStorage.removeItem('login_lockout_until');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto h-12 w-12 bg-[#00a884] rounded-full flex items-center justify-center">
          <Lock className="text-white" size={24} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">{TEXTS.dashboard.login.title}</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {TEXTS.dashboard.login.subtitle}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {lockoutTime ? (
            <div className="text-center py-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {TEXTS.dashboard.login.blocked}
              </h3>
              <p className="text-sm text-gray-500">
                {TEXTS.dashboard.login.blockedMessage}
                <br />
                {TEXTS.dashboard.login.tryAgainIn}
                <br />
                <span className="font-bold text-red-600 text-lg mt-2 block">
                  {remainingTimeText}
                </span>
              </p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  {TEXTS.dashboard.login.username}
                </label>
                <div className="mt-1 relative">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setError('');
                    }}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#00a884] focus:border-[#00a884] sm:text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        setUsername(text);
                        setError('');
                      } catch (err) {
                        console.error('Failed to read clipboard contents: ', err);
                      }
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    title={TEXTS.dashboard.login.paste}
                  >
                    <ClipboardIcon size={18} />
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {TEXTS.dashboard.login.password}
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#00a884] focus:border-[#00a884] sm:text-sm pr-20"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText();
                          setPassword(text);
                          setError('');
                        } catch (err) {
                          console.error('Failed to read clipboard contents: ', err);
                        }
                      }}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      title={TEXTS.dashboard.login.paste}
                    >
                      <ClipboardIcon size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      title={showPassword ? TEXTS.dashboard.login.hidePassword : TEXTS.dashboard.login.showPassword}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-600" id="password-error">
                    {error}
                  </p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00a884] hover:bg-[#008f6f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00a884]"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  {TEXTS.dashboard.login.signIn}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardLogin;
