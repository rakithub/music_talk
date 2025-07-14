import './App.css'
import axios from 'axios'
import PlayerBar from './PlayerBar'
import React, { useEffect, useRef, useState } from 'react'

// const apiCall = () => {
//   axios.get('http://localhost:8080').then(response => {
//     alert(response.data.message)
//   })
// }

const socket = new WebSocket('ws://localhost:8080/ws')

function App() {
    const keysPressed = useRef({})

    const [clientId, setClientId] = useState(null)
    const [bars, setBarState] = useState({})

    const speed = 10

    useEffect(() => {
        socket.onopen = (event) => {
            console.log('WebSocket opened.')
        }
        socket.onmessage = (event) => {
            console.log()
            const msg = JSON.parse(event.data)

            if (msg.type === 'init') {
                setClientId(msg.id)
                setBarState(msg.state)
            } else if (msg.type === 'join' || msg.type === 'move') {
                setBarState((prev) => ({ ...prev, [msg.id]: msg.position }))
            } else if (msg.type === 'leave') {
                setBarState((prev) => {
                    var newState = { ...prev }
                    delete newState[msg.id]
                    return newState
                })
            }
        }
    }, [])

    useEffect(() => {
        const handleKeyDown = (e) => {
            keysPressed.current[e.key] = true
        }

        const handleKeyUp = (e) => {
            keysPressed.current[e.key] = false
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [])

    useEffect(() => {
        let animateFrameId

        const update = () => {
            if (!clientId) return

            const currentPos = bars[clientId]

            let newX = currentPos.x
            let newY = currentPos.y

            if (keysPressed.current['ArrowLeft'] || keysPressed.current['a']) {
                newX -= speed
            }
            if (keysPressed.current['ArrowRight'] || keysPressed.current['d']) {
                newX += speed
            }
            if (keysPressed.current['ArrowUp'] || keysPressed.current['w']) {
                newY -= speed
            }
            if (keysPressed.current['ArrowDown'] || keysPressed.current['s']) {
                newY += speed
            }

            const newPos = { x: newX, y: newY }

            // Update new position to websocket
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify(newPos))
            }

            animateFrameId = requestAnimationFrame(update)
        }
        animateFrameId = requestAnimationFrame(update)

        return () => cancelAnimationFrame(animateFrameId)
    }, [clientId])

    return (
        <div className="App">
            <header className="App-header">
                {Object.entries(bars).map(([id, pos]) => (
                    <PlayerBar key={id} isMe={id === clientId} pos={pos} />
                ))}
            </header>
        </div>
    )
}

export default App
