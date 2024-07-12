import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"
import dotenv from "dotenv"

dotenv.config({
    path: "./.env"
})
          
// cloudinary.config({ 
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
//   api_key: process.env.CLOUDINARY_API_KEY, 
//   api_secret: process.env.CLOUDINARY_API_SECRET 
// });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadToCloudinary = async (localpath:string) => {
    if(!localpath) return null
    try {
        const response = await cloudinary.uploader.upload(localpath,
            {resource_type:'auto',
            media_metadata: true
            },
             function(error, result) {});
        await fs.unlinkSync(localpath)
        return response
    } catch (error) {
        await fs.unlinkSync(localpath)
        console.log(error)
        return null
    }
}


export default uploadToCloudinary