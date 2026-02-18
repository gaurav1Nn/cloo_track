import { useState, useEffect } from 'react'
import { fetchStats } from '../api/ticketService'
import './StatsBoard.css'

function StatsBoard({ refreshTrigger }) {
    const [stats, setStats] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadStats = async () => {
            setIsLoading(true)
            try {
                const data = await fetchStats()
                setStats(data)
            } catch {
                setStats(null)
            }
            setIsLoading(false)
        }
        loadStats()
    }, [refreshTrigger])

    if (isLoading) {
        return (
            <div className="stats-loading">
                <div className="stats-loading__spinner" />
                <span>Loading statistics...</span>
            </div>
        )
    }

    if (!stats) return null

    const total = stats.total_tickets || 0

    return (
        <div className="stats-section">
            {/* Top stat cards */}
            <div className="stat-cards">
                <div className="stat-card">
                    <div className="stat-card__icon stat-card__icon--total">📋</div>
                    <div className="stat-card__info">
                        <span className="stat-card__label">Total Tickets</span>
                        <span className="stat-card__value">{total}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__icon stat-card__icon--open">📂</div>
                    <div className="stat-card__info">
                        <span className="stat-card__label">Open Tickets</span>
                        <span className="stat-card__value">{stats.open_tickets}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__icon stat-card__icon--resolved">✅</div>
                    <div className="stat-card__info">
                        <span className="stat-card__label">Avg / Day</span>
                        <span className="stat-card__value">{stats.avg_tickets_per_day}</span>
                    </div>
                </div>
            </div>

            {/* Breakdowns */}
            <div className="breakdowns-row">
                {/* Priority Breakdown */}
                <div className="breakdown-card">
                    <h3 className="breakdown-card__title">Priority Breakdown</h3>
                    <div className="breakdown-card__bars">
                        <BarItem label="Low" value={stats.priority_breakdown.low} total={total} color="var(--priority-low)" />
                        <BarItem label="Medium" value={stats.priority_breakdown.medium} total={total} color="var(--priority-medium)" />
                        <BarItem label="High" value={stats.priority_breakdown.high} total={total} color="var(--priority-high)" />
                        <BarItem label="Critical" value={stats.priority_breakdown.critical} total={total} color="var(--priority-critical)" />
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="breakdown-card">
                    <h3 className="breakdown-card__title">Category Breakdown</h3>
                    <div className="breakdown-card__donut-container">
                        <DonutChart data={stats.category_breakdown} total={total} />
                        <div className="breakdown-card__legend">
                            <LegendItem label="Technical" value={stats.category_breakdown.technical} total={total} color="var(--cat-technical)" />
                            <LegendItem label="Billing" value={stats.category_breakdown.billing} total={total} color="var(--cat-billing)" />
                            <LegendItem label="Account" value={stats.category_breakdown.account} total={total} color="var(--cat-account)" />
                            <LegendItem label="General" value={stats.category_breakdown.general} total={total} color="var(--cat-general)" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function BarItem({ label, value, total, color }) {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0
    return (
        <div className="bar-item">
            <div className="bar-item__header">
                <span className="bar-item__label">{label}: {pct}%</span>
                <span className="bar-item__value">{pct}%</span>
            </div>
            <div className="bar-item__track">
                <div className="bar-item__fill" style={{ width: `${pct}%`, backgroundColor: color }} />
            </div>
        </div>
    )
}

function DonutChart({ data, total }) {
    if (total === 0) {
        return (
            <div className="donut">
                <svg viewBox="0 0 36 36" className="donut__svg">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e8e0d8" strokeWidth="3" />
                </svg>
                <span className="donut__center">0</span>
            </div>
        )
    }

    const colors = ['var(--cat-technical)', 'var(--cat-billing)', 'var(--cat-account)', 'var(--cat-general)']
    const values = [data.technical, data.billing, data.account, data.general]
    let offset = 0

    return (
        <div className="donut">
            <svg viewBox="0 0 36 36" className="donut__svg">
                {values.map((val, i) => {
                    const pct = (val / total) * 100
                    const dash = `${pct} ${100 - pct}`
                    const segment = (
                        <circle
                            key={i}
                            cx="18" cy="18" r="15.9"
                            fill="none"
                            stroke={colors[i]}
                            strokeWidth="3.5"
                            strokeDasharray={dash}
                            strokeDashoffset={-offset}
                            strokeLinecap="round"
                        />
                    )
                    offset += pct
                    return segment
                })}
            </svg>
            <span className="donut__center">{total}</span>
        </div>
    )
}

function LegendItem({ label, value, total, color }) {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0
    return (
        <div className="legend-item">
            <span className="legend-item__dot" style={{ backgroundColor: color }} />
            <span className="legend-item__label">{label}: {pct}%</span>
        </div>
    )
}

export default StatsBoard
