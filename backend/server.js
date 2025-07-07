require('dotenv').config()
const express = require('express')
const server = express()
const multer = require('multer')
const cors = require('cors')
const path = require('path')
const cloudinary = require('cloudinary').v2;
const {Readable} = require('stream')
cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
})
const storage = multer.memoryStorage()
const uploads = multer({storage
    ,
    limits: {
        fileSize : 10*1024*1024
    },
    fileFilter : (req, file ,cb)=>{
        const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'video/mp4',
      'video/quicktime',
      'video/webm'
        ]
    
    if(allowedMimes.includes(file.mimetype)){
        cb(null, true)
    }
    else{
        cb(new Error('Invalid file type.'))
    }
    }
})
const uploadToCloudinary = (buffer, options = {})=> // options has defualt value of {}
{
    return new Promise((resolve, reject)=>{
        const stream = Readable.from(buffer)
        const uploadStream = cloudinary.uploader.upload_stream({
            folder : 'uploads',
            resource_type:'auto',
            ...options
        },
        (error , result)=>{
            if(error) reject(error)
            else resolve(result)
        }
    )
    stream.pipe(uploadStream)
    })

}
server.use(cors())
server.use('/upload' , uploads.single('avatar'))
server.post('/upload/profile' , async (req, res) =>{
    try{
        if(!req?.file){
            return res.status(400).json({
                error:'No file uploaded'
            })
        }
        const publicId = `${Date.now()}-${req.file.originalname.replace(/\.[^/.]+$/, "")}`
        const result = await uploadToCloudinary(req.file.buffer ,{
            public_id : publicId,
            folder : 'uploads',
            resource_type : 'auto'
        } 
        
        )
         res.json({
      message: 'File uploaded successfully',
      file: {
        public_id: result.public_id,
        url: result.secure_url,
        original_filename: req.file.originalname,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        created_at: result.created_at,
        type: result.resource_type
      }
    })
    }
    catch(err){
    console.error('Upload error: ' , err)     
    res.status(500).json({error : err.message});
    }
})
server.use((err , req , res, next)=>{
    if(err){
        res.status(500).json({"error":err.message})
    }
})

server.listen(5000 , ()=>{
    console.log('listening to server 5000')
}
)