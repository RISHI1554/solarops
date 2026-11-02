import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { X, Lock, Mail, User, Phone, MapPin, Zap, Shield, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (role?: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const { loginWithEmail, signUpWithEmail, isSupabaseActive, adminEmailConfig, switchDemoRole, profiles } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [electricityConnNo, setElectricityConnNo] = useState('');
  const [role, setRole] = useState<UserRole>('customer');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickDemoFill = (roleChoice: UserRole) => {
    switchDemoRole(roleChoice);
    onSuccess(roleChoice);
    onClose();
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    const res = await loginWithEmail(cleanEmail, password);
    setIsLoading(false);

    if (res.success) {
      const detectedRole: UserRole =
        cleanEmail === adminEmailConfig.toLowerCase()
          ? 'admin'
          : (profiles.find(p => p.email.toLowerCase() === cleanEmail)?.role || 'customer');
      onSuccess(detectedRole);
      onClose();
    } else {
      setError(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim()) {
      setError('Full name and email address are required.');
      return;
    }
    if (password && password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setIsLoading(true);
    const res = await signUpWithEmail({
      email,
      password,
      full_name: fullName,
      phone,
      address,
      city,
      state,
      pincode,
      electricity_conn_no: electricityConnNo,
      role,
    });
    setIsLoading(false);

    if (res.success) {
      const assignedRole: UserRole =
        email.trim().toLowerCase() === adminEmailConfig.toLowerCase() ? 'admin' : role;
      onSuccess(assignedRole);
      onClose();
    } else {
      setError(res.error || 'Account registration failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-md w-full border border-stone-200 shadow-2xl p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div>
            <h3 className="text-xl font-bold text-stone-900">
              {mode === 'signin' ? 'Sign In to SolarOps' : 'Create SolarOps Account'}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {mode === 'signin'
                ? 'Access your installations, bills, and service tickets'
                : 'Join to track rooftop installations and central subsidies'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Fast Account Selectors */}
        <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-semibold text-stone-700">1-Click Demo Profiles:</span>
            <span className="text-[10px] text-stone-400">Instant test login</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemoFill('customer')}
              className="py-1.5 px-2 rounded-lg bg-white border border-stone-200 hover:border-emerald-500 text-stone-800 text-[11px] font-semibold text-center transition-colors shadow-2xs"
            >
              Customer (Rahul)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoFill('technician')}
              className="py-1.5 px-2 rounded-lg bg-white border border-stone-200 hover:border-amber-500 text-stone-800 text-[11px] font-semibold text-center transition-colors shadow-2xs"
            >
              Technician (Vikram)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoFill('admin')}
              className="py-1.5 px-2 rounded-lg bg-white border border-stone-200 hover:border-purple-500 text-stone-800 text-[11px] font-semibold text-center transition-colors shadow-2xs"
            >
              Admin (Priya)
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Mode Selector */}
        <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError('');
            }}
            className={`py-1.5 rounded-lg transition-all ${
              mode === 'signin' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError('');
            }}
            className={`py-1.5 rounded-lg transition-all ${
              mode === 'signup' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Sign In Form */}
        {mode === 'signin' ? (
          <form onSubmit={handleSignIn} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="e.g. rahul.sharma@gmail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-stone-300 rounded-xl bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-stone-300 rounded-xl bg-white"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                {isLoading ? 'Verifying...' : 'Sign In'}
              </button>
            </div>
          </form>
        ) : (
          /* Sign Up Form */
          <form onSubmit={handleSignUp} className="space-y-3 text-xs max-h-[60vh] overflow-y-auto pr-1">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="e.g. user@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Account Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white"
                >
                  <option value="customer">Customer</option>
                  <option value="technician">Technician</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Property Address</label>
              <input
                type="text"
                placeholder="Street Address, Area"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-xl bg-white"
              />
              <input
                type="text"
                placeholder="State"
                value={state}
                onChange={e => setState(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-xl bg-white"
              />
              <input
                type="text"
                placeholder="PIN Code"
                value={pincode}
                onChange={e => setPincode(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-xl bg-white font-mono"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                {isLoading ? 'Creating Account...' : 'Complete Registration'}
              </button>
            </div>
          </form>
        )}

        <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-500 leading-relaxed">
          <Shield className="w-3.5 h-3.5 text-stone-400 inline mr-1" />
          Configured Admin Email is <code className="font-mono text-stone-700 font-semibold">{adminEmailConfig}</code>. Users with this email address are granted full administrator privileges.
        </div>
      </div>
    </div>
  );
};
