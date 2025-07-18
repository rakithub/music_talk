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
        x: 100 + Math.random() * 300,
        y: 100 + Math.random() * 300,
    }
    const startRotation = 0

    console.log(`Client ID joined: ${clientId}`)

    clients.set(clientId, {
        ws,
        position: startPos,
        rotation: startRotation,
        initialPlayer: clients.size % 2 == 0
    })

    ws.send(
        JSON.stringify({
            type: 'init',
            id: clientId,
            state: getWorldState()
        })
    )

    broadcast({
        type: 'join',
        id: clientId,
        position: startPos,
        rotation: startRotation
    })

    ws.on('message', (json) => {
        try {
            const transform = JSON.parse(json)
            broadcast({
                type: 'transform',
                id: clientId,
                position: transform.position,
                rotation: transform.rotation
            })
        } catch (error) {
            console.error('Invalid JSON', err)
        }
    })

    ws.on('close', () => {
        console.log(`Client ${clientId} leaves.`)
        clients.delete(clientId)
        broadcast({
            type: 'leave',
            id: clientId,
        })
    })
})

const resetRotation = async (ws, data) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    ws.send(
        JSON.stringify({
            type: 'resetRotation',
            id: data.id,
        })
    )
}

function broadcast(data) {
    const json = JSON.stringify(data)
    clients.forEach(({ ws, initialPlayer }) => {
        if (ws.readyState === 1) {
            ws.send(json)
            if (data.rotation) resetRotation(ws, data)
        }
    })
}

function getWorldState() {
    const state = {}

    clients.forEach((value, id) => {
        state[id] = {
            position: value.position,
            rotation: value.rotation,
            initialPlayer: value.initialPlayer
        }
    })

    return state
}

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})
