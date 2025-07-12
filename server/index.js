const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())

app.get('/', (req, res) => {
    res.json({
        message: 'love you so much'
    })
})

app.listen(8080, () => {
    console.log("Server is listening on port 8080")
})
