import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sun, ShieldCheck, RefreshCw, Award, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: 'landing' | 'customer' | 'technician' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { resetDemoData } = useApp();

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <Sun className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Solar<span className="text-emerald-400">Ops</span>
              </span>
            </div>
            <p className="text-stone-400 text-xs leading-relaxed">
              Empowering Indian homes and enterprises with high-efficiency rooftop solar systems, transparent 7-stage project tracking, and PM Surya Ghar central subsidies.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400">
              <Award className="w-4 h-4" />
              <span>MNRE Empanelled Rooftop Solar EPC</span>
            </div>
          </div>

          {/* Quick Nav */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Application Portals
            </h4>
            <ul className="space-y-2 text-stone-400">
              <li>
                <button
                  onClick={() => onNavigate('landing')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Solar Estimator & Packages
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('customer')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Customer 7-Stage Tracker
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('technician')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Technician Field Board
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Admin Operations Console
                </button>
              </li>
            </ul>
          </div>

          {/* Government Scheme Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Government Schemes
            </h4>
            <ul className="space-y-2 text-stone-400">
              <li>
                <span className="text-stone-200 font-medium">PM Surya Ghar: Muft Bijli Yojana</span>
                <span className="block text-[11px] text-stone-500">Up to ₹78,000 direct DBT subsidy</span>
              </li>
              <li>
                <span className="text-stone-200 font-medium">DISCOM Net-Metering</span>
                <span className="block text-[11px] text-stone-500">Export surplus green energy to the grid</span>
              </li>
              <li>
                <span className="text-stone-200 font-medium">BIS & ALMM Approved</span>
                <span className="block text-[11px] text-stone-500">Approved List of Models & Manufacturers</span>
              </li>
            </ul>
          </div>

          {/* Sandbox & Reset */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Simulated Demo Mode
            </h4>
            <p className="text-stone-400 text-xs leading-relaxed">
              All payment flows and banking handshakes are strictly simulated for demonstration. No real currency is charged.
            </p>
            <button
              onClick={resetDemoData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs transition-colors border border-stone-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Sandbox Demo Data</span>
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-500 text-[11px]">
          <div>
            © 2026 SolarOps Energy Systems. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            <span>Built with precision for Clean Rooftop Solar Energy in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
