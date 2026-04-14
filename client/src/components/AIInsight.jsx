import { useState } from 'react';
import { getAIInsights } from '../api/ai.js';

const typeIcon = { pattern: '◈', weakness: '◧', improvement: '◎' };
const typeColor = { pattern: 'text-blue-400', weakness: 'text-red-400', improvement: 'text-green-400' };

export default function AIInsight() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await getAIInsights();
      setInsights(data.insights || []);
      setFetched(true);
    } finally {
      setLoading(false);
    }
  };

  if (!fetched) {
    return (
      <div className="card p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-text-secondary text-xs uppercase tracking-wide">AI Insights</span>
          <button onClick={fetch} disabled={loading} className="btn-ghost text-xs py-1 px-3">
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
        <p className="text-text-muted text-xs">Get pattern analysis from your last 30 days.</p>
      </div>
    );
  }

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-text-secondary text-xs uppercase tracking-wide">AI Insights</span>
        <button onClick={fetch} disabled={loading} className="text-text-muted text-xs hover:text-text-secondary transition-colors">
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      {insights.map((ins, i) => (
        <div key={i} className="flex gap-2.5 items-start">
          <span className={`text-sm mt-0.5 shrink-0 ${typeColor[ins.type]}`}>{typeIcon[ins.type]}</span>
          <p className="text-text-secondary text-xs leading-relaxed">{ins.text}</p>
        </div>
      ))}
    </div>
  );
}
