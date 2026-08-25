import React from 'react';
import { Truck, Cpu, ShoppingBag, AlertOctagon, Network } from 'lucide-react';
import { GraphData, SPOFResult } from '../types/graph';

interface MetricsProps {
  graphData: GraphData | null;
  spofData: SPOFResult | null;
}

export const MetricsOverview: React.FC<MetricsProps> = ({ graphData, spofData }) => {
  const nodes = graphData?.nodes || [];
  const edges = graphData?.edges || [];

  const suppliersCount = nodes.filter(n => n.type === 'Supplier').length;
  const componentsCount = nodes.filter(n => n.type === 'Component').length;
  const productsCount = nodes.filter(n => n.type === 'Product').length;
  const spofCount = spofData?.spofCount || 0;

  const totalValueAtRisk = spofData?.bottlenecks.reduce((sum, item) => sum + item.totalValueAtRisk, 0) || 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
      
      {/* Metric 1: Total Topology */}
      <div className="glass-card p-4 rounded-xl border border-gray-800 flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <Network className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-400 font-medium">Graph Network</p>
          <h3 className="text-lg font-bold text-white">{nodes.length} <span className="text-xs text-gray-500 font-normal">nodes</span></h3>
          <p className="text-[10px] text-gray-500">{edges.length} relationships</p>
        </div>
      </div>

      {/* Metric 2: Suppliers */}
      <div className="glass-card p-4 rounded-xl border border-gray-800 flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <Truck className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-400 font-medium">Suppliers</p>
          <h3 className="text-lg font-bold text-cyan-400">{suppliersCount}</h3>
          <p className="text-[10px] text-gray-500">Tier 1 & Tier 2</p>
        </div>
      </div>

      {/* Metric 3: Components */}
      <div className="glass-card p-4 rounded-xl border border-gray-800 flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-400 font-medium">Components</p>
          <h3 className="text-lg font-bold text-purple-400">{componentsCount}</h3>
          <p className="text-[10px] text-gray-500">Sub-assemblies</p>
        </div>
      </div>

      {/* Metric 4: Finished Products */}
      <div className="glass-card p-4 rounded-xl border border-gray-800 flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20">
          <ShoppingBag className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-400 font-medium">End Products</p>
          <h3 className="text-lg font-bold text-pink-400">{productsCount}</h3>
          <p className="text-[10px] text-gray-500">Active SKUs</p>
        </div>
      </div>

      {/* Metric 5: Single Points of Failure */}
      <div className="glass-card p-4 rounded-xl border border-gray-800 flex items-center gap-3 col-span-2 md:col-span-1">
        <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <AlertOctagon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-400 font-medium">Active SPOFs</p>
          <h3 className="text-lg font-bold text-rose-400">{spofCount} <span className="text-xs text-gray-500 font-normal">bottlenecks</span></h3>
          <p className="text-[10px] text-rose-400/80 font-medium">${(totalValueAtRisk / 1000).toFixed(0)}k at risk</p>
        </div>
      </div>

    </div>
  );
};
