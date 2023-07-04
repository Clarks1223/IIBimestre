import mongoose from 'mongoose'

mongoose.set('strictQuery', true)
const connection = async()=>{
    try {
        const {connection} = await mongoose.connect(process.env.MONGODB_URI,{
            useUnifiedTopology:true,
            useNewUrlParser:true,
        })
        console.log(`Base de datos conectada en ${connection.host} - ${connection.port}`)
    } catch (error) {
        console.log(error);
    }
}
//importa la cadena de conexion
export default  connection