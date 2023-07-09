import Veterinario from "../models/Veterinario.js"
import { sendMailToUser, sendMailToRecoveryPassword } from "../config/nodemailer.js"
import generarJWT from "../helpers/crearJWT.js"
import mongoose from "mongoose";



const login = async(req,res)=>{
    //captura los datos del request
    const {email,password} = req.body
    //validacion de los datos vacios
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    //obtengo el usuario en base al email
    const veterinarioBDD = await Veterinario.findOne({email}).select("-status -__v -token -updatedAt -createdAt")
    //validacion de la cuenta del email
    if(veterinarioBDD?.confirmEmail===false) return res.status(403).json({msg:"Lo sentimos, debe verificar su cuenta"})
    //validar el password
    if(!veterinarioBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})
    //si el password del reques es el mismo de la bd
    const verificarPassword = await veterinarioBDD.matchPassword(password)
    if(!verificarPassword) return res.status(404).json({msg:"Lo sentimos, el password no es el correcto"})

    const token = generarJWT(veterinarioBDD._id)
    //desestructurar para enviar solo estos campos
    const {nombre,apellido,direccion,telefono,_id} = veterinarioBDD
    res.status(200).json({
        token,
        nombre,
        apellido,
        direccion,
        telefono,
        _id,
        email:veterinarioBDD.email
    })
}
const perfil=(req,res)=>{
    //delete es de los objetos -- elimina propiedades
    //
    delete req.veterinarioBDD.token
    //
    delete req.veterinarioBDD.confirmEmail
    delete req.veterinarioBDD.createdAt
    delete req.veterinarioBDD.updatedAt
    delete req.veterinarioBDD.__v
    res.status(200).json(req.veterinarioBDD)
}
const registro =async (req,res)=>{
    //captura los datos del body de la peticion
    const {email,password} = req.body
    //validacion de los campos vacios
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Debes llenar todos los campos"})
    const verificarEmailBDD = await Veterinario.findOne({email})
    //valirdar la existencia del mail
    if(verificarEmailBDD) return res.status(400).json({msg:"El email ya se encuentra registrado"})
    //crear la instancia del modelo
    const nuevoVeterinario = new Veterinario(req.body)
    //encriptar el password del usuario
    nuevoVeterinario.password = await nuevoVeterinario.encrypPassword(password)
    //token para el correo
    const token = nuevoVeterinario.crearToken()
    await sendMailToUser(email,token)
    //guardar en bd
    await nuevoVeterinario.save()
    //guardar la respuesta
    res.status(200).json({msg:"Revisa tu correo electrónico para confirmar tu cuenta"})
}
const confirmEmail = async (req,res)=>{
    //si no existe el token
    if(!(req.params.token)) return res.status(400).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    //verificar si en base al token existe el usuario
    const veterinarioBDD = await Veterinario.findOne({token:req.params.token})
    //validar si el token fue seteado a null
    if(!veterinarioBDD?.token) return res.status(404).json({msg:"La cuenta ya ha sido confirmada"})
    //stear a null el token y cambiar a true la confirmacion de la cuenta
    veterinarioBDD.token = null
    veterinarioBDD.confirmEmail=true
    //guardar datos en bd
    await veterinarioBDD.save()
    //mensaje al usuario
    res.status(200).json({msg:"Token confirmado, ya puedes iniciar sesión"}) 
}
const listarVeterinarios = (req,res)=>{
    res.status(200).json({res:'lista de veterinarios registrados'})
}
const detalleVeterinario = async (req,res)=>{
    //obtener datos del request
    const {id} = req.params
    //validar el id
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, debe ser un id válido`});
    //obtener el usuario en la bd
    const veterinarioBDD = await Veterinario.findById(id).select("-password")
    //
    if(!veterinarioBDD) return res.status(404).json({msg:`Lo sentimos, no existe el veterinario ${id}`})
    //
    res.status(200).json({msg:veterinarioBDD})
}
const actualizarPerfil = async (req,res)=>{
    const {id} = req.params
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, debe ser un id válido`});
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const veterinarioBDD = await Veterinario.findById(id)
    if(!veterinarioBDD) return res.status(404).json({msg:`Lo sentimos, no existe el veterinario ${id}`})
    if (veterinarioBDD.email !=  req.body.email)
    {
        const veterinarioBDDMail = await Veterinario.findOne({email:req.body.email})
        if (veterinarioBDDMail)
        {
            return res.status(404).json({msg:`Lo sentimos, el existe ya se encuentra registrado`})  
        }
    }
		veterinarioBDD.nombre = req.body.nombre || veterinarioBDD?.nombre
    veterinarioBDD.apellido = req.body.apellido  || veterinarioBDD?.apellido
    veterinarioBDD.direccion = req.body.direccion ||  veterinarioBDD?.direccion
    veterinarioBDD.telefono = req.body.telefono || veterinarioBDD?.telefono
    veterinarioBDD.email = req.body.email || veterinarioBDD?.email
    await veterinarioBDD.save()
    res.status(200).json({msg:"Perfil actualizado correctamente"})
}
const actualizarPassword = async (req,res)=>{
    const veterinarioBDD = await Veterinario.findById(req.veterinarioBDD._id)
    if(!veterinarioBDD) return res.status(404).json({msg:`Lo sentimos, no existe el veterinario ${id}`})
    const verificarPassword = await veterinarioBDD.matchPassword(req.body.passwordactual)
    if(!verificarPassword) return res.status(404).json({msg:"Lo sentimos, el password actual no es el correcto"})
    veterinarioBDD.password = await veterinarioBDD.encrypPassword(req.body.passwordnuevo)
    await veterinarioBDD.save()
    res.status(200).json({msg:"Password actualizado correctamente"})
}
const recuperarPassword= async (req,res)=>{
    const {email} = req.body
    //validacion de espacion vacios
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const veterinarioBDD = await Veterinario.findOne({email})
    //obtener el usuario en base al email
    if(!veterinarioBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})
    //crear un token
    const token = veterinarioBDD.crearToken()
    //establecer el token en el usuario obtenido previamente
    veterinarioBDD.token=token
    //enviar el mail de recuperacion
    await sendMailToRecoveryPassword(email,token)
    //guardar los datos en la BD
    await veterinarioBDD.save()
    //presnta informacion al usuario para activar cuenta
    res.status(200).json({msg:"Revisa tu correo electrónico para reestablecer tu cuenta"})
}
const comprobarTokenPasword= async (req,res)=>{
    //metodo para verificar el token y cambiar la contraseña
    //validar token
    if(!(req.params.token)) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    //obtener el usuario en base al token con el metodo findOne
    const veterinarioBDD = await Veterinario.findOne({token:req.params.token})
    //Validacion de la existencia del usuario
    if(veterinarioBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    //guardar en base de datos
    await veterinarioBDD.save()
    //presentar mensajes al usuario
    res.status(200).json({msg:"Token confirmado, ya puedes crear tu nuevo password"}) 
}
const nuevoPassword= async (req,res)=>{
    //revisa tu correo electronico para cambiar la contraseña
    //obtener el password nuevo y la confirmacion del pasword del request
    const{password,confirmpassword} = req.body
    //validacion de campos vacios
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    //valdiar si los pasword son iguales,
    if(password != confirmpassword) return res.status(404).json({msg:"Lo sentimos, los passwords no coinciden"})
    //obtener los datos del usuario en base al token
    const veterinarioBDD = await Veterinario.findOne({token:req.params.token})
    //validar si existe el usuario
    if(veterinarioBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    //setear el token a null
    veterinarioBDD.token = null
    //encriptar el password
    veterinarioBDD.password = await veterinarioBDD.encrypPassword(password)
    //guardar en base de datos
    await veterinarioBDD.save()
    //mostrar mensaje al usuario
    res.status(200).json({msg:"Felicitaciones, ya puedes iniciar sesión con tu nuevo password"}) 
}
//exportacion nombrada, no por default
export {
    login,
    perfil,
    registro,
    confirmEmail,
    listarVeterinarios,
    detalleVeterinario,
    actualizarPerfil,
    actualizarPassword,

	recuperarPassword,
    comprobarTokenPasword,
	nuevoPassword
}