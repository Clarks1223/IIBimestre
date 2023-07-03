import mongoose from 'mongoose'

mongoose.set('strictQuery', true)
const connection = async()=>{
    try {
        const {connection} = await mongoose.connect(process.env.MONGODB_URI,{
            useUnifiedTopology:true,
            useNewUrlParser:true,
        })
        console.log(`Database is connected on ${connection.host} - ${connection.port}`)
    } catch (error) {
        console.log(error);
    }
}
//exporta la cadena de conexion
export default  connection