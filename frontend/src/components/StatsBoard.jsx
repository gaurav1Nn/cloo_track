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
                // Stats failing shouldn't block the rest of the app
                setStats(null)
            }
            setIsLoading(false)
        }
        loadStats()
    }, [refreshTrigger])

    if (isLoading) {
        return (
            <div className="stats-board stats-board--loading">
                <span className="stats-board__spinner"></span>
                Loading statistics...
            </div>
        )
    }

    if (!stats) return null

    return (
        <div className="stats-board">
            <h2 className="stats-board__title">📊 Dashboard</h2>

            <div className="stats-board__overview">
                <div className="stats-card stats-card--total">
                    <span className="stats-card__value">{stats.total_tickets}</span>
                    <span className="stats-card__label">Total Tickets</span>
                </div>
                <div className="stats-card stats-card--open">
                    <span className="stats-card__value">{stats.open_tickets}</span>
                    <span className="stats-card__label">Open</span>
                </div>
                <div className="stats-card stats-card--avg">
                    <span className="stats-card__value">{stats.avg_tickets_per_day}</span>
                    <span className="stats-card__label">Avg / Day</span>
                </div>
            </div>

            <div className="stats-board__breakdowns">
                <div className="stats-breakdown">
                    <h3 className="stats-breakdown__title">Priority Breakdown</h3>
                    <div className="stats-breakdown__items">
                        <BreakdownBar label="Low" value={stats.priority_breakdown.low} total={stats.total_tickets} color="#22c55e" />
                        <BreakdownBar label="Medium" value={stats.priority_breakdown.medium} total={stats.total_tickets} color="#f59e0b" />
                        <BreakdownBar label="High" value={stats.priority_breakdown.high} total={stats.total_tickets} color="#f97316" />
                        <BreakdownBar label="Critical" value={stats.priority_breakdown.critical} total={stats.total_tickets} color="#ef4444" />
                    </div>
                </div>

                <div className="stats-breakdown">
                    <h3 className="stats-breakdown__title">Category Breakdown</h3>
                    <div className="stats-breakdown__items">
                        <BreakdownBar label="Billing" value={stats.category_breakdown.billing} total={stats.total_tickets} color="#8b5cf6" />
                        <BreakdownBar label="Technical" value={stats.category_breakdown.technical} total={stats.total_tickets} color="#3b82f6" />
                        <BreakdownBar label="Account" value={stats.category_breakdown.account} total={stats.total_tickets} color="#06b6d4" />
                        <BreakdownBar label="General" value={stats.category_breakdown.general} total={stats.total_tickets} color="#64748b" />
                    </div>
                </div>
            </div>
        </div>
    )
}

function BreakdownBar({ label, value, total, color }) {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0

    return (
        <div className="breakdown-bar">
            <div className="breakdown-bar__info">
                <span className="breakdown-bar__label">{label}</span>
                <span className="breakdown-bar__count">{value} ({percentage}%)</span>
            </div>
            <div className="breakdown-bar__track">
                <div
                    className="breakdown-bar__fill"
                    style={{
                        width: `${percentage}%`,
                        backgroundColor: color,
                    }}
                />
            </div>
        </div>
    )
}

export default StatsBoard
