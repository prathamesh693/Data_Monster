import { useMemo, useState } from "react";
import Card from "../components/Card";
import Badge from "../components/Badge";
import { connectDatabase } from "../api/connections";
import { Database, Globe, Lock, Server, Link, Settings2, CheckCircle2, AlertCircle, Loader2, Zap, ShieldCheck } from "lucide-react";

const DB_TYPES = [
  { id: "postgres", name: "PostgreSQL", icon: Database, color: "text-blue-500", defaultPort: "5432" },
  { id: "mysql", name: "MySQL", icon: Server, color: "text-orange-500", defaultPort: "3306" },
  { id: "mongodb", name: "MongoDB", icon: Globe, color: "text-emerald-500", defaultPort: "27017" },
  { id: "sqlserver", name: "SQL Server (MSSQL)", icon: Server, color: "text-red-500", defaultPort: "1433" },
  { id: "sqlite", name: "SQLite", icon: Database, color: "text-sky-500", defaultPort: "" },
  { id: "oracle", name: "Oracle", icon: Database, color: "text-red-600", defaultPort: "1521" },
  { id: "snowflake", name: "Snowflake", icon: Globe, color: "text-blue-400", defaultPort: "443" },
  { id: "redis", name: "Redis", icon: Zap, color: "text-red-500", defaultPort: "6379" }
];

