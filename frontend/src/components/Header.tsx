import React from 'react';
import { Database, RefreshCw, Layers, ShieldCheck, AlertTriangle } from 'lucide-react';
import { DatabaseHealth } from '../types/graph';

interface HeaderProps {
  health: DatabaseHealth | null;
  loading: boolean;
  onRefresh: () => void;
  onSeed: () => void;
}

export const Header: React.FC<HeaderProps> = ({ health, loading, onRefresh, onSeed }) => {
  return (
    <header className="glass-panel sticky top-0 z-50 px-6 py-4 border-b border-gray-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">CognoDB</h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Cloud Demo App
              </span>
            </div>
            <p className="text-xs text-gray-400">Supply Chain Risk & Downstream Blast Radius Navigator</p>
          </div>
        </div>

        {/* Right: Actions & Status */}
        <div className="flex items-center gap-3">
          
          {/* Database Health Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900/80 border border-gray-800 text-xs">
            {health?.connected ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> CognoDB Connected
                </span>
              </>
            ) : (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <span className="text-rose-400 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> DB Unreachable
                </span>
              </>
            )}
          </div>

          {/* Re-seed Button */}
          <button
            onClick={onSeed}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-medium border border-gray-700 transition duration-150 disabled:opacity-50"
            title="Populate CognoDB with realistic sample data"
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            Re-Seed Graph Data
          </button>

          {/* Refresh Graph Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition duration-150 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Canvas
          </button>

        </div>

      </div>
    </header>
  );
};
