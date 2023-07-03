import Veterinario from "../models/Veterinario.js"
import sendMailToUser from "../config/nodemailer.js"

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
    //desestructurar para enviar solo estos campos
    const {nombre,apellido,direccion,telefono,_id} = veterinarioBDD
    res.status(200).json({
        nombre,
        apellido,
        direccion,
        telefono,
        _id,
        email:veterinarioBDD.email
    })
}
const perfil=(req,res)=>{
    res.status(200).json({res:'perfil del veterinario'})
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
const detalleVeterinario = (req,res)=>{
    res.status(200).json({res:'detalle de un eterinario registrado'})
}
const actualizarPerfil = (req,res)=>{
    res.status(200).json({res:'actualizar perfil de un veterinario registrado'})
}
const actualizarPassword = (req,res)=>{
    res.status(200).json({res:'actualizar password de un veterinario registrado'})
}
const recuperarPassword= (req,res)=>{
    res.status(200).json({res:'enviar mail recuperación'})
}
const comprobarTokenPasword= (req,res)=>{
    res.status(200).json({res:'verificar token mail'})
}
const nuevoPassword= (req,res)=>{
    res.status(200).json({res:'crear nuevo password'})
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