const express = require('express')
const expressWs = require('express-ws')
const { v4: uuidv4 } = require('uuid')

const app = express()
const wsInstance = expressWs(app)
const PORT = 8080

const clients = new Map()

app.ws('/ws', (ws, req) => {
    const clientId = uuidv4()
    const startPos = { 
        x: 100 + Math.random() * 300, y: 100 + Math.random() * 300
    }

    console.log(`Client ID joined: ${clientId}`)

    clients.set(
        clientId, 
        {
            ws,
            position: startPos
        }
    )

    ws.send(JSON.stringify(
        {
            type: 'init',
            id: clientId,
            state: getWorldState()
        }
    ))

    broadcast(
        {
            type: 'join',
            id: clientId,
            position: startPos
        }
    )

    // ws.on('message', () => {
    //     broadcast(
    //         {
    //             type: 'move',
                
    //         }
    //     )
    // })

    ws.on('close', () => {
        clients.delete(clientId)
        broadcast(
            {
                type: 'leave',
                id: clientId,
            }
        )
    })

})

function broadcast(data) {
    const json = JSON.stringify(data)
    clients.forEach(({ ws }) => {
        if (ws.readyState === 1) ws.send(json)
    })
}

function getWorldState() {
    const state = {}

    clients.forEach((value, id) => {
        state[id] = value.position 
    })

    return state
}

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})