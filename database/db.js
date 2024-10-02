const mysql = require('mysql')
const coneccion = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
})

coneccion.connect((error) => {
    if (error) {
        console.log('EL error de econexion es: ' + error)
    }
    console.log('Conectado ala base de datos')
})

module.exports = coneccion