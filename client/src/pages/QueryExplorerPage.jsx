import { useState } from "react";
import Card from "../components/Card";
import Table from "../components/Table";
import Badge from "../components/Badge";
import ErrorMessage from "../components/ErrorMessage";
import { executeQuery } from "../api";
import { Play, RotateCcw, Download, Save, Search, Terminal, Database, Loader2 } from "lucide-react";

const INITIAL_QUERY = "SELECT * FROM users LIMIT 10;";
const READ_ONLY_START = /^(select|with|show|describe|desc|explain)\b/i;
const BLOCKED_SQL = /\b(insert|update|delete|truncate|drop|alter|create|replace|merge|grant|revoke|call|execute|exec|set|rename)\b/i;

const validateReadOnlyQuery = (rawQuery) => {
  const normalized = (rawQuery || "").trim();
  if (!normalized) return "Query is required.";
  if (normalized.split(";").filter(Boolean).length > 1) return "Only a single read-only query is allowed.";
  if (!READ_ONLY_START.test(normalized)) {
    return "Only read-only SQL is allowed (SELECT, WITH, SHOW, DESCRIBE, EXPLAIN).";
  }
  if (BLOCKED_SQL.test(normalized)) {
    return "Write/DDL commands are blocked. This editor is strictly read-only.";
  }
  return null;
};

function QueryExplorerPage() {
  const [query, setQuery] = useState(INITIAL_QUERY);
  const [executing, setExecuting] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleExecute = async () => {
    const validationError = validateReadOnlyQuery(query);
    if (validationError) {
      setError(validationError);
      setResults(null);
      return;
    }

    setExecuting(true);
    setError(null);
    try {
      const data = await executeQuery(query);
      setResults(data);
    } catch (err) {
      setError(err.message);
      setResults(null);
    } finally {
      setExecuting(false);
    }
  };

  const handleReset = () => {
    setQuery(INITIAL_QUERY);
    setResults(null);
    setError(null);
  };

  const columns = results?.rows?.length > 0 
    ? Object.keys(results.rows[0]).map(key => ({ key, label: key.charAt(0).toUpperCase() + key.slice(1) }))
    : [];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Query Editor */}
        <div className="space-y-4">
          <Card 
            title="SQL Editor" 
            subtitle="Read-only SQL editor. Only SELECT/WITH/SHOW/DESCRIBE/EXPLAIN are allowed."
            action={
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="btn-ghost text-xs px-3 py-1.5"
                  title="Reset Query"
                >
                  <RotateCcw size={14} /> Reset
                </button>
                <button
                  onClick={handleExecute}
                  disabled={executing}
                  className="btn-primary text-xs px-3 py-1.5"
                  style={{ boxShadow: "none" }}
                >
                  {executing ? <Loader2 className="animate-spin" size={13} /> : <Play size={13} />}
                  Run Query
                </button>
              </div>
            }
          >
            <div
              className="relative mt-2 rounded-xl border p-4"
              style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)" }}
            >
              <div className="absolute left-4 top-4" style={{ color: "var(--text-muted)" }}>
                <Terminal size={18} />
              </div>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="min-h-[200px] w-full bg-transparent pl-8 font-mono text-sm outline-none"
                style={{ color: "var(--text-primary)" }}
                placeholder="Enter your SQL query here..."
                spellCheck="false"
              />
            </div>
          </Card>

          {error && <ErrorMessage message={error} />}

          {/* Results Section */}
          <Card title="Query Results">
            {results ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="success">{results.rows.length} Rows Returned</Badge>
                    <span className="text-xs  text-slate-400 font-medium italic">
                      {results.mock ? "Mock Data" : "Real Data"}
                    </span>
                  </div>
                  <button className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover: hover:text-slate-700 transition-colors">
                    <Download size={14} /> Export CSV
                  </button>
                </div>
                <Table
                  columns={columns}
                  rows={results.rows}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 rounded-full p-4" style={{ backgroundColor: "var(--bg-subtle)", color: "var(--text-muted)" }}>
                  <Search size={32} />
                </div>
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>No results to display</h3>
                <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>Run a query to see the data from your connected sources.</p>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar - Saved Queries & Schema */}
        {/* <div className="space-y-6">
          <Card title="Schema Explorer">
            <div className="space-y-4">
              <div className="rounded-lg  bg-slate-50 p-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider  text-slate-400 mb-3">
                  <Database size={14} /> postgres_db
                </div>
                <div className="space-y-2">
                  {['users', 'orders', 'products', 'audit_logs'].map(table => (
                    <button key={table} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm  text-slate-600 hover: hover:bg-white transition-colors">
                      <Terminal size={12} className="text-orange-500" />
                      {table}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card title="Saved Queries">
            <div className="space-y-2">
              {[
                { name: "Active Users", icon: Save },
                { name: "Daily Revenue", icon: Save },
                { name: "PII Audit", icon: Save }
              ].map((q, i) => (
                <button key={i} className="flex w-full items-center justify-between rounded-lg border  border-slate-100  bg-white p-3 text-left transition-all hover: hover:border-orange-500/50">
                  <span className="text-xs font-medium  text-slate-700">{q.name}</span>
                  <q.icon size={12} className=" text-slate-400" />
                </button>
              ))}
            </div>
          </Card>
        </div> */}
      </div>
    </div>
  );
}

export default QueryExplorerPage;
