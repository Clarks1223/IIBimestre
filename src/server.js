//realizar importaciones
import express from 'express'
import dotenv from 'dotenv'//manejor de variables de entorno
import cors from 'cors';
//imporatar las rutas de veterinario
import routerVeterinarios from './routers/veterinario_routes.js'
//importar las rutas de paciente
import routerPacientes from './routers/paciente_routes.js'


// Inicializaciones
const app = express()
dotenv.config()

// Configuraciones 
app.set('port',process.env.port || 3000)
app.use(cors())

// Middlewares 
app.use(express.json())//


// Variables globales


// Rutas 
app.use('/api',routerVeterinarios)
app.use('/api',routerPacientes)

// Manejo de una ruta que no sea encontrada
app.use((req,res)=>res.status(404).send("Endpoint no encontrado - 404"))

//exportacion de la variable app
export default  app