import { useState, useEffect, useCallback } from 'react'
import { fetchTickets } from '../api/ticketService'
import TicketCard from './TicketCard'
import FilterBar from './FilterBar'
import './TicketList.css'

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
            setError('Failed to load tickets. Please try again.')
        }
        setIsLoading(false)
    }, [filters])

    useEffect(() => {
        loadTickets()
    }, [loadTickets, refreshTrigger])

    const handleStatusChange = () => {
        loadTickets()
        onTicketUpdate()
    }

    const hasActiveFilters = filters.category || filters.priority || filters.status || filters.search

    return (
        <div className="ticket-list">
            <h2 className="ticket-list__title">🎫 Tickets</h2>

            <FilterBar filters={filters} onFilterChange={setFilters} />

            {error && <div className="ticket-list__error">{error}</div>}

            {isLoading ? (
                <div className="ticket-list__loading">
                    <span className="ticket-list__spinner"></span>
                    Loading tickets...
                </div>
            ) : tickets.length === 0 ? (
                <div className="ticket-list__empty">
                    {hasActiveFilters
                        ? '🔍 No tickets match your filters. Try adjusting your search criteria.'
                        : '📭 No tickets yet. Submit one above!'}
                </div>
            ) : (
                <div className="ticket-list__grid">
                    {tickets.map((ticket) => (
                        <TicketCard
                            key={ticket.id}
                            ticket={ticket}
                            onStatusChange={handleStatusChange}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default TicketList
