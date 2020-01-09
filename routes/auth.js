const router = require('express').Router()
const Joi = require('@hapi/joi');
const con = require('../config/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const verify = require('./verify_route')



router.get('/register', verify, (req, res) => {
    res.render('register')
})


router.get('/users', verify, (req, res) => {
    con.query("SELECT * FROM hotel_user", (error, results, fields) => {
        res.render('user', {results})
    })
})

router.post('/register', verify, async (req, res) => {
    const schema = Joi.object({
        first_name: Joi.string().required(),
        last_name:Joi.string().required(),
        email: Joi.string().email().required(),
        phone: Joi.number().required(),
        password: Joi.string().required().min(3).max(15),
        confirm_password: Joi.any().valid(Joi.ref('password'))
    })
    const {error, value} = schema.validate(req.body, {abortEarly: false})

    if(error){
        res.send(error.details[0].message)
    }else{
        // check if user already exist
        con.query("SELECT COUNT(id) AS id FROM hotel_user WHERE email = ?",[value.email], async (error, id, fields) => {
            if(id[0].id > 0){
                return res.status(400).send('Email Already Exists')
            }else{
                // hash password
                const salt = await bcrypt.genSalt(10)
                const hashPassword = await bcrypt.hash(value.password, salt)

                con.query("INSERT INTO hotel_user (first_name, last_name, email, phone, PASSWORD) VALUES (?, ?, ?, ?, ?)", 
                [value.first_name, value.last_name, value.email, value.phone, hashPassword], (error, result, fileds) => {
                    res.redirect('/users')
                })
            }
        })
        
    }
})


router.get('/login', (req, res) => {
    res.render('login', {layout: false})
})


router.post('/loginCheck', (req, res) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required().min(3).max(15),
       
    })
    const {error, value} = schema.validate(req.body, {abortEarly: false})
    if (error){
        res.send(error.details[0].message)
    }else{
        
        con.query("SELECT * FROM hotel_user WHERE email = ? limit 1",[value.email], async (error, user, fields) => {
            if(Object.keys(user).length == 0){
                return res.status(400).send('Email or Password is wrong')
            }else{
                // compare password
                const validPassword = await bcrypt.compare(value.password, user[0].password)

                if(!validPassword){
                    return res.status(400).send('Email or Password is wrong')
                }else{
                    const token = jwt.sign({id: user[0].id}, process.env.TOKEN_SECRET, {expiresIn: '10s'})
                    res.cookie('auth_token', token, {
                        httpOnly: true
                        // secure: true
                    })
                    res.redirect('/')
                }
            }
        })
    }
})

module.exports = router