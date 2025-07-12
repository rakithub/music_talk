import React, { useEffect, useRef, useState } from "react"

export default function PlayerBar() {
    const boxRef = useRef(null)
    
    const [position, setPosition] = useState({ x: 100, y: 100 })
    const keysPressed = useRef({})

    const speed = 10

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
            setPosition((prev) => {
                let { x, y } = prev 
                
                if (keysPressed.current['ArrowLeft'] || keysPressed.current['a']) x -= speed
                if (keysPressed.current['ArrowRight'] || keysPressed.current['d']) x += speed
                if (keysPressed.current['ArrowUp'] || keysPressed.current['w']) y -= speed
                if (keysPressed.current['ArrowDown'] || keysPressed.current['s']) y += speed

                return { x, y }
            })
            animateFrameId = requestAnimationFrame(update)
        }
        animateFrameId = requestAnimationFrame(update)

        return () => cancelAnimationFrame(animateFrameId)
    }, [])

    return (
        <div
            ref={boxRef}
            style={{
                position: 'absolute',
                width: '20px',
                height: '120px',
                backgroundColor: 'white',
                transform: `translate(${position.x}px, ${position.y}px)`,
                transition: 'transform 0s'
            }}
        />
    )
}