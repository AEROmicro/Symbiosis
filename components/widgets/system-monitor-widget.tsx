'use client'

import { useState, useEffect, useRef } from 'react'
import { Cpu, MemoryStick, Wifi, HardDrive, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Sample {
  cpu: number
  mem: number
  net: number
  disk: number
}

const HISTORY_LEN = 40

function MiniSparkline({ data, color = 'text-primary', max = 100 }: { data: number[]; color?: string; max?: number }) {
  const w = 80
  const h = 24
  if (data.length < 2) return null
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - (v / max) * h
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={h} className={cn('shrink-0', color)} viewBox={`0 0 ${w} ${h}`}>
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.8}
      />
      {/* Fill */}
      <polygon
        points={`0,${h} ${points} ${w},${h}`}
        fill="currentColor"
        opacity={0.08}
      />
    </svg>
  )
}

function GaugeBar({ value, max = 100, label, sublabel, colorClass }: {
  value: number; max?: number; label: string; sublabel: string; colorClass: string
}) {
  const pct = Math.min(100, (value / max) * 100)
  const danger = pct > 85
  const warn = pct > 60
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn('font-semibold tabular-nums', danger ? 'text-red-400' : warn ? 'text-yellow-400' : colorClass)}>
          {sublabel}
        </span>
      </div>
      <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', danger ? 'bg-red-400' : warn ? 'bg-yellow-400' : 'bg-primary')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// Realistic simulation — CPU follows bursty workload patterns
function generateSample(prev: Sample): Sample {
  const cpu = Math.max(2, Math.min(98, prev.cpu + (Math.random() - 0.48) * 12))
  const mem = Math.max(20, Math.min(92, prev.mem + (Math.random() - 0.5) * 2))
  const net = Math.max(0, Math.min(500, prev.net + (Math.random() - 0.5) * 80))
  const disk = Math.max(0, Math.min(300, prev.disk + (Math.random() - 0.5) * 50))
  return { cpu, mem, net, disk }
}

const PROCESS_NAMES = [
  ['node', 'next-server', 'electron', 'chrome', 'vscode', 'postgres', 'redis', 'nginx'],
  [12421, 8834, 3301, 22019, 11230, 5544, 6379, 1024],
]

function generateProcesses(cpu: number, mem: number) {
  const names = PROCESS_NAMES[0] as string[]
  return names.map((name, i) => ({
    pid: (PROCESS_NAMES[1] as number[])[i],
    name,
    cpu: parseFloat((Math.random() * (cpu / names.length) * 1.8).toFixed(1)),
    mem: parseFloat((Math.random() * (mem / names.length) * 1.5).toFixed(1)),
  })).sort((a, b) => b.cpu - a.cpu)
}

