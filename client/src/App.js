import './App.css'
import axios from 'axios'
import PlayerBar from './PlayerBar'
import React, { use, useEffect, useRef, useState } from 'react'
import useWindowDimension from './WindowSize'

const socket = new WebSocket('ws://localhost:8080/ws')

function App() {
    const keysPressed = useRef({})
    const barsRef = useRef({})

    const [clientId, setClientId] = useState(null)
    const [bars, setBarState] = useState({})
    const [rotation, setRotation] = useState(0)
    const { width: windowWidth, height: windowHeight } = useWindowDimension()

    const speed = 10

    function coercePosition(position) {
        let x = position.x
        let y = position.y

        const maxX = windowWidth - 20
        const maxY = windowHeight - 120

        if (x < 0) x = 0
        if (x > maxX) x = maxX

        if (y < 0) y = 0
        if (y > maxY) y = maxY

        return {
            x: x,
            y: y,
        }
    }

    useEffect(() => {
        console.log(
            `Window Size\nwidth: ${windowWidth}, height: ${windowHeight}`
        )
        socket.onopen = (event) => {
            console.log('WebSocket opened.')
        }
        socket.onmessage = (event) => {
            console.log()
            const msg = JSON.parse(event.data)

            if (msg.type === 'init') {
                setClientId(msg.id)
                setBarState(() => {
                    barsRef.current = msg.state
                    return msg.state
                })
            } else if (msg.type === 'join' || msg.type === 'transform') {
                setBarState((prev) => {
                    const newBars = {
                        ...prev,
                        [msg.id]: {
                            ...prev[msg.id],
                            position: coercePosition(msg.position),
                            rotation: msg.rotation,
                        },
                    }
                    barsRef.current = newBars
                    return newBars
                })
            } else if (msg.type === 'resetRotation') {
                setBarState((prev) => {
                    const newBars = {
                        ...prev,
                        [msg.id]: {
                            ...prev[msg.id],
                            rotation: 0,
                        },
                    }
                    barsRef.current = newBars
                    return newBars
                })
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

            let newX = barsRef.current[clientId].position.x
            let newY = barsRef.current[clientId].position.y
            let newRotation = barsRef.current[clientId].rotation

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
            if (
                keysPressed.current['j'] &&
                barsRef.current[clientId].rotation === 0
            ) {
                newRotation = barsRef.current[clientId].initialPlayer ? 20 : -20
            }
            if (
                keysPressed.current['k'] &&
                barsRef.current[clientId].rotation === 0
            ) {
                newRotation = barsRef.current[clientId].initialPlayer ? -20 : 20
            }

            const newPos = { x: newX, y: newY }

            // Update new position to websocket
            if (
                (newX !== barsRef.current[clientId].position.x ||
                    newY !== barsRef.current[clientId].position.y ||
                    newRotation !== 0) &&
                socket.readyState === WebSocket.OPEN
            ) {
                socket.send(
                    JSON.stringify({
                        position: newPos,
                        rotation: newRotation,
                    })
                )
            }

            animateFrameId = requestAnimationFrame(update)
        }
        animateFrameId = requestAnimationFrame(update)

        return () => cancelAnimationFrame(animateFrameId)
    }, [clientId])

    return (
        <div className="App">
            {/* <div style={{
                width: `${windowWidth / 2}px`,
                height: `${windowHeight / 2}px`,
                background: 'red'
            }}/> */}
            <header className="App-header">
                {Object.entries(bars).map(([id, transform]) => (
                    <PlayerBar
                        key={id}
                        isMe={id === clientId}
                        transform={transform}
                        size={{ width: windowWidth, height: windowHeight }}
                    />
                ))}
            </header>
        </div>
    )
}

export default App
