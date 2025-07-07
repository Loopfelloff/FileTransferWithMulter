const express = require('express')
const server = express()
const multer = require('multer')
const cors = require('cors')
const path = require('path')
const { callbackify } = require('util')
const { waitForDebugger } = require('inspector')
let newFileName = ''
const storage = multer.diskStorage({
    destination : (req , file , callback)=>
    {
        callback(null , 'uploads/')
    }
    ,
    filename : (req , file , callback)=>{
         newFileName = file.originalname + '-' + Date.now()
        callback(null , newFileName)
    }

})
const uploads = multer({storage})
server.use(cors())
server.use('/upload' , uploads.single('avatar'))
server.post('/upload/profile' , (req, res) =>{
    console.log(req.file)
    res.status(200).json({
        "message" : "profile successfully uploaded",
        "fileName" : `http://localhost:5000/uploads/${newFileName}`
    }   
    )
})
server.get('/uploads/:id' , (req, res)=>{
  const name = req.params.id;
  console.log('uplaods for ' + name)
  res.sendFile(path.join(__dirname , 'uploads' , name))
})
server.listen(5000 , ()=>{
    console.log('listening to server 5000')
}
)