import { useState, useCallback } from 'react'
import TicketForm from './components/TicketForm'
import TicketList from './components/TicketList'
import './App.css'

function App() {
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    const handleTicketCreated = useCallback(() => {
        setRefreshTrigger((prev) => prev + 1)
    }, [])

    const handleTicketUpdate = useCallback(() => {
        setRefreshTrigger((prev) => prev + 1)
    }, [])

    return (
        <div className="app">
            <header className="app-header">
                <h1>🎫 Support Ticket System</h1>
                <p>Submit, manage, and track support tickets with AI-powered classification</p>
            </header>

            <main className="app-main">
                <TicketForm onTicketCreated={handleTicketCreated} />
                <TicketList
                    refreshTrigger={refreshTrigger}
                    onTicketUpdate={handleTicketUpdate}
                />
            </main>
        </div>
    )
}

export default App
