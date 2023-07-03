import {Schema, model} from 'mongoose'
//para encriptar el password del usuario
import bcrypt from "bcryptjs"
//creacion de la base de datos
const veterinarioSchema = new Schema({
    nombre:{
        type:String,
        require:true,
        trim:true
    },
    apellido:{
        type:String,
        require:true,
        trim:true
    },
    direccion:{
        type:String,
        trim:true,
        default:null
    },
    telefono:{
        type:Number,
        trim:true,
        default:null
    },
    email:{
        type:String,
        require:true,
        trim:true,//quita el espacio en blanco de adelante y atras
		unique:true
    },
    password:{
        type:String,
        require:true
    },
    status:{
        //activo o descativo
        type:Boolean,
        default:true
    },
    token:{
        //activar la cuenta
        type:String,
        default:null
    },
    confirmEmail:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
})

// Método para cifrar el password del veterinario
veterinarioSchema.methods.encrypPassword = async function(password){
    const salt = await bcrypt.genSalt(10)
    const passwordEncryp = await bcrypt.hash(password,salt)
    return passwordEncryp
}

// Método para verificar si el password ingresado es el mismo de la BDD
veterinarioSchema.methods.matchPassword = async function(password){
    const response = await bcrypt.compare(password,this.password)
    return response
}

// Método para crear un token 
veterinarioSchema.methods.crearToken = function(){
    const tokenGenerado = this.token = Math.random().toString(36).slice(2)
    return tokenGenerado
}

export default model('Veterinario',veterinarioSchema)