export function SystemMonitorWidget() {
  const [history, setHistory] = useState<Sample[]>(() => {
    const init: Sample = { cpu: 18, mem: 41, net: 45, disk: 12 }
    return Array.from({ length: HISTORY_LEN }, (_, i) => generateSample({ ...init, cpu: 10 + i * 0.4 }))
  })
  const [processes, setProcesses] = useState(() => generateProcesses(18, 41))
  const [tab, setTab] = useState<'overview' | 'processes' | 'network'>('overview')
  const [uptime, setUptime] = useState(0)
  const tickRef = useRef(0)

  const current = history[history.length - 1] ?? { cpu: 0, mem: 0, net: 0, disk: 0 }

  useEffect(() => {
    const id = setInterval(() => {
      tickRef.current++
      setUptime(s => s + 1)
      setHistory(prev => {
        const next = generateSample(prev[prev.length - 1])
        const newHistory = [...prev.slice(-(HISTORY_LEN - 1)), next]
        if (tickRef.current % 3 === 0) {
          setProcesses(generateProcesses(next.cpu, next.mem))
        }
        return newHistory
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const cpuHistory = history.map(s => s.cpu)
  const memHistory = history.map(s => s.mem)
  const netHistory = history.map(s => s.net)
  const diskHistory = history.map(s => s.disk)

  const formatUptime = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  // Simulated static system info
  const SYS = {
    os: 'Linux x86_64',
    kernel: '6.8.0-51-generic',
    hostname: 'symbiosis-node',
    cpu: 'Intel Core i7-12700K (12C/20T)',
    totalMem: 32,
    totalDisk: 512,
  }

  return (
    <div className="flex flex-col h-full font-mono text-xs">
      {/* Tab bar */}
      <div className="flex border-b border-border shrink-0">
        {(['overview', 'processes', 'network'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-1.5 text-[10px] uppercase tracking-wider transition-colors',
              tab === t ? 'text-primary border-b-2 border-primary -mb-px' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* CPU */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Cpu className="w-3 h-3 text-primary" />
              <span className="uppercase tracking-wider text-[9px]">CPU</span>
              <span className="ml-auto text-primary font-semibold">{current.cpu.toFixed(1)}%</span>
            </div>
            <GaugeBar
              value={current.cpu}
              label="Usage"
              sublabel={`${current.cpu.toFixed(1)}%`}
              colorClass="text-primary"
            />
            <div className="flex justify-end">
              <MiniSparkline data={cpuHistory} color="text-primary" />
            </div>
            <div className="text-[9px] text-muted-foreground">{SYS.cpu}</div>
          </div>

          {/* Memory */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MemoryStick className="w-3 h-3 text-blue-400" />
              <span className="uppercase tracking-wider text-[9px]">Memory</span>
              <span className="ml-auto text-blue-400 font-semibold">
                {((current.mem / 100) * SYS.totalMem).toFixed(1)} / {SYS.totalMem} GB
              </span>
            </div>
            <GaugeBar
              value={current.mem}
              label="RAM"
              sublabel={`${current.mem.toFixed(0)}%`}
              colorClass="text-blue-400"
            />
            <div className="flex justify-end">
              <MiniSparkline data={memHistory} color="text-blue-400" />
            </div>
          </div>

          {/* Disk */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <HardDrive className="w-3 h-3 text-amber-400" />
              <span className="uppercase tracking-wider text-[9px]">Disk I/O</span>
              <span className="ml-auto text-amber-400 font-semibold">{current.disk.toFixed(0)} MB/s</span>
            </div>
            <GaugeBar
              value={current.disk}
              max={300}
              label="Throughput"
              sublabel={`${current.disk.toFixed(0)} MB/s`}
              colorClass="text-amber-400"
            />
            <div className="flex justify-end">
              <MiniSparkline data={diskHistory} color="text-amber-400" max={300} />
            </div>
          </div>

          {/* System Info */}
          <div className="border-t border-border pt-3 space-y-1 text-[9px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">OS</span>
              <span>{SYS.os}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kernel</span>
              <span>{SYS.kernel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Host</span>
              <span className="text-primary">{SYS.hostname}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Uptime</span>
              <span className="tabular-nums text-primary">{formatUptime(uptime)}</span>
            </div>
          </div>
        </div>
      )}

      {tab === 'processes' && (
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border text-[9px] text-muted-foreground uppercase tracking-wider shrink-0">
            <span className="w-14">PID</span>
            <span className="flex-1">Process</span>
            <span className="w-12 text-right">CPU%</span>
            <span className="w-12 text-right">MEM%</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {processes.map(p => (
              <div
                key={p.pid}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-muted/20 transition-colors border-b border-border/30"
              >
                <span className="w-14 text-muted-foreground tabular-nums">{p.pid}</span>
                <span className="flex-1 text-foreground truncate">{p.name}</span>
                <span className={cn(
                  'w-12 text-right tabular-nums font-semibold',
                  p.cpu > 15 ? 'text-red-400' : p.cpu > 8 ? 'text-yellow-400' : 'text-primary',
                )}>
                  {p.cpu.toFixed(1)}
                </span>
                <span className={cn(
                  'w-12 text-right tabular-nums',
                  p.mem > 10 ? 'text-red-400' : 'text-blue-400',
                )}>
                  {p.mem.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'network' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Network */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Wifi className="w-3 h-3 text-cyan-400" />
              <span className="uppercase tracking-wider text-[9px]">Network</span>
              <span className="ml-auto text-cyan-400 font-semibold">{current.net.toFixed(0)} Mbps</span>
            </div>
            <GaugeBar
              value={current.net}
              max={500}
              label="Throughput"
              sublabel={`${current.net.toFixed(0)} Mbps`}
              colorClass="text-cyan-400"
            />
            <div className="flex justify-end">
              <MiniSparkline data={netHistory} color="text-cyan-400" max={500} />
            </div>
          </div>

          {/* Network interfaces (static sim) */}
          <div className="space-y-2">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Interfaces</p>
            {[
              { name: 'eth0', ip: '192.168.1.105', rx: (current.net * 0.7).toFixed(1), tx: (current.net * 0.3).toFixed(1), status: 'UP' },
              { name: 'lo', ip: '127.0.0.1', rx: '0.1', tx: '0.1', status: 'UP' },
              { name: 'wlan0', ip: 'N/A', rx: '0', tx: '0', status: 'DOWN' },
            ].map(iface => (
              <div key={iface.name} className="px-2.5 py-2 rounded bg-muted/20 border border-border/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{iface.name}</span>
                  <span className={cn('text-[9px]', iface.status === 'UP' ? 'text-primary' : 'text-muted-foreground')}>
                    {iface.status}
                  </span>
                </div>
                <div className="text-[9px] text-muted-foreground">{iface.ip}</div>
                <div className="flex gap-3 text-[9px]">
                  <span className="text-green-400">↓ {iface.rx} Mbps</span>
                  <span className="text-red-400">↑ {iface.tx} Mbps</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status bar */}
      <div className="flex-none px-3 py-1 border-t border-border text-[9px] text-muted-foreground flex gap-3">
        <span className="flex items-center gap-1">
          <Activity className="w-2.5 h-2.5 text-primary" />
          CPU {current.cpu.toFixed(0)}%
        </span>
        <span>MEM {current.mem.toFixed(0)}%</span>
        <span className="ml-auto tabular-nums">Up {formatUptime(uptime)}</span>
      </div>
    </div>
  )
}
