const router = require('express').Router()
const Joi = require('@hapi/joi');
const con = require('../config/db')
const verify = require('./verify_route')



// get all the rooms
router.get('/rooms', verify, (req, res) => {
    con.query("SELECT hotel_categories.id, hotel_categories.name, hotel_room.room_id FROM hotel_categories, hotel_room WHERE hotel_categories.id = hotel_room.cat_id",
    (error, results, fields) => {
        if (error) throw error
        res.status(200)
        res.render('rooms', {results})
    })
})

// add rooms
router.get('/add_room', verify, (req, res) => {
    con.query('SELECT hotel_categories.id, hotel_categories.name FROM hotel_categories', (error, results, fields) => {
        res.render('add_room', {results})
    })
})

router.post('/add_room', verify, (req, res) => {
    const schema = Joi.object({
        cat_id: Joi.number().integer().required(),
        room_id: Joi.number().integer().required()
    })

    const {error, value} = schema.validate({
        cat_id: req.body.category,
        room_id: req.body.room_no
    })

    if (error){
        console.log(error.details[0].message)
        return
    }else{
        con.query("INSERT INTO hotel_room (cat_id, room_id) VALUES (?, ?)",
        [value.cat_id, value.room_id], (error, results, fields) => {
            if (error) throw error
            res.status(200)
            res.json('Saved Successfully')
        })
    }
})

router.get('/view_room_rate', verify, (req, res) => {
    con.query("SELECT hotel_cat_rate.id, hotel_categories.name, hotel_cat_rate.rate, hotel_cat_rate.extra_bed, hotel_cat_rate.extra_guest FROM hotel_categories, hotel_cat_rate WHERE hotel_categories.id = hotel_cat_rate.cat_id",
    (error, results, fields) => {
        if (error){
            throw error
            return;
        }else{
            res.render('view_room_rate', {results})
        }
    })
})

//get list of room features
router.get('/room_features', verify, (req, res) => {
    con.query("SELECT hotel_cat_features.feature_name FROM hotel_cat_features",
    (error, results, fields) => {
        res.status(200)
        res.render('room_features', {results})
    })
})

//add room features
router.get('/add_room_feature', verify, (req, res) => {
    res.render('add_room_feature')
})

router.post('/room_features', verify, (req, res) => {
    const schema = Joi.object({
        feature_name: Joi.string().required()
    })

    const {error, value} = schema.validate({
        feature_name: req.body.feature_name
    })

    if (error) {
        console.log(error.details[0].message)
        return
    }else{
        con.query("INSERT INTO hotel_cat_features (feature_name) VALUES (?)",
        [value.feature_name], (error, results, fields) => {
            res.status(200)
            res.json("Saved Successfully")
        })
    }
})

// get list of room services
router.get('/room_services', verify, (req, res) => {
    con.query("SELECT hotel_cat_features.feature_name, hotel_cat_services.features_id, hotel_cat_services.service_name FROM hotel_cat_services, hotel_cat_features WHERE hotel_cat_features.id = hotel_cat_services.features_id",
    (error, results, fileds) => {
        res.render('room_services', {results})
    })
})

router.get('/add_room_services', verify, (req, res) => {
    con.query("SELECT id, feature_name FROM hotel_cat_features",
    (error, results, fields) => {
        res.render('add_room_services', {results})
    })
    
})

// add room service
router.post('/room_services', verify, (req, res) => {
    const schema = Joi.object({
        features_id: Joi.number().integer().required(),
        service_name: Joi.string().required()
    })

    const {error, value} = schema.validate({
        features_id: req.body.feature_id,
        service_name: req.body.room_service
    })

    if (error) {
        console.log(error.details[0].message)
        return
    }else{
        con.query("INSERT INTO hotel_cat_services(features_id, service_name) VALUES (?, ?)",
        [value.features_id, value.service_name], (error, results, fields) => {
            res.status(200)
            res.json("Saved Successfully")
        })
    }
})

// add services to room
router.get('/add_room_services_to_room', verify, (req, res) => {
    con.query("SELECT id, name FROM hotel_categories", 
    (error, categories, fields) => {
        if (error) throw error
        con.query("SELECT id, service_name FROM hotel_cat_services", 
        (err, services, fileds) => {
            if (err) throw err
            res.render('add_room_services_to_room', {categories, services})
        })
    })
    
})


router.post('/add_room_services_to_room', verify, (req, res) => {
    const schema = Joi.object({
        cat_id: Joi.number().integer().required(),
        service_id: Joi.required()
    })

    const {error, value} = schema.validate({
        cat_id: req.body.category,
        service_id: req.body.services
    })
    if (error) {
        console.log(error.details[0].message)
        return
    }else{
        value.service_id.forEach(element => {
            con.query("SELECT COUNT(id) as count FROM hotel_room_services WHERE cat_id = ? AND service_id = ?", 
            [value.cat_id, element], (err, res, fields) => {
                if(res[0].count >= 1){
                    console.log(res)
                }else{
                    con.query("INSERT INTO hotel_room_services (cat_id, service_id) VALUES (?, ?)",
                    [value.cat_id, element], (error, results, fields) => {
                        if (error){
                            console.log(error)
                            return   
                        }
                    })
                }
            })
            
        })
        res.status(200)
        res.json("Saved Successfully")
    }
})

// view Services of room 
router.get('/view_services_of_room', verify, (req, res) => {
    con.query("SELECT id, name FROM hotel_categories ORDER BY id ASC", 
    (error, categories, fields) => {
        if (error){
            console.log(error)
            return
        }
        con.query("SELECT hotel_room_services.id, hotel_cat_services.service_name, hotel_room_services.cat_id FROM hotel_room_services, hotel_cat_services WHERE hotel_room_services.service_id = hotel_cat_services.id ORDER BY cat_id ASC",
        (error, services, fields) => {
            if (error){
                console.log(error)
                return
            }
            res.render('view_services_of_room', {categories, services})
        })
    })
})

router.get('/add_room_services_to_room/:id', verify, (req, res) => {
    con.query("DELETE FROM hotel_room_services WHERE id = ?",
    [req.params.id], (error, results, fields) => {
        if (error){
            throw error
        }else{
            res.redirect('/admin/view_services_of_room')
        }
    }) 
})

// get details of rooms
router.get('/rooms/:id', verify, (req, res) => {
    con.query("SELECT hotel_categories.id, hotel_categories.name,hotel_room.room_id, hotel_categories.max_guest, hotel_categories.child, hotel_categories.extra_bed, hotel_cat_rate.rate AS adult_rate, hotel_cat_rate.extra_bed AS extra_bed_rate, hotel_cat_rate.extra_guest AS extra_guest_rate FROM hotel_categories, hotel_room, hotel_cat_rate WHERE hotel_categories.id = hotel_room.cat_id AND hotel_categories.id = hotel_cat_rate.cat_id AND hotel_room.room_id = ?",
    [req.params.id], (error, room_details, fields) => {
        if(error){
            console.log(error)
            return
        }
        res.json(room_details)
    })
})


module.exports = router