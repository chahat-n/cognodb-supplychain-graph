import React from 'react';
import { Flame, GitCommit, ChevronRight, Zap } from 'lucide-react';
import { BlastRadiusResult, GraphNode } from '../types/graph';

interface BlastRadiusPanelProps {
  nodes: GraphNode[];
  selectedEntityId: string | null;
  blastRadius: BlastRadiusResult | null;
  loading: boolean;
  onSelectEntity: (id: string) => void;
}

export const BlastRadiusPanel: React.FC<BlastRadiusPanelProps> = ({
  nodes,
  selectedEntityId,
  blastRadius,
  loading,
  onSelectEntity
}) => {
  const selectableEntities = nodes.filter(n => n.type === 'Supplier' || n.type === 'Component');

  return (
    <div className="glass-panel rounded-xl border border-gray-800 p-4 flex flex-col h-[520px]">
      
      {/* Panel Title */}
      <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Disruption Blast Radius Simulator</h3>
            <p className="text-[11px] text-gray-400">Multi-Hop Downstream Impact Traversal</p>
          </div>
        </div>
      </div>

      {/* Select Disrupted Node Dropdown */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
          Select Disrupted Supplier or Component:
        </label>
        <select
          value={selectedEntityId || ''}
          onChange={(e) => onSelectEntity(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 text-gray-100 text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
        >
          <option value="" disabled>-- Select Entity to Simulate Failure --</option>
          {selectableEntities.map(node => (
            <option key={node.id} value={node.id}>
              [{node.type}] {node.label} ({node.id})
            </option>
          ))}
        </select>
      </div>

      {/* Results Section */}
      <div className="flex-1 overflow-y-auto pr-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-xs">
            <Zap className="w-6 h-6 animate-pulse text-rose-400 mb-2" />
            Computing Cypher Multi-Hop Graph Traversal...
          </div>
        ) : !selectedEntityId ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-500 text-xs text-center px-4">
            <GitCommit className="w-8 h-8 text-gray-600 mb-2" />
            Pick a supplier or component above to evaluate how supply disruptions ripple down the network.
          </div>
        ) : blastRadius && blastRadius.impactedNodes.length > 0 ? (
          <div className="space-y-3">
            
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs">
              <span className="text-rose-300 font-semibold">Total Downstream Impacted:</span>
              <span className="text-rose-400 font-bold bg-rose-500/20 px-2 py-0.5 rounded-full">
                {blastRadius.totalImpacted} Entities
              </span>
            </div>

            <div className="space-y-2">
              {blastRadius.impactedNodes.map((item, idx) => (
                <div
                  key={idx}
                  className="glass-card p-2.5 rounded-lg border border-gray-800 text-xs space-y-1 hover:border-gray-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
                      {item.name}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-gray-800 text-gray-300 border border-gray-700">
                      {item.hops} {item.hops === 1 ? 'Hop' : 'Hops'} Away
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-gray-400 overflow-x-auto py-0.5">
                    {item.pathNames.map((step, sIdx) => (
                      <React.Fragment key={sIdx}>
                        <span className={sIdx === item.pathNames.length - 1 ? 'text-rose-300 font-medium' : 'text-gray-400'}>
                          {step}
                        </span>
                        {sIdx < item.pathNames.length - 1 && (
                          <ChevronRight className="w-3 h-3 text-gray-600 flex-shrink-0" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        ) : (
          <div className="text-center text-xs text-gray-400 py-8">
            No downstream impact found for this entity.
          </div>
        )}
      </div>

    </div>
  );
};
