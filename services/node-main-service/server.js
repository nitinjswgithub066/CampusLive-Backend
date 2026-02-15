const express = require ('express')

const app = express()

const HOST = "localhost"
const PORT = 3000
app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`)
})