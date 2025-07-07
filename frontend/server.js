const express = require('express')
const server = express()
server.use(express.static('./public'))
server.listen(5500 , ()=>{
    console.log('frontend listening to 5500 port ')
})