import { useState, useRef } from 'react'
import { createTicket, classifyTicket } from '../api/ticketService'
import './TicketForm.css'

const CATEGORIES = ['billing', 'technical', 'account', 'general']
const PRIORITIES = ['low', 'medium', 'high', 'critical']

function TicketForm({ onTicketCreated, onClose }) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('')
    const [priority, setPriority] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [classifying, setClassifying] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState('')

    const overrodeCategory = useRef(false)
    const overrodePriority = useRef(false)

    const onDescBlur = async () => {
        if (description.trim().length < 10) return
        setClassifying(true)
        try {
            const r = await classifyTicket(description)
            if (r) {
                if (!overrodeCategory.current) setCategory(r.suggested_category)
                if (!overrodePriority.current) setPriority(r.suggested_priority)
            }
        } catch { }
        setClassifying(false)
    }

    const submit = async (e) => {
        e.preventDefault()
        setError(null)
        setSuccess('')
        if (!title.trim() || !description.trim() || !category || !priority) {
            setError('All fields are required.')
            return
        }
        setSubmitting(true)
        try {
            await createTicket({ title, description, category, priority })
            setTitle(''); setDescription(''); setCategory(''); setPriority('')
            overrodeCategory.current = false; overrodePriority.current = false
            setSuccess('Ticket created!')
            onTicketCreated()
            setTimeout(() => { setSuccess(''); if (onClose) onClose() }, 1200)
        } catch (err) {
            if (err.data) {
                const m = Object.entries(err.data).map(([f, e]) => `${f}: ${Array.isArray(e) ? e.join(', ') : e}`).join('; ')
                setError(m)
            } else setError('Something went wrong.')
        }
        setSubmitting(false)
    }

    return (
        <form onSubmit={submit} className="tf">
            {error && <div className="tf__msg tf__msg--err">{error}</div>}
            {success && <div className="tf__msg tf__msg--ok">✓ {success}</div>}

            <div className="tf__field">
                <label>Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief summary" maxLength={200} />
                <span className="tf__hint">{title.length}/200</span>
            </div>

            <div className="tf__field">
                <label>Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} onBlur={onDescBlur} placeholder="Describe your issue..." rows={3} />
                {classifying && <div className="tf__ai"><span className="tf__dot" />AI analyzing...</div>}
            </div>

            <div className="tf__grid">
                <div className="tf__field">
                    <label>Category</label>
                    <select value={category} onChange={(e) => { setCategory(e.target.value); overrodeCategory.current = true }}>
                        <option value="">Select</option>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                </div>
                <div className="tf__field">
                    <label>Priority</label>
                    <select value={priority} onChange={(e) => { setPriority(e.target.value); overrodePriority.current = true }}>
                        <option value="">Select</option>
                        {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                    </select>
                </div>
            </div>

            <div className="tf__actions">
                {onClose && <button type="button" onClick={onClose} className="tf__cancel">Cancel</button>}
                <button type="submit" className="tf__submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create Ticket'}</button>
            </div>
        </form>
    )
}

export default TicketForm
