import React, { useEffect, useRef, useState } from 'react'

export default function PlayerBar({ isMe, pos }) {
    const boxRef = useRef(null)

    const [position, setPosition] = useState({ x: 100, y: 100 })

    return (
        <div
            ref={boxRef}
            style={{
                position: 'absolute',
                width: '20px',
                height: '120px',
                backgroundColor: 'white',
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                transition: 'transform 0s',
            }}
        />
    )
}