const parseConnectionUrl = (dbType, inputUrl) => {
  if (!inputUrl) {
    throw new Error("Connection URL is required.");
  }
  try {
    if (dbType === "sqlite") {
      return { storage: inputUrl };
    }
    const parsedUrl = new URL(inputUrl);
    if (dbType === "mongodb") {
      return { uri: inputUrl };
    }
    const sslmode = parsedUrl.searchParams.get("sslmode") || "";
    return {
      host: parsedUrl.hostname,
      port: parsedUrl.port || DB_TYPES.find(d => d.id === dbType)?.defaultPort || "",
      database: parsedUrl.pathname.replace(/^\//, "").split("/")[0] || "",
      user: decodeURIComponent(parsedUrl.username),
      password: decodeURIComponent(parsedUrl.password),
      ...(dbType === "postgres" && sslmode ? { sslmode } : {}),
    };
  } catch (e) {
    throw new Error("Invalid connection URL format.");
  }
};

function ConnectionsPage() {
  const [dbType, setDbType] = useState("postgres");
  const [mode, setMode] = useState("url");
  const [connectionUrl, setConnectionUrl] = useState("");
  const [formData, setFormData] = useState({
    host: "",
    port: "",
    database: "",
    username: "",
    password: "",
    storage: "", // For SQLite
    account: "", // For Snowflake
    warehouse: "", // For Snowflake
    postgresDisableSsl: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const activeDB = useMemo(() => DB_TYPES.find(d => d.id === dbType), [dbType]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });

    try {
      let config;
      if (mode === "url") {
        config = parseConnectionUrl(dbType, connectionUrl);
      } else {
        if (dbType === "mongodb") {
          config = { uri: `mongodb://${formData.username}:${formData.password}@${formData.host}:${formData.port}/${formData.database}` };
        } else if (dbType === "sqlite") {
          config = { storage: formData.storage };
        } else if (dbType === "snowflake") {
          config = {
            account: formData.account,
            username: formData.username,
            password: formData.password,
            warehouse: formData.warehouse,
            database: formData.database
          };
        } else {
          config = {
            host: formData.host,
            port: formData.port,
            database: formData.database,
            user: formData.username,
            password: formData.password,
            ...(dbType === "postgres"
              ? { ssl: formData.postgresDisableSsl ? false : undefined }
              : {}),
          };
        }
      }

      const result = await connectDatabase({ dbType, config });
      setFeedback({
        type: "success",
        message: result.message || `Successfully connected to ${activeDB.name}!`,
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Unable to connect. Please check your credentials.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      <Card title="Database Connection" subtitle="Select your database type and configure the connection.">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground" style={{ color: "var(--text-muted)" }}>
              Select Database Type
            </label>
            <div className="relative">
              <select
                value={dbType}
                onChange={(e) => {
                  setDbType(e.target.value);
                  const selected = DB_TYPES.find(d => d.id === e.target.value);
                  setFormData(prev => ({ ...prev, port: selected?.defaultPort || "" }));
                }}
                className="input-base appearance-none cursor-pointer pr-10"
                style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-default)" }}
              >
                {DB_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground" style={{ color: "var(--text-muted)" }}>
                <Settings2 size={16} />
              </div>
            </div>
          </div>

          <div className="flex gap-1 p-1 rounded-lg w-fit border" style={{ backgroundColor: "var(--bg-toggle)", borderColor: "var(--border-default)" }}>
            {[{ id: "url", label: "Connection URL", icon: Link }, { id: "manual", label: "Manual Form", icon: Settings2 }].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMode(tab.id)}
                className="flex items-center gap-2 rounded px-4 py-2 text-xs font-bold transition-all"
                style={{
                  backgroundColor: mode === tab.id ? "var(--bg-card)" : "transparent",
                  color: mode === tab.id ? "var(--primary)" : "var(--text-secondary)",
                  boxShadow: mode === tab.id ? "var(--shadow-sm)" : "none",
                }}
              >
                <tab.icon size={13} /> {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {mode === "url" ? (
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Connection URL</label>
                <input
                  type="text"
                  placeholder={
                    dbType === 'mongodb' ? "mongodb+srv://user:pass@cluster.mongodb.net/db" : 
                    dbType === 'sqlite' ? "/path/to/database.sqlite" :
                    dbType === 'postgres' ? "postgresql://user:pass@host:5432/db" :
                    `${dbType}://user:pass@host:port/db`
                  }
                  className="input-base"
                  value={connectionUrl}
                  onChange={(e) => setConnectionUrl(e.target.value)}
                  required
                />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {dbType === "sqlite" ? (
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Database File Path</label>
                    <input
                      type="text"
                      placeholder="/path/to/database.sqlite"
                      className="input-base"
                      value={formData.storage}
                      onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                      required
                    />
                  </div>
                ) : dbType === "snowflake" ? (
                  <>
                    {[{label:"Account",key:"account",placeholder:"xy12345.us-east-1"},{label:"Username",key:"username",placeholder:"admin"},{label:"Warehouse",key:"warehouse",placeholder:"COMPUTE_WH"},{label:"Database",key:"database",placeholder:"MY_DB"}].map(field => (
                      <div key={field.key} className="space-y-2">
                        <label className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>{field.label}</label>
                        <input
                          type="text"
                          placeholder={field.placeholder}
                          className="input-base"
                          value={formData[field.key]}
                          onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                          required
                        />
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {[{label:"Host",key:"host",placeholder:"localhost"},{label:"Port",key:"port",placeholder:activeDB.defaultPort},{label:"Database Name",key:"database",placeholder:"my_database"},{label:"Username",key:"username",placeholder:"admin"}].map(field => (
                      <div key={field.key} className="space-y-2">
                        <label className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>{field.label}</label>
                        <input
                          type="text"
                          placeholder={field.placeholder}
                          className="input-base"
                          value={formData[field.key]}
                          onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                          required
                        />
                      </div>
                    ))}
                  </>
                )}
                
                {dbType !== "sqlite" && (
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Password</label>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="input-base pr-10"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                      <Lock size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                    </div>
                  </div>
                )}

                {dbType === "postgres" && (
                  <label className="sm:col-span-2 flex cursor-pointer items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <input
                      type="checkbox"
                      checked={formData.postgresDisableSsl}
                      onChange={(e) => setFormData({ ...formData, postgresDisableSsl: e.target.checked })}
                      className="rounded border"
                    />
                    Disable SSL (local PostgreSQL only)
                  </label>
                )}
              </div>
            )}

            {feedback.message && (
              <div
                className="flex items-center gap-3 rounded-xl border p-4 text-sm font-medium animate-in fade-in zoom-in duration-200"
                style={{
                  backgroundColor: feedback.type === 'success' ? "var(--success-bg)" : "var(--error-bg)",
                  borderColor: feedback.type === 'success' ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)",
                  color: feedback.type === 'success' ? "var(--success-text)" : "var(--error-text)",
                }}
              >
                {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {feedback.message}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                {isSubmitting ? "Testing Connection…" : `Connect to ${activeDB.name}`}
              </button>
            </div>
          </form>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="p-5 rounded-xl border flex items-center gap-4" style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border-default)" }}>
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Encrypted Storage</h4>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Your credentials are encrypted at rest.</p>
          </div>
        </div>
        <div className="p-5 rounded-xl border flex items-center gap-4" style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border-default)" }}>
          <div className="p-3 rounded-lg bg-success/10 text-success">
            <Globe size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Cloud Ready</h4>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Support for AWS, Azure, and GCP sources.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConnectionsPage;
