import './App.css'
import axios from 'axios'
import PlayerBar from './PlayerBar'
import React, { use, useEffect, useRef, useState } from 'react'

const socket = new WebSocket('ws://localhost:8080/ws')

function App() {
    const keysPressed = useRef({})
    const barsRef = useRef({})

    const [clientId, setClientId] = useState(null)
    const [bars, setBarState] = useState({})
    const [rotation, setRotation] = useState(0)

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
                setBarState((prev) => {
                        const newBars = { ...prev, [msg.id]: msg.position }
                        barsRef.current = newBars
                        return newBars
                    }
                )
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

    const rotateBar = async (degree) => {
        setRotation(degree)
        await new Promise(resolve => setTimeout(resolve, 200))
        setRotation(0)
    }

    useEffect(() => {
        let animateFrameId
        const update = () => {
            if (!clientId) return

            let newX = barsRef.current[clientId].x
            let newY = barsRef.current[clientId].y

            // Move
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

            // Rotate
            if (keysPressed.current['j'] && rotation === 0) {
                rotateBar(20)
            }
            if (keysPressed.current['k'] && rotation === 0) {
                rotateBar(-20)
            }

            const newPos = { x: newX, y: newY }

            // Update new position to websocket
            if ((newX !== barsRef.current[clientId].x || newY !== barsRef.current[clientId].y) && socket.readyState === WebSocket.OPEN) {
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
                    <PlayerBar key={id} isMe={id === clientId} pos={pos} rotation={rotation} />
                ))}
            </header>
        </div>
    )
}

export default App
