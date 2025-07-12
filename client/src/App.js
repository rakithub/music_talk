import './App.css';
import axios from 'axios';
import PlayerBar from './PlayerBar';
import React, { useEffect, useRef, useState } from 'react';

// const apiCall = () => {
//   axios.get('http://localhost:8080').then(response => {
//     alert(response.data.message)
//   })
// }

const socket = new WebSocket('ws://localhost:8080/ws')

function App() {
  const canvasRef = useRef()
  const [clientId, setClientId] = useState(null)
  const [bars, setBarState] = useState({})

  useEffect(() => {
    socket.onopen = (event) => {
      console.log("WebSocket opened.")
    }
    socket.onmessage = (event) => {
      console.log()
      const msg = JSON.parse(event.data)

      if (msg.type === 'init') {
        setClientId(msg.id)
        setBarState(msg.state)
      } else if (msg.type == 'join') {
        setBarState((prev) => ({ ...prev, [msg.id]: msg.position}))
      } else if (msg.type === 'leave') {
        setBarState((prev) => {
          var newState = { ...prev }
          delete newState[msg.id]
          return newState
        })
      }

      // setMessages((prev) => [...prev, event.data])
    }
  }, [])



  // const sendMessage = () => {
  //   const message = inputRef.current.value

  //   if (message && socketRef.current.readyState === WebSocket.OPEN) {
  //     socketRef.current.send(message)
  //     inputRef.current.value = ''
  //   }
  // }

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d')
    ctx.clearRect(0, 0, 800, 600)

    console.log(clientId)

    Object.entries(bars).forEach(([id, pos]) => {
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 20, 0, 2 * Math.PI)
      ctx.fillStyle = id === clientId ? 'blue' : 'gray'
      ctx.fill()
    })
  }, [bars, clientId])
  
  return (
    <div className="App">
      <header className="App-header">
        <canvas ref={canvasRef} width={800} height={600} style={{ border: '1px solid black' }} />
        {/* <PlayerBar /> */}
        {/* <button onClick={apiCall}>Make API Call</button> */}
      </header>
    </div>
  );
}

export default App;
