const express = require('express');
const authRoutes = require('../modules/auth/auth.route.js')


const router = express.Router();

const defaultRoutes = [
    {
        path: '',
        route: authRoutes
    }, 
]

defaultRoutes.forEach(route => {
    router.use(route.path, route.route)
})

module.exports = router;