import React from 'react';
import { Terminal, Code, Copy, Check } from 'lucide-react';

interface QueryConsoleProps {
  query: string;
  parameters?: Record<string, any>;
  explanation?: string;
}

export const QueryConsole: React.FC<QueryConsoleProps> = ({
  query,
  parameters = {},
  explanation = 'Multi-hop relationship query executed via openCypher over Bolt 5.4 protocol.'
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel rounded-xl border border-gray-800 p-4 mt-6">
      
      <div className="flex items-center justify-between mb-2 border-b border-gray-800 pb-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Active CognoDB openCypher Query Inspector</h3>
        </div>
        
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 transition"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy Cypher'}
        </button>
      </div>

      <p className="text-[11px] text-gray-400 mb-2">{explanation}</p>

      <div className="bg-[#060911] p-3 rounded-lg border border-gray-900 font-mono text-xs text-cyan-300 overflow-x-auto">
        <pre className="whitespace-pre-wrap">{query || '// Select an entity or tab to view Cypher query execution'}</pre>
      </div>

      {Object.keys(parameters).length > 0 && (
        <div className="mt-2 text-[11px] text-gray-400 flex items-center gap-2">
          <Code className="w-3 h-3 text-purple-400" />
          <span>Bound Parameters: <code className="text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">{JSON.stringify(parameters)}</code></span>
        </div>
      )}

    </div>
  );
};
