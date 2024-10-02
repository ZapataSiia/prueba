const express = require('express')
const app = express()

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

const dotenv = require('dotenv')
dotenv.config({ path: './env/.env' })

app.use('/resources', express.static('public'))
app.use('/resources', express.static(__dirname + '/public'))

app.set('view engine', 'ejs')

const bcryptjs = require('bcryptjs')

const session = require('express-session')
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

const coneccion = require('./database/db')

// app.get('/', (req, res) => {
//     res.render('index', { msg: 'este es un mensaje desde node' })
// })

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/register', (req, res) => {
    res.render('register')
})


app.post('/register', async (req, res) => {
    const user = req.body.user
    const nombre = req.body.nombre
    const rol = req.body.rol
    const pass = req.body.pass
    let passwordHaash = await bcryptjs.hash(pass, 8)

    coneccion.query('INSERT INTO users SET ?', { user: user, name: nombre, rol: rol, pass: passwordHaash }, async (error, results) => {
        if (error) {
            console.log(error)
        }
        else {
            // res.send('ALTA EXITOSA')
            res.render('register', {
                alert: true,
                alertTitle: "Registro",
                alertMessage: "Registro Exitoso!!!",
                alertIcon: "success",
                showConfirmButton: false,
                timer: 1500,
                ruta: ''
            })
        }
    })
})

app.post('/auth', async (req, res) => {
    const user = req.body.user
    const pass = req.body.pass
    let passwordHaash = await bcryptjs.hash(pass, 8)
    if (user && pass) {
        coneccion.query('SELECT * FROM users WHERE user=?', [user], async (error, results) => {
            if (results.length == 0 || !(await bcryptjs.compare(pass, results[0].pass))) {
                res.render('login', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Usuario y/o incorrectos",
                    alertIcon: "error",
                    showConfirmButton: true,
                    timer: false,
                    ruta: "login"
                })
            }
            else {
                req.session.loggedin = true
                req.session.name = results[0].name
                res.render('login', {
                    alert: true,
                    alertTitle: "Conexion exitosa",
                    alertMessage: "Login Correcto",
                    alertIcon: "success",
                    showConfirmButton: false,
                    timer: 1500,
                    ruta: ""
                })
            }
        })
    }
    else {
        res.render('login', {
            alert: true,
            alertTitle: "Advertencia",
            alertMessage: "Por favor ingrese un usuario y contraseña",
            alertIcon: "warning",
            showConfirmButton: true,
            timer: false,
            ruta: 'login'
        })
    }
})

app.get('/', (req, res) => {
    if (req.session.loggedin) {
        res.render('index', {
            login: true,
            name: req.session.name
        })
    }
    else {
        res.render('index', {
            login: false,
            name: 'DEBE INICIAR SESION'
        })
    }
})

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/')
    })
})

app.listen('3000', (req, res) => {
    //cambio de puerto
    console.log('servidor corriendo en http://localhost:3001')
})