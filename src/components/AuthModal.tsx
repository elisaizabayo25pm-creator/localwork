import React, { useState } from 'react';
import { X, HardHat, Lock, Mail, Building, FileCheck, Phone, CheckCircle2 } from 'lucide-react';
import { User, UserRole } from '../types.js';
import { api } from '../services/api.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLoginSuccess: (user: User) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contractorLicense, setContractorLicense] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('contractor');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleQuickLogin = async (demoEmail: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { user } = await api.login(demoEmail);
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (mode === 'login') {
        const { user } = await api.login(email);
        onLoginSuccess(user);
        onClose();
      } else {
        const { user } = await api.register({
          name,
          email,
          role,
          companyName,
          contractorLicense,
          phone
        });
        onLoginSuccess(user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {currentUser ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-display font-extrabold text-amber-400 text-lg">
                <HardHat className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white">{currentUser.name}</h3>
                <p className="text-xs text-neutral-400">{currentUser.companyName || currentUser.role}</p>
              </div>
            </div>

            <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-400">Account Role:</span>
                <span className="font-mono text-amber-400 uppercase font-semibold">{currentUser.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Email:</span>
                <span className="text-neutral-200">{currentUser.email}</span>
              </div>
              {currentUser.contractorLicense && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">License #:</span>
                  <span className="font-mono text-neutral-200">{currentUser.contractorLicense}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 hover:text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors border border-neutral-700"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500 text-neutral-950 font-display font-extrabold text-xl mb-3">
                LW
              </div>
              <h3 className="font-display text-xl font-bold text-white uppercase tracking-wider">
                {mode === 'login' ? 'Contractor Sign In' : 'Register Commercial Account'}
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Access mill-direct pricing, Net-30 credit terms, and live jobsite tracking.
              </p>
            </div>

            {/* Quick 1-Click Demo Accounts */}
            <div className="mb-6 p-3 bg-neutral-950 rounded-xl border border-neutral-800/80 space-y-2">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                Instant Demo Logins:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('marcus@vanceconstruction.com')}
                  disabled={loading}
                  className="p-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-750 rounded-lg text-left transition-colors"
                >
                  <div className="font-semibold text-amber-400">General Contractor</div>
                  <div className="text-[10px] text-neutral-400 truncate">Marcus Vance</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@localworksupply.com')}
                  disabled={loading}
                  className="p-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-750 rounded-lg text-left transition-colors"
                >
                  <div className="font-semibold text-sky-400">Merchant Admin</div>
                  <div className="text-[10px] text-neutral-400 truncate">Sarah Lin</div>
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 bg-red-950 border border-red-800 text-red-300 rounded-lg text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-neutral-400 mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Marcus Vance"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">Company / Builder Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Vance Commercial Builders LLC"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-neutral-400 mb-1">Role</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as any)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                      >
                        <option value="contractor">General Contractor</option>
                        <option value="subcontractor">Trade Subcontractor</option>
                        <option value="project_manager">Site Project Manager</option>
                        <option value="homeowner">Self-Builder / DIY</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-neutral-400 mb-1">Contractor License #</label>
                      <input
                        type="text"
                        value={contractorLicense}
                        onChange={(e) => setContractorLicense(e.target.value)}
                        placeholder="GC-NV-904128"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-neutral-400 mb-1">Business Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contractor@vanceconstruction.com"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-display font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-lg mt-2"
              >
                {loading ? 'Authenticating...' : (mode === 'login' ? 'Sign In to Account' : 'Create Contractor Account')}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setErrorMsg(null);
                }}
                className="text-xs text-neutral-400 hover:text-amber-400 transition-colors"
              >
                {mode === 'login'
                  ? "Don't have an account? Register Commercial Profile"
                  : 'Already registered? Sign In'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
