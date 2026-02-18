const API_BASE = '/api';

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

export async function fetchStats() {
    const response = await fetch(`${API_BASE}/tickets/stats/`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
}

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
        return null;
    }
}
