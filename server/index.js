const express = require('express')
const bodyParser = require('body-parser')
const next = require('next')
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const routes = require("./middlewares/routes");
const path = require('path')

const { authValid, authValidWithDb } = require("./middlewares/auth")

const cookieParser = require('cookie-parser');

app.prepare()
    .then(() => {
        const server = express()
        server.use(bodyParser.json())
        server.use(bodyParser.urlencoded({ extended: true }))
        server.use(cookieParser())
        //all fond and back end apis
        server.use(routes)
        server.use('/static', express.static(path.join(__dirname, 'public')))
        //fontend pages with auth
        // server.get("/", (req, res) => {
        //     res.redirect("/dashboard")
        // })
        server.get("/dashboard", authValid, authValidWithDb, (req, res) => {
            return handle(req, res)
        })
        server.get("/dashboard/profile", authValid, authValidWithDb, (req, res) => {
            return handle(req, res)
        })
        server.get("/dashboard/campaigns", authValid, authValidWithDb, (req, res) => {
            return handle(req, res)
        })
        server.get("/dashboard/liveCampaigns", authValid, authValidWithDb, (req, res) => {
            return handle(req, res)
        })
        server.get("/dashboard/postBack", authValid, authValidWithDb, (req, res) => {
            return handle(req, res)
        })
        server.get("/dashboard/pay-to-user", authValid, authValidWithDb, (req, res) => {
            return handle(req, res)
        })
        server.get("/dashboard/geteway-settings", authValid, authValidWithDb, (req, res) => {
            return handle(req, res)
        })
        server.get("/dashboard/ban-number", authValid, authValidWithDb, (req, res) => {
            return handle(req, res)
        })
        server.get("/dashboard/bannedNumber", authValid, authValidWithDb, (req, res) => {
            return handle(req, res)
        })
        server.get("/dashboard/telegram-alerts", authValid, authValidWithDb, (req, res) => {
            return handle(req, res)
        })
        server.get("/dashboard/payments", authValid, authValidWithDb, (req, res) => {
            return handle(req, res)
        })
        server.get("/dashboard/camp/click/:id", authValid, authValidWithDb, (req, res) => {
            return handle(req, res)
        })
        server.get("/dashboard/camp/edit/:id", authValid, authValidWithDb, (req, res) => {
            return handle(req, res)
        })
        server.get("/dashboard/camp/view/:id", authValid, authValidWithDb, (req, res) => {
            return handle(req, res)
        })
        server.get("/auth/devices", authValid, authValidWithDb, (req, res) => {
            return handle(req, res)
        })


        server.get('*', (req, res) => {
            return handle(req, res)
        })
        server.listen(3000, (err) => {
            if (err) throw err
            console.log('> Ready on http://localhost:3655')
        })
    })
    .catch((ex) => {
        console.log(ex.stack)
        process.exit(1)
    })

process.on('uncaughtException', function (err) {
    console.log(err);
    console.log("Node NOT Exiting...");
});