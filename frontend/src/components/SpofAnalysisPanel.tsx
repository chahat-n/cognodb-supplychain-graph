import React from 'react';
import { AlertOctagon, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SPOFResult, AlternativeResult } from '../types/graph';

interface SpofProps {
  spofData: SPOFResult | null;
  selectedComponentAlt: AlternativeResult | null;
  loadingAlt: boolean;
  onFindAlternatives: (componentId: string) => void;
}

export const SpofAnalysisPanel: React.FC<SpofProps> = ({
  spofData,
  selectedComponentAlt,
  loadingAlt,
  onFindAlternatives
}) => {
  const bottlenecks = spofData?.bottlenecks || [];

  return (
    <div className="glass-panel rounded-xl border border-gray-800 p-4">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Single Point of Failure (SPOF) Bottleneck Intelligence</h3>
            <p className="text-[11px] text-gray-400">Relational-Awkward Graph Query Analysis</p>
          </div>
        </div>
        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
          {bottlenecks.length} Critical Bottlenecks
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Left Column: Bottleneck List */}
        <div className="space-y-3">
          {bottlenecks.map((item) => (
            <div
              key={item.componentId}
              className="glass-card p-3 rounded-lg border border-gray-800 space-y-2 hover:border-amber-500/40 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    {item.componentName}
                  </h4>
                  <p className="text-[10px] text-gray-400">Supplier: <span className="text-cyan-400 font-medium">{item.supplierName}</span> (Score: {(item.supplierReliability * 100).toFixed(0)}%)</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-rose-400">${item.totalValueAtRisk.toLocaleString()}</span>
                  <p className="text-[9px] text-gray-500">Value at Risk</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-800/60">
                <span className="text-gray-400">Products Impacted: <span className="text-gray-200">{item.impactedProducts.join(', ')}</span></span>
                <button
                  onClick={() => onFindAlternatives(item.componentId)}
                  className="px-2 py-1 rounded bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 text-[10px] font-semibold flex items-center gap-1 transition"
                >
                  Find Re-routing Options <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Alternative Supplier Re-routing */}
        <div className="glass-card p-3 rounded-lg border border-gray-800">
          <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Alternative Supplier Re-routing Recommendations
          </h4>

          {loadingAlt ? (
            <div className="text-center text-xs text-gray-400 py-8">Searching graph paths for replacement vendors...</div>
          ) : selectedComponentAlt ? (
            <div className="space-y-2">
              <p className="text-[11px] text-gray-400">
                Alternative suppliers for component <span className="text-white font-semibold">{selectedComponentAlt.componentId}</span>:
              </p>
              {selectedComponentAlt.alternatives.length > 0 ? (
                selectedComponentAlt.alternatives.map((alt) => (
                  <div key={alt.supplierId} className="p-2 rounded bg-gray-900 border border-gray-800 text-xs flex items-center justify-between">
                    <div>
                      <p className="font-bold text-emerald-400">{alt.supplierName} ({alt.country})</p>
                      <p className="text-[10px] text-gray-400">Supplies: {alt.altComponentName}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-gray-300 bg-gray-800 px-2 py-0.5 rounded">
                      Score: {(alt.reliabilityScore * 100).toFixed(0)}%
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-rose-400 py-4">No alternative suppliers found in graph database!</p>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-8 text-center">
              Select "Find Re-routing Options" on any bottleneck item to compute backup vendor paths.
            </p>
          )}
        </div>

      </div>

    </div>
  );
};
