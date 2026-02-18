const API_BASE = '/api';

/**
 * Fetch all tickets with optional filters.
 * Supports: category, priority, status, search — all combinable.
 */
export async function fetchTickets(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);

    const query = params.toString();
    const url = `${API_BASE}/tickets/${query ? `?${query}` : ''}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch tickets');
    return response.json();
}

/**
 * Create a new ticket. Returns the created ticket on success.
 */
export async function createTicket(ticketData) {
    const response = await fetch(`${API_BASE}/tickets/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw { status: response.status, data: error };
    }
    return response.json();
}

/**
 * Update a ticket (e.g., change status, override category/priority).
 */
export async function updateTicket(id, updateData) {
    const response = await fetch(`${API_BASE}/tickets/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw { status: response.status, data: error };
    }
    return response.json();
}

/**
 * Fetch aggregated ticket statistics.
 */
export async function fetchStats() {
    const response = await fetch(`${API_BASE}/tickets/stats/`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
}

/**
 * Classify a ticket description using the LLM.
 * Returns { suggested_category, suggested_priority } or null on failure.
 */
export async function classifyTicket(description) {
    try {
        const response = await fetch(`${API_BASE}/tickets/classify/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description }),
        });

        if (!response.ok) return null;
        return response.json();
    } catch {
        // Network error — return null, let the user pick manually
        return null;
    }
}
