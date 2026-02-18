import { useState, useEffect } from 'react'
import { fetchStats } from '../api/ticketService'
import './StatsBoard.css'

function StatsBoard({ refreshTrigger }) {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        fetchStats()
            .then((data) => setStats(data))
            .catch(() => setStats(null))
            .finally(() => setLoading(false))
    }, [refreshTrigger])

    if (loading) return <div className="stats-placeholder">Loading stats...</div>
    if (!stats) return null

    const total = stats.total_tickets || 0

    return (
        <div className="stats-area">
            {/* 4 Stat Cards */}
            <div className="stat-row">
                <StatCard icon="📂" label="Open Tickets:" value={stats.open_tickets} />
                <StatCard icon="🔄" label="In Progress:" value={stats.in_progress_tickets} />
                <StatCard icon="✓" label="Resolved:" value={stats.resolved_tickets} />
                <StatCard icon="📊" label="Avg / Day:" value={stats.avg_tickets_per_day} />
            </div>

            {/* Breakdowns */}
            <div className="breakdown-row">
                <div className="breakdown-panel">
                    <h3 className="breakdown-panel__title">Priority Breakdown</h3>
                    <div className="breakdown-bars">
                        <Bar label="Low" value={stats.priority_breakdown.low} total={total} color="#5b9bd5" />
                        <Bar label="Medium" value={stats.priority_breakdown.medium} total={total} color="#e6b422" />
                        <Bar label="High" value={stats.priority_breakdown.high} total={total} color="#e07b4b" />
                        <Bar label="Critical" value={stats.priority_breakdown.critical} total={total} color="#c0392b" />
                    </div>
                </div>

                <div className="breakdown-panel">
                    <h3 className="breakdown-panel__title">Category Breakdown</h3>
                    <div className="donut-area">
                        <Donut data={stats.category_breakdown} total={total} />
                        <div className="donut-legend">
                            <Dot color="#4a8c5c" label="Technical" value={stats.category_breakdown.technical} total={total} />
                            <Dot color="#2c2c2c" label="Billing" value={stats.category_breakdown.billing} total={total} />
                            <Dot color="#5b9bd5" label="Account" value={stats.category_breakdown.account} total={total} />
                            <Dot color="#e6b422" label="Feature Request" value={0} total={total} />
                            <Dot color="#bbb" label="General" value={stats.category_breakdown.general} total={total} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ icon, label, value }) {
    return (
        <div className="stat-card">
            <div className="stat-card__icon">{icon}</div>
            <div>
                <div className="stat-card__label">{label}</div>
                <div className="stat-card__value">{value}</div>
            </div>
        </div>
    )
}

function Bar({ label, value, total, color }) {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0
    return (
        <div className="bar-row">
            <span className="bar-row__label">{label}: {pct}%</span>
            <div className="bar-row__track">
                <div className="bar-row__fill" style={{ width: `${pct}%`, background: color }} />
            </div>
            <span className="bar-row__pct">{pct}%</span>
        </div>
    )
}

function Donut({ data, total }) {
    const colors = ['#4a8c5c', '#2c2c2c', '#5b9bd5', '#e6b422', '#bbb']
    const values = [data.technical, data.billing, data.account, 0, data.general]

    if (total === 0) {
        return (
            <div className="donut-chart">
                <svg viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#e0dbd3" strokeWidth="4" />
                </svg>
            </div>
        )
    }

    let offset = 0
    return (
        <div className="donut-chart">
            <svg viewBox="0 0 36 36">
                {values.map((v, i) => {
                    const pct = (v / total) * 100
                    const el = (
                        <circle
                            key={i}
                            cx="18" cy="18" r="14"
                            fill="none"
                            stroke={colors[i]}
                            strokeWidth="4"
                            strokeDasharray={`${pct} ${100 - pct}`}
                            strokeDashoffset={-offset}
                            style={{ transition: 'stroke-dasharray 0.4s' }}
                        />
                    )
                    offset += pct
                    return el
                })}
            </svg>
        </div>
    )
}

function Dot({ color, label, value, total }) {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0
    return (
        <div className="dot-item">
            <span className="dot-item__dot" style={{ background: color }} />
            <span className="dot-item__text">{label}: {pct}%</span>
        </div>
    )
}

export default StatsBoard
