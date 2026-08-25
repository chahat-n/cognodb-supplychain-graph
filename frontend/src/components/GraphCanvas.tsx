import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { GraphData, ImpactedNode } from '../types/graph';
import { MousePointerClick } from 'lucide-react';

interface GraphCanvasProps {
  graphData: GraphData | null;
  impactedNodes: ImpactedNode[];
  selectedEntityId: string | null;
  onSelectNode: (nodeId: string, nodeType: string) => void;
}

const TYPE_COLORS: Record<string, { bg: string; border: string; highlight: string }> = {
  Supplier: { bg: '#3B82F6', border: '#1D4ED8', highlight: '#60A5FA' },
  Component: { bg: '#8B5CF6', border: '#6D28D9', highlight: '#A78BFA' },
  Product: { bg: '#EC4899', border: '#BE185D', highlight: '#F472B6' },
  Facility: { bg: '#F59E0B', border: '#B45309', highlight: '#FBBF24' },
  Customer: { bg: '#10B981', border: '#047857', highlight: '#34D399' },
};

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  graphData,
  impactedNodes,
  selectedEntityId,
  onSelectNode
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);

  const impactedIds = new Set(impactedNodes.map(n => n.id));

  useEffect(() => {
    if (!containerRef.current || !graphData) return;

    // Transform nodes for vis-network
    const nodesArray = graphData.nodes.map(n => {
      const isSelected = n.id === selectedEntityId;
      const isImpacted = impactedIds.has(n.id);
      const colorScheme = TYPE_COLORS[n.type] || { bg: '#6B7280', border: '#374151', highlight: '#9CA3AF' };

      let background = colorScheme.bg;
      let borderWidth = 2;
      let borderColor = colorScheme.border;
      let size = 22;

      if (isSelected) {
        background = '#EF4444'; // Red focal disruption
        borderColor = '#FFFFFF';
        borderWidth = 4;
        size = 30;
      } else if (isImpacted) {
        background = '#F87171'; // Warning light red
        borderColor = '#DC2626';
        borderWidth = 3;
        size = 26;
      }

      return {
        id: n.id,
        label: `${n.label}\n(${n.type})`,
        shape: n.type === 'Supplier' ? 'diamond' : n.type === 'Product' ? 'box' : 'ellipse',
        size,
        color: {
          background,
          border: borderColor,
          highlight: {
            background: colorScheme.highlight,
            border: '#FFFFFF'
          }
        },
        font: {
          color: '#F9FAFB',
          size: 11,
          face: 'Inter, sans-serif'
        },
        borderWidth,
        title: `<b>${n.label}</b><br/>Type: ${n.type}<br/>ID: ${n.id}`
      };
    });

    // Transform edges
    const edgesArray = graphData.edges.map(e => {
      const isImpactPath = impactedIds.has(e.from) && impactedIds.has(e.to);
      return {
        id: e.id,
        from: e.from,
        to: e.to,
        label: e.label,
        arrows: 'to',
        color: {
          color: isImpactPath ? '#EF4444' : '#4B5563',
          highlight: '#06B6D4',
          hover: '#06B6D4'
        },
        width: isImpactPath ? 3 : 1.5,
        font: {
          color: isImpactPath ? '#FCA5A5' : '#9CA3AF',
          size: 9,
          align: 'middle'
        }
      };
    });

    const data = {
      nodes: new DataSet(nodesArray),
      edges: new DataSet(edgesArray)
    };

    const options = {
      nodes: {
        shadow: true
      },
      edges: {
        smooth: {
          type: 'cubicBezier',
          forceDirection: 'horizontal'
        }
      },
      physics: {
        solver: 'forceAtlas2Based',
        forceAtlas2Based: {
          gravitationalConstant: -50,
          centralGravity: 0.01,
          springLength: 100,
          springConstant: 0.08
        },
        stabilization: { iterations: 150 }
      },
      interaction: {
        hover: true,
        tooltipDelay: 100,
        zoomView: true
      }
    };

    const network = new Network(containerRef.current, data, options as any);
    networkRef.current = network;

    // Handle node selection
    network.on('click', (params) => {
      if (params.nodes.length > 0) {
        const clickedId = params.nodes[0];
        const matchedNode = graphData.nodes.find(n => n.id === clickedId);
        if (matchedNode) {
          onSelectNode(matchedNode.id, matchedNode.type);
        }
      }
    });

    return () => {
      network.destroy();
    };
  }, [graphData, impactedNodes, selectedEntityId]);

  return (
    <div className="glass-panel rounded-xl border border-gray-800 p-4 relative flex flex-col h-[520px]">
      
      {/* Visualizer Header Bar */}
      <div className="flex items-center justify-between mb-3 border-b border-gray-800/80 pb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-white tracking-wide">Interactive Graph Topology Canvas</h2>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <MousePointerClick className="w-3.5 h-3.5 text-cyan-400" /> Click any node to simulate disruption
          </span>
        </div>

        {/* Color Legend */}
        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span className="text-gray-300">Supplier</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span className="text-gray-300">Component</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
            <span className="text-gray-300">Product</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-gray-300">Facility</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-gray-300">Customer</span>
          </div>
        </div>
      </div>

      {/* Canvas Mount Container */}
      <div ref={containerRef} className="w-full flex-1 rounded-lg bg-[#080B12]/80 border border-gray-900 overflow-hidden" />
    </div>
  );
};
