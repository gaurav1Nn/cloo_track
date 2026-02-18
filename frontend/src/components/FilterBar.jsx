import { useState } from 'react'
import './FilterBar.css'

const CATEGORIES = ['billing', 'technical', 'account', 'general']
const PRIORITIES = ['low', 'medium', 'high', 'critical']
const STATUSES = ['open', 'in_progress', 'resolved', 'closed']

function FilterBar({ filters, onFilterChange }) {
    const [searchInput, setSearchInput] = useState(filters.search || '')
    const [searchTimeout, setSearchTimeout] = useState(null)

    const handleFilterSelect = (field, value) => {
        onFilterChange({ ...filters, [field]: value })
    }

    const handleSearchChange = (e) => {
        const value = e.target.value
        setSearchInput(value)

        // Debounce search — 300ms
        if (searchTimeout) clearTimeout(searchTimeout)
        const timeout = setTimeout(() => {
            onFilterChange({ ...filters, search: value })
        }, 300)
        setSearchTimeout(timeout)
    }

    const clearFilters = () => {
        setSearchInput('')
        onFilterChange({ category: '', priority: '', status: '', search: '' })
    }

    const hasActiveFilters = filters.category || filters.priority || filters.status || filters.search

    return (
        <div className="filter-bar">
            <div className="filter-bar__search">
                <span className="filter-bar__search-icon">🔍</span>
                <input
                    type="text"
                    placeholder="Search tickets by title or description..."
                    value={searchInput}
                    onChange={handleSearchChange}
                    className="filter-bar__search-input"
                />
            </div>

            <div className="filter-bar__filters">
                <select
                    value={filters.category}
                    onChange={(e) => handleFilterSelect('category', e.target.value)}
                    className="filter-bar__select"
                >
                    <option value="">All Categories</option>
                    {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                    ))}
                </select>

                <select
                    value={filters.priority}
                    onChange={(e) => handleFilterSelect('priority', e.target.value)}
                    className="filter-bar__select"
                >
                    <option value="">All Priorities</option>
                    {PRIORITIES.map((pri) => (
                        <option key={pri} value={pri}>
                            {pri.charAt(0).toUpperCase() + pri.slice(1)}
                        </option>
                    ))}
                </select>

                <select
                    value={filters.status}
                    onChange={(e) => handleFilterSelect('status', e.target.value)}
                    className="filter-bar__select"
                >
                    <option value="">All Statuses</option>
                    {STATUSES.map((s) => (
                        <option key={s} value={s}>
                            {s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                    ))}
                </select>

                {hasActiveFilters && (
                    <button onClick={clearFilters} className="filter-bar__clear" title="Clear all filters">
                        ✕ Clear
                    </button>
                )}
            </div>
        </div>
    )
}

export default FilterBar
