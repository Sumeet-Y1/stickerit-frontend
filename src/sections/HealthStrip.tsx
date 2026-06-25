import { formatBytes, formatUptime, type ServerHealthResponse } from '../lib/backend';

interface HealthStripProps {
  health: ServerHealthResponse | null;
  loading: boolean;
  error: string | null;
}

export default function HealthStrip({ health, loading, error }: HealthStripProps) {
  const dependencies = health ? Object.entries(health.configuration.dependencies) : [];
  const healthyCount = dependencies.filter(([, ready]) => ready).length;

  return (
    <section className="relative z-40 border-b border-black/10 bg-[#F5F0E8]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="rounded-full px-3 py-1 text-[11px] font-mono uppercase tracking-[0.1em]"
            style={{
              background: loading ? 'rgba(122, 173, 160, 0.16)' : error ? 'rgba(232, 96, 76, 0.14)' : 'rgba(42, 80, 64, 0.12)',
              color: error ? '#E8604C' : '#2A5040',
            }}
          >
            {loading ? 'Checking API' : error ? 'API offline' : `API ${health?.status ?? 'unknown'}`}
          </span>

          <p className="text-sm text-[#3D3A36]">
            {error
              ? error
              : health
                ? `Backend ${health.application.name} v${health.application.version} is live on port ${health.configuration.serverPort}.`
                : 'Loading live backend status...'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono uppercase tracking-[0.08em] text-[#2A5040]">
          {health && (
            <>
              <span className="rounded-full bg-[#B5CEBC] px-3 py-1">
                uptime {formatUptime(health.runtime.uptimeMillis)}
              </span>
              <span className="rounded-full bg-[#B5CEBC] px-3 py-1">
                memory {formatBytes(health.runtime.usedMemoryBytes)} / {formatBytes(health.runtime.maxMemoryBytes)}
              </span>
              <span className="rounded-full bg-[#B5CEBC] px-3 py-1">
                {healthyCount}/{dependencies.length} deps ready
              </span>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
