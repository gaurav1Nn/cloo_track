import { useState } from 'react'
import { updateTicket } from '../api/ticketService'
import './TicketCard.css'

const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'closed']

const PRIORITY_COLORS = {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#f97316',
    critical: '#ef4444',
}

const CATEGORY_ICONS = {
    billing: '💳',
    technical: '🔧',
    account: '👤',
    general: '📋',
}

const STATUS_LABELS = {
    open: 'Open',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
}

function TicketCard({ ticket, onStatusChange }) {
    const [isChangingStatus, setIsChangingStatus] = useState(false)
    const [currentStatus, setCurrentStatus] = useState(ticket.status)

    const handleStatusChange = async (newStatus) => {
        setIsChangingStatus(true)
        try {
            await updateTicket(ticket.id, { status: newStatus })
            setCurrentStatus(newStatus)
            onStatusChange()
        } catch {
            // Revert on failure
            setCurrentStatus(ticket.status)
        }
        setIsChangingStatus(false)
    }

    const truncateDescription = (text, maxLength = 120) => {
        if (text.length <= maxLength) return text
        return text.slice(0, maxLength).trim() + '...'
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

    return (
        <div className="ticket-card">
            <div className="ticket-card__header">
                <h3 className="ticket-card__title">{ticket.title}</h3>
                <span
                    className="ticket-card__priority"
                    style={{ backgroundColor: PRIORITY_COLORS[ticket.priority] + '20', color: PRIORITY_COLORS[ticket.priority], borderColor: PRIORITY_COLORS[ticket.priority] }}
                >
                    {ticket.priority.toUpperCase()}
                </span>
            </div>

            <p className="ticket-card__description">
                {truncateDescription(ticket.description)}
            </p>

            <div className="ticket-card__footer">
                <div className="ticket-card__meta">
                    <span className="ticket-card__category">
                        {CATEGORY_ICONS[ticket.category]} {ticket.category}
                    </span>
                    <span className="ticket-card__timestamp">
                        {formatDate(ticket.created_at)}
                    </span>
                </div>

                <div className="ticket-card__status-wrapper">
                    <select
                        value={currentStatus}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        disabled={isChangingStatus}
                        className={`ticket-card__status ticket-card__status--${currentStatus}`}
                    >
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                                {STATUS_LABELS[s]}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    )
}

export default TicketCard
