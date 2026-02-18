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
    const [aiSuggested, setAiSuggested] = useState(false)

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
                setAiSuggested(true)
            }
        } catch { }
        setClassifying(false)
    }

    const submit = async (e) => {
        e.preventDefault()
        setError(null)
        setSuccess('')
        if (!title.trim() || !description.trim()) {
            setError('Title and description are required.')
            return
        }
        setSubmitting(true)
        try {
            const payload = { title, description }
            if (category) payload.category = category
            if (priority) payload.priority = priority
            await createTicket(payload)
            setTitle(''); setDescription(''); setCategory(''); setPriority('')
            setAiSuggested(false)
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
                <label>Title <span className="tf__req">*</span></label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief summary of the issue" maxLength={200} />
                <span className="tf__hint">{title.length}/200</span>
            </div>

            <div className="tf__field">
                <label>Description <span className="tf__req">*</span></label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} onBlur={onDescBlur} placeholder="Describe your issue in detail — AI will auto-suggest category & priority..." rows={3} />
                {classifying && <div className="tf__ai"><span className="tf__dot" />AI analyzing your description...</div>}
            </div>

            {aiSuggested && (category || priority) && (
                <div className="tf__ai-banner">
                    🤖 AI suggested: <strong>{category}</strong> / <strong>{priority}</strong> priority — you can override below
                </div>
            )}

            <div className="tf__grid">
                <div className="tf__field">
                    <label>Category <span className="tf__opt">(optional — AI auto-fills)</span></label>
                    <select value={category} onChange={(e) => { setCategory(e.target.value); overrodeCategory.current = true }}>
                        <option value="">Auto (AI decides)</option>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                </div>
                <div className="tf__field">
                    <label>Priority <span className="tf__opt">(optional — AI auto-fills)</span></label>
                    <select value={priority} onChange={(e) => { setPriority(e.target.value); overrodePriority.current = true }}>
                        <option value="">Auto (AI decides)</option>
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
