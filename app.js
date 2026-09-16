require('dotenv').config()

// Frameworks
const express = require('express')
const app = express()
const cors = require("cors")
const rateLimit = require('express-rate-limit')


app.use(express.json())

// Files calls
const launchParams = require('./src/config/launch.params').configVariables
const configDB = require('./src/config/db')
const scriptRoute = require('./src/routes/scripts.route')
const userRoute = require('./src/routes/user.route')
const healthRoute = require("./src/routes/health.route")

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,   // second to minute, 15m
    max: 30,                    // during windowMs
    message: 'Too many request.',
    standardHeaders: true,      // output header limit in header
    legacyHeaders: false,       // prevent outdate header synhtax
})


// Adds headers: Access-Control-Allow-Origin: *
app.use(cors())
// set on all routes
app.use(limiter)


app.use('/', healthRoute)
app.use("/user", userRoute)
app.use("/script", scriptRoute)

// on async to prevent circular dependency
const start = async () => {
    if (launchParams.INIT_DB === true) {
        await configDB.initiateDB()
        console.log("Exiting after database initialization.")
        return
    }

    await configDB.testDBConnection()

    app.listen(launchParams.PORT, () => {
        console.log(`
            Server is listening at http://${launchParams.HOST}:${launchParams.PORT}
            
            `)
        }
    )
}

start().catch((error) => {
    console.error("Unable to start the application.", error)
    process.exit(1)
})