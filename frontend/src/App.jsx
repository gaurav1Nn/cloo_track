import { useState, useCallback } from 'react'
import StatsBoard from './components/StatsBoard'
import TicketForm from './components/TicketForm'
import TicketList from './components/TicketList'
import './App.css'

function App() {
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    const handleDataChange = useCallback(() => {
        setRefreshTrigger((prev) => prev + 1)
    }, [])

    return (
        <div className="app">
            <header className="app-header">
                <h1>🎫 Support Ticket System</h1>
                <p>Submit, manage, and track support tickets with AI-powered classification</p>
            </header>

            <main className="app-main">
                <StatsBoard refreshTrigger={refreshTrigger} />
                <TicketForm onTicketCreated={handleDataChange} />
                <TicketList
                    refreshTrigger={refreshTrigger}
                    onTicketUpdate={handleDataChange}
                />
            </main>
        </div>
    )
}

export default App
