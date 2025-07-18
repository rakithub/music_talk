import React, { useEffect, useRef, useState } from 'react'

export default function PlayerBar({ isMe, transform, size }) {
    const boxRef = useRef(null)
    const xPos = size.width - 20
    const yPos = size.height - 120

    return (
        <div
            ref={boxRef}
            style={{
                position: 'absolute',
                width: '20px',
                height: '120px',
                backgroundColor: 'white',
                transformOrigin: 'center',
                transform: `translate(${transform.position.x}px, ${transform.position.y}px) rotate(${transform.rotation}deg)`,
                // transform: `translate(${xPos}px, ${yPos}px) rotate(${transform.rotation}deg)`,
                transition: 'transform 0s',
            }}
        />
    )
}
