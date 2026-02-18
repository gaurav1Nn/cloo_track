import { useState, useCallback } from 'react'
import StatsBoard from './components/StatsBoard'
import TicketForm from './components/TicketForm'
import TicketList from './components/TicketList'
import './App.css'

function App() {
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const [showModal, setShowModal] = useState(false)
    const [activeView, setActiveView] = useState('dashboard')

    const handleDataChange = useCallback(() => {
        setRefreshTrigger((prev) => prev + 1)
    }, [])

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar__logo">
                    <div className="sidebar__logo-icon">🎫</div>
                    <span className="sidebar__logo-text">TicketFlow</span>
                </div>

                <nav className="sidebar__nav">
                    <button
                        className={`sidebar__item ${activeView === 'dashboard' ? 'sidebar__item--active' : ''}`}
                        onClick={() => setActiveView('dashboard')}
                    >
                        <span className="sidebar__item-icon">📊</span>
                        <span>Dashboard</span>
                    </button>
                    <button
                        className={`sidebar__item ${activeView === 'tickets' ? 'sidebar__item--active' : ''}`}
                        onClick={() => setActiveView('tickets')}
                    >
                        <span className="sidebar__item-icon">📋</span>
                        <span>My Tickets</span>
                    </button>
                </nav>

                <div className="sidebar__divider" />

                <nav className="sidebar__nav">
                    <button className="sidebar__item" onClick={() => setShowModal(true)}>
                        <span className="sidebar__item-icon">➕</span>
                        <span>New Ticket</span>
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <div className="main-content__header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 className="main-content__title">
                                {activeView === 'dashboard' ? 'Dashboard' : 'All Tickets'}
                            </h1>
                            <p className="main-content__subtitle">
                                {activeView === 'dashboard'
                                    ? 'Overview of support ticket metrics and activity'
                                    : 'Browse, filter, and manage all support tickets'}
                            </p>
                        </div>
                        <button
                            className="ticket-form__submit"
                            style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
                            onClick={() => setShowModal(true)}
                        >
                            + Create Ticket
                        </button>
                    </div>
                </div>

                <div className="view-section">
                    {activeView === 'dashboard' && (
                        <>
                            <StatsBoard refreshTrigger={refreshTrigger} />
                            <TicketList refreshTrigger={refreshTrigger} onTicketUpdate={handleDataChange} />
                        </>
                    )}

                    {activeView === 'tickets' && (
                        <TicketList refreshTrigger={refreshTrigger} onTicketUpdate={handleDataChange} />
                    )}
                </div>
            </main>

            {/* Create Ticket Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}>
                    <div className="modal-content">
                        <div className="modal-content__header">
                            <h2 className="modal-content__title">Create New Ticket</h2>
                            <button className="modal-content__close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <TicketForm
                            onTicketCreated={handleDataChange}
                            onClose={() => setShowModal(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default App
