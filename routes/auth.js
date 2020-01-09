const router = require('express').Router()
const Joi = require('@hapi/joi');
const con = require('../config/db')
const bcrypt = require('bcryptjs')

router.get('/register', (req, res) => {
    res.render('register')
})


router.get('/users', (req, res) => {
    con.query("SELECT * FROM hotel_user", (error, results, fields) => {
        res.render('user', {results})
    })
})

router.post('/register', async (req, res) => {
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

                console.log(validPassword)
                if(!validPassword){
                    return res.status(400).send('Email or Password is wrong')
                }else{
                    res.send(user)
                }
            }
        })
    }
})

module.exports = router