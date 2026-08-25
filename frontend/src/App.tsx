import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MetricsOverview } from './components/MetricsOverview';
import { GraphCanvas } from './components/GraphCanvas';
import { BlastRadiusPanel } from './components/BlastRadiusPanel';
import { SpofAnalysisPanel } from './components/SpofAnalysisPanel';
import { QueryConsole } from './components/QueryConsole';
import { 
  GraphData, 
  BlastRadiusResult, 
  SPOFResult, 
  AlternativeResult, 
  DatabaseHealth 
} from './types/graph';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [health, setHealth] = useState<DatabaseHealth | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [spofData, setSpofData] = useState<SPOFResult | null>(null);
  const [blastRadius, setBlastRadius] = useState<BlastRadiusResult | null>(null);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  
  const [selectedComponentAlt, setSelectedComponentAlt] = useState<AlternativeResult | null>(null);
  const [loadingAlt, setLoadingAlt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeQuery, setActiveQuery] = useState<string>('MATCH (n) OPTIONAL MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 100;');

  // Fetch Database Health
  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealth(data);
    } catch {
      setHealth({ connected: false, message: 'Could not connect to backend server at http://localhost:5000' });
    }
  };

  // Fetch Graph & SPOF Data
  const loadInitialData = async () => {
    setLoading(true);
    await checkHealth();
    try {
      const [gRes, sRes] = await Promise.all([
        fetch('/api/graph'),
        fetch('/api/spof')
      ]);

      if (gRes.ok) {
        const gData = await gRes.json();
        setGraphData(gData);
      }
      if (sRes.ok) {
        const sData = await sRes.json();
        setSpofData(sData);
      }
    } catch (err) {
      console.error('Error loading initial graph data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Compute Blast Radius
  const handleSelectEntity = async (id: string) => {
    setSelectedEntityId(id);
    setLoading(true);
    try {
      const res = await fetch(`/api/blast-radius/${id}`);
      if (res.ok) {
        const data: BlastRadiusResult = await res.json();
        setBlastRadius(data);
        setActiveQuery(data.cypherQueryUsed);
      }
    } catch (err) {
      console.error('Error fetching blast radius:', err);
    } finally {
      setLoading(false);
    }
  };

  // Find Alternative Suppliers
  const handleFindAlternatives = async (componentId: string) => {
    setLoadingAlt(true);
    try {
      const res = await fetch(`/api/alternatives/${componentId}`);
      if (res.ok) {
        const data: AlternativeResult = await res.json();
        setSelectedComponentAlt(data);
        setActiveQuery(data.cypherQueryUsed);
      }
    } catch (err) {
      console.error('Error fetching alternative suppliers:', err);
    } finally {
      setLoadingAlt(false);
    }
  };

  // Trigger Database Seed
  const handleSeed = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) {
        await loadInitialData();
      }
    } catch (err) {
      console.error('Error seeding database:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col pb-12">
      
      {/* Header */}
      <Header
        health={health}
        loading={loading}
        onRefresh={loadInitialData}
        onSeed={handleSeed}
      />

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-6 pt-6 flex-1 w-full">
        
        {/* Offline Warning Banner */}
        {health && !health.connected && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs text-rose-300">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-rose-200">CognoDB Cloud Instance Unreachable</p>
                <p className="text-rose-300/80">{health.message}</p>
              </div>
            </div>
            <button
              onClick={checkHealth}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Connection
            </button>
          </div>
        )}

        {/* Metrics Bar */}
        <MetricsOverview
          graphData={graphData}
          spofData={spofData}
        />

        {/* Graph Canvas & Disruption Simulator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <GraphCanvas
              graphData={graphData}
              impactedNodes={blastRadius?.impactedNodes || []}
              selectedEntityId={selectedEntityId}
              onSelectNode={(id) => handleSelectEntity(id)}
            />
          </div>
          <div>
            <BlastRadiusPanel
              nodes={graphData?.nodes || []}
              selectedEntityId={selectedEntityId}
              blastRadius={blastRadius}
              loading={loading}
              onSelectEntity={handleSelectEntity}
            />
          </div>
        </div>

        {/* Single Point of Failure Bottlenecks */}
        <SpofAnalysisPanel
          spofData={spofData}
          selectedComponentAlt={selectedComponentAlt}
          loadingAlt={loadingAlt}
          onFindAlternatives={handleFindAlternatives}
        />

        {/* Active Cypher Query Inspector */}
        <QueryConsole
          query={activeQuery}
          parameters={selectedEntityId ? { entityId: selectedEntityId } : { limit: 100 }}
          explanation="OpenCypher query running directly on CognoDB Cloud over Bolt protocol."
        />

      </main>

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-gray-500 border-t border-gray-900 pt-6">
        CognoDB Graph Database Application • Built for Wexa AI Assessment • Powered by openCypher & Neo4j Bolt Protocol
      </footer>

    </div>
  );
};
