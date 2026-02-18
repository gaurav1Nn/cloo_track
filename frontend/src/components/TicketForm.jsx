import { useState, useRef } from 'react'
import { createTicket, classifyTicket } from '../api/ticketService'
import './TicketForm.css'

const CATEGORIES = ['billing', 'technical', 'account', 'general']
const PRIORITIES = ['low', 'medium', 'high', 'critical']

function TicketForm({ onTicketCreated }) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('')
    const [priority, setPriority] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isClassifying, setIsClassifying] = useState(false)
    const [error, setError] = useState(null)
    const [successMessage, setSuccessMessage] = useState('')

    // Track whether user manually overrode LLM suggestions
    const userOverrodeCategory = useRef(false)
    const userOverrodePriority = useRef(false)

    const handleDescriptionBlur = async () => {
        if (description.trim().length < 10) return

        setIsClassifying(true)
        try {
            const result = await classifyTicket(description)
            if (result) {
                // Only pre-fill if user hasn't manually overridden
                if (!userOverrodeCategory.current) {
                    setCategory(result.suggested_category)
                }
                if (!userOverrodePriority.current) {
                    setPriority(result.suggested_priority)
                }
            }
        } catch {
            // Silently skip — LLM failure doesn't block form
        }
        setIsClassifying(false)
    }

    const handleCategoryChange = (value) => {
        setCategory(value)
        userOverrodeCategory.current = true
    }

    const handlePriorityChange = (value) => {
        setPriority(value)
        userOverrodePriority.current = true
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setSuccessMessage('')

        if (!title.trim() || !description.trim() || !category || !priority) {
            setError('Please fill in all fields.')
            return
        }

        setIsSubmitting(true)
        try {
            await createTicket({ title, description, category, priority })
            // Clear form on success
            setTitle('')
            setDescription('')
            setCategory('')
            setPriority('')
            userOverrodeCategory.current = false
            userOverrodePriority.current = false
            setSuccessMessage('Ticket created successfully!')
            setTimeout(() => setSuccessMessage(''), 3000)
            onTicketCreated()
        } catch (err) {
            if (err.data) {
                // Validation error from DRF
                const messages = Object.entries(err.data)
                    .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
                    .join('; ')
                setError(messages)
            } else {
                setError('Something went wrong. Please try again.')
            }
        }
        setIsSubmitting(false)
    }

    return (
        <div className="ticket-form">
            <h2 className="ticket-form__title">📝 Submit a Ticket</h2>

            {error && <div className="ticket-form__error">{error}</div>}
            {successMessage && <div className="ticket-form__success">{successMessage}</div>}

            <form onSubmit={handleSubmit}>
                <div className="ticket-form__field">
                    <label htmlFor="ticket-title">Title *</label>
                    <input
                        id="ticket-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Brief summary of the issue"
                        maxLength={200}
                        required
                    />
                    <span className="ticket-form__char-count">{title.length}/200</span>
                </div>

                <div className="ticket-form__field">
                    <label htmlFor="ticket-description">Description *</label>
                    <textarea
                        id="ticket-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onBlur={handleDescriptionBlur}
                        placeholder="Describe your problem in detail..."
                        rows={4}
                        required
                    />
                    {isClassifying && (
                        <div className="ticket-form__classifying">
                            <span className="ticket-form__spinner"></span>
                            AI is analyzing your description...
                        </div>
                    )}
                </div>

                <div className="ticket-form__row">
                    <div className="ticket-form__field">
                        <label htmlFor="ticket-category">Category *</label>
                        <select
                            id="ticket-category"
                            value={category}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            required
                        >
                            <option value="">Select category</option>
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="ticket-form__field">
                        <label htmlFor="ticket-priority">Priority *</label>
                        <select
                            id="ticket-priority"
                            value={priority}
                            onChange={(e) => handlePriorityChange(e.target.value)}
                            required
                        >
                            <option value="">Select priority</option>
                            {PRIORITIES.map((pri) => (
                                <option key={pri} value={pri}>
                                    {pri.charAt(0).toUpperCase() + pri.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    className="ticket-form__submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
            </form>
        </div>
    )
}

export default TicketForm
