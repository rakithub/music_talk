import React, { useEffect, useRef, useState } from 'react'

export default function PlayerBar({ isMe, pos, rotation }) {
    const boxRef = useRef(null)

    return (
        <div
            ref={boxRef}
            style={{
                position: 'absolute',
                width: '20px',
                height: '120px',
                backgroundColor: 'white',
                transformOrigin: 'center',
                transform: `translate(${pos.x}px, ${pos.y}px) rotate(${rotation}deg)`,
                transition: 'transform 0s',
            }}
        />
    )
}
