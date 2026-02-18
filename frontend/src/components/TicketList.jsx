import { useState, useEffect, useCallback } from 'react'
import { fetchTickets, updateTicket } from '../api/ticketService'
import FilterBar from './FilterBar'
import './TicketList.css'

const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'closed']
const STATUS_LABELS = {
    open: 'Open',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
}

function TicketList({ refreshTrigger, onTicketUpdate }) {
    const [tickets, setTickets] = useState([])
    const [filters, setFilters] = useState({ category: '', priority: '', status: '', search: '' })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const load = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await fetchTickets(filters)
            setTickets(data)
        } catch { setError('Failed to load tickets.') }
        setLoading(false)
    }, [filters])

    useEffect(() => { load() }, [load, refreshTrigger])

    const changeStatus = async (id, s) => {
        try {
            await updateTicket(id, { status: s })
            load()
            onTicketUpdate()
        } catch { /* skip */ }
    }

    const fmt = (d) => {
        const dt = new Date(d)
        return dt.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
        })
    }

    const active = filters.category || filters.priority || filters.status || filters.search

    return (
        <div className="tl-panel">
            <h3 className="tl-panel__title">Recent Tickets</h3>
            <FilterBar filters={filters} onFilterChange={setFilters} />

            {error && <div className="tl-error">{error}</div>}

            {loading ? (
                <div className="tl-empty">Loading...</div>
            ) : tickets.length === 0 ? (
                <div className="tl-empty">{active ? 'No tickets match your filters.' : 'No tickets yet. Create one above!'}</div>
            ) : (
                <table className="tl-table">
                    <thead>
                        <tr>
                            <th>Ticket ID</th>
                            <th>Subject</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Priority</th>
                            <th>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map((t) => (
                            <tr key={t.id}>
                                <td className="tl-id">#T-{String(t.id).padStart(4, '0')}</td>
                                <td className="tl-subj">{t.title}</td>
                                <td className="tl-cat">{t.category}</td>
                                <td>
                                    <select
                                        className={`tl-badge tl-badge--${t.status}`}
                                        value={t.status}
                                        onChange={(e) => changeStatus(t.id, e.target.value)}
                                    >
                                        {STATUS_OPTIONS.map((s) => (
                                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <span className={`tl-badge tl-badge--pri-${t.priority}`}>
                                        {t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
                                    </span>
                                </td>
                                <td className="tl-date">{fmt(t.created_at)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}

export default TicketList
