import { useState } from 'react'
import './FilterBar.css'

const CATEGORIES = ['billing', 'technical', 'account', 'general']
const PRIORITIES = ['low', 'medium', 'high', 'critical']
const STATUSES = ['open', 'in_progress', 'resolved', 'closed']
const STATUS_LABELS = { open: 'Open', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed' }

function FilterBar({ filters, onFilterChange }) {
    const [search, setSearch] = useState(filters.search || '')
    const [timer, setTimer] = useState(null)

    const pick = (k, v) => onFilterChange({ ...filters, [k]: v })

    const type = (e) => {
        const v = e.target.value
        setSearch(v)
        if (timer) clearTimeout(timer)
        setTimer(setTimeout(() => onFilterChange({ ...filters, search: v }), 300))
    }

    const clear = () => { setSearch(''); onFilterChange({ category: '', priority: '', status: '', search: '' }) }
    const active = filters.category || filters.priority || filters.status || filters.search

    return (
        <div className="fb">
            <div className="fb__row">
                <input
                    type="text"
                    placeholder="Search tickets..."
                    value={search}
                    onChange={type}
                    className="fb__search"
                />
                <select value={filters.category} onChange={(e) => pick('category', e.target.value)} className="fb__sel">
                    <option value="">All Categories</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
                <select value={filters.priority} onChange={(e) => pick('priority', e.target.value)} className="fb__sel">
                    <option value="">All Priorities</option>
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
                <select value={filters.status} onChange={(e) => pick('status', e.target.value)} className="fb__sel">
                    <option value="">All Statuses</option>
                    {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
                {active && <button onClick={clear} className="fb__clear">✕</button>}
            </div>
        </div>
    )
}

export default FilterBar
