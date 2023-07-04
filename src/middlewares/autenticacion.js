import jwt from 'jsonwebtoken'
//importacion desde JWT
import Veterinario from '../models/Veterinario.js'

//definir la funcion para validar el JWT
const verificarAutenticacion = async (req,res,next)=>{
//validacion del JW
if(!req.headers.authorization) return res.status(404).json({msg:"Lo sentimos, debes proprocionar un token"})
    //obtener el jwt 
    const {authorization} = req.headers
    try {
        //Obtener solo el token y verificarlo
        const {id} = jwt.verify(authorization.split(' ')[1],process.env.JWT_SECRET)
        //obtener el usaurio en base el ID
        req.veterinarioBDD = await Veterinario.findById(id).lean().select("-password")
        next()
    } catch (error) {
        //enviar el mensaje de error
        const e = new Error("Formato del token no válido")
        return res.status(404).json({msg:e.message})
    }
}

export default verificarAutenticacion