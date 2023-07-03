import app from './server.js'
import connection from './database.js';

app.listen(app.get('port'),()=>{
    console.log(`Server levantado en http://localhost:${app.get('port')}`);
})

//la invoco desde database.js
connection()