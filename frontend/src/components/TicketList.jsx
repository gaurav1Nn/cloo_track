import { useState, useEffect, useCallback } from 'react'
import { fetchTickets, updateTicket } from '../api/ticketService'
import FilterBar from './FilterBar'
import './TicketList.css'

const PRIORITY_COLORS = {
    low: { bg: 'var(--priority-low-bg)', text: 'var(--priority-low)' },
    medium: { bg: 'var(--priority-medium-bg)', text: 'var(--priority-medium)' },
    high: { bg: 'var(--priority-high-bg)', text: 'var(--priority-high)' },
    critical: { bg: 'var(--priority-critical-bg)', text: 'var(--priority-critical)' },
}

const STATUS_COLORS = {
    open: { bg: 'var(--status-open-bg)', text: 'var(--status-open)' },
    in_progress: { bg: 'var(--status-progress-bg)', text: 'var(--status-progress)' },
    resolved: { bg: 'var(--status-resolved-bg)', text: 'var(--status-resolved)' },
    closed: { bg: 'var(--status-closed-bg)', text: 'var(--status-closed)' },
}

const STATUS_LABELS = {
    open: 'Open',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
}

const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'closed']

function TicketList({ refreshTrigger, onTicketUpdate }) {
    const [tickets, setTickets] = useState([])
    const [filters, setFilters] = useState({
        category: '',
        priority: '',
        status: '',
        search: '',
    })
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    const loadTickets = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await fetchTickets(filters)
            setTickets(data)
        } catch {
            setError('Failed to load tickets.')
        }
        setIsLoading(false)
    }, [filters])

    useEffect(() => {
        loadTickets()
    }, [loadTickets, refreshTrigger])

    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateTicket(id, { status: newStatus })
            loadTickets()
            onTicketUpdate()
        } catch {
            // silently fail
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const truncate = (text, max = 60) =>
        text.length > max ? text.slice(0, max).trim() + '…' : text

    const hasActiveFilters = filters.category || filters.priority || filters.status || filters.search

    return (
        <div className="ticket-section">
            <div className="ticket-section__header">
                <h3 className="ticket-section__title">Recent Tickets</h3>
            </div>

            <FilterBar filters={filters} onFilterChange={setFilters} />

            {error && <div className="ticket-section__error">{error}</div>}

            {isLoading ? (
                <div className="ticket-section__loading">
                    <div className="ticket-section__spinner" />
                    Loading tickets...
                </div>
            ) : tickets.length === 0 ? (
                <div className="ticket-section__empty">
                    {hasActiveFilters
                        ? 'No tickets match your filters. Try adjusting your search.'
                        : 'No tickets yet. Create one to get started!'}
                </div>
            ) : (
                <div className="ticket-table-wrapper">
                    <table className="ticket-table">
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
                            {tickets.map((ticket) => (
                                <tr key={ticket.id} className="ticket-table__row">
                                    <td className="ticket-table__id">#T-{String(ticket.id).padStart(4, '0')}</td>
                                    <td className="ticket-table__subject">
                                        <span className="ticket-table__subject-title">{ticket.title}</span>
                                        <span className="ticket-table__subject-desc">{truncate(ticket.description)}</span>
                                    </td>
                                    <td>
                                        <span className="ticket-table__category">{ticket.category}</span>
                                    </td>
                                    <td>
                                        <select
                                            className="ticket-badge"
                                            style={{
                                                backgroundColor: STATUS_COLORS[ticket.status]?.bg,
                                                color: STATUS_COLORS[ticket.status]?.text,
                                                borderColor: STATUS_COLORS[ticket.status]?.text,
                                            }}
                                            value={ticket.status}
                                            onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                                        >
                                            {STATUS_OPTIONS.map((s) => (
                                                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <span
                                            className="ticket-badge ticket-badge--static"
                                            style={{
                                                backgroundColor: PRIORITY_COLORS[ticket.priority]?.bg,
                                                color: PRIORITY_COLORS[ticket.priority]?.text,
                                            }}
                                        >
                                            {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                                        </span>
                                    </td>
                                    <td className="ticket-table__date">{formatDate(ticket.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default TicketList
