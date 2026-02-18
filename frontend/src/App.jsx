import { useState, useCallback } from 'react'
import StatsBoard from './components/StatsBoard'
import TicketForm from './components/TicketForm'
import TicketList from './components/TicketList'
import './App.css'

function App() {
    const [refresh, setRefresh] = useState(0)
    const [modal, setModal] = useState(false)
    const [view, setView] = useState('dashboard')

    const bump = useCallback(() => setRefresh((n) => n + 1), [])

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar__logo">
                    <span className="sidebar__logo-icon">🎫</span>
                    <span className="sidebar__logo-text">TicketFlow</span>
                </div>

                <nav className="sidebar__nav">
                    <button className={`sidebar__item ${view === 'dashboard' ? 'sidebar__item--active' : ''}`} onClick={() => setView('dashboard')}>
                        <span className="sidebar__item-icon">📊</span><span>Dashboard</span>
                    </button>
                    <button className={`sidebar__item ${view === 'tickets' ? 'sidebar__item--active' : ''}`} onClick={() => setView('tickets')}>
                        <span className="sidebar__item-icon">📋</span><span>My Tickets</span>
                    </button>
                </nav>

                <div className="sidebar__divider" />

                <nav className="sidebar__nav">
                    <button className="sidebar__item" onClick={() => setModal(true)}>
                        <span className="sidebar__item-icon">➕</span><span>New Ticket</span>
                    </button>
                </nav>
            </aside>

            {/* Main */}
            <main className="main-content">
                <div className="page-toolbar">
                    <h1 className="page-title">
                        {view === 'dashboard' ? 'Developer Support Dashboard' : 'All Tickets'}
                    </h1>
                    <button className="btn-create" onClick={() => setModal(true)}>+ Create Ticket</button>
                </div>

                <div className="view-section">
                    {view === 'dashboard' && (
                        <>
                            <StatsBoard refreshTrigger={refresh} />
                            <TicketList refreshTrigger={refresh} onTicketUpdate={bump} />
                        </>
                    )}
                    {view === 'tickets' && (
                        <TicketList refreshTrigger={refresh} onTicketUpdate={bump} />
                    )}
                </div>
            </main>

            {/* Modal */}
            {modal && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setModal(false) }}>
                    <div className="modal-box">
                        <div className="modal-box__header">
                            <h2 className="modal-box__title">Create New Ticket</h2>
                            <button className="modal-box__close" onClick={() => setModal(false)}>✕</button>
                        </div>
                        <TicketForm onTicketCreated={bump} onClose={() => setModal(false)} />
                    </div>
                </div>
            )}
        </div>
    )
}

export default App
