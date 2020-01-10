const router = require('express').Router()
const Joi = require('@hapi/joi');
const con = require('../config/db')
const verify = require('./verify_route')

const multer = require('multer')
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'public/images/accomodations/')
    },
    filename: function(req, file, cb){
        cb(null, file.originalname)
    }
})
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true)
    }else{
        cb("Image Type is not valid. Only allowed JPEG or PNG", false)
    }
}
const upload = multer({
    storage: storage, 
    limits:{
        fileSize: 1024 * 1024 * 4,
    },
    fileFilter: fileFilter
})

router.get('/hotel_categories', verify, (req, res) => {
    con.query("SELECT * FROM hotel_categories", (error, results, fields) => {
        res.render('hotel_categories', {results})
    })
})

router.get('/add_hotel_categories', verify, (req, res) => {
    res.render('add_hotel_categories')
})

// register hotel category
router.post('/hotel_categories', verify, upload.single('photo'), (req, res) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        photos: Joi.string().required(),
        descriptions: Joi.string().required(),
        max_guest: Joi.number().integer(),
        child: Joi.number().integer(),
        extra_bed: Joi.number().integer()
    })

    const {error, value} = schema.validate({
        name: req.body.name,
        photos: "accomodations/" + req.file.filename,
        descriptions: req.body.descriptions,
        max_guest: req.body.max_guest,
        child: req.body.child,
        extra_bed: req.body.extra_bed
    })
    if (error){
        console.log(error.details[0].message)
        return
    }else{
        con.query("INSERT INTO hotel_categories (name, photos, descriptions, max_guest, child, extra_bed) VALUES (?, ?, ?, ?, ?, ?)", 
        [value.name, value.photos, value.descriptions, value.max_guest, value.child, value.extra_bed], (error, results, fields) => {
            if (error) throw error
            res.status(200)
            res.json('Saved Successfully')
        })
    }  
})

// get hotel category by id
router.get('/hotel_categories/:id', verify, (req, res) => {
    con.query("SELECT * FROM hotel_categories WHERE id = ?", [req.params.id], (error, results, fields) => {
        if(error) throw error
        res.status(200)
        res.json(results[0])
    })
})

//update hotel category
router.put('/hotel_categories/:id', verify, (req, res) => {
    let name = req.body.name
    let photos = req.body.photos
    let descriptions = req.body.descriptions
    let max_guest = req.body.max_guest
    let child = req.body.child
    let extra_bed = req.body.extra_bed

    con.query("UPDATE hotel_categories SET name = ?, photos = ?, descriptions = ?, max_guest = ?, child = ?, extra_bed = ? WHERE id = ?", 
    [name, photos, descriptions, max_guest, child, extra_bed, req.params.id], (error, results, fields) => {
        if (error) throw error
        res.status(200)
        res.json('Updated Successfully')
    })
})



//add rate of room categories
router.get('/add_rate', verify, (req, res) => {
    con.query('SELECT hotel_categories.id, hotel_categories.name FROM hotel_categories', (error, results, fields) => {
        res.render('add_rate', {results})
    })
})

// Get details of categories
router.get('/categories/:id', verify, (req, res) => {
    let des = []
    con.query("SELECT name, photos, descriptions,max_guest, child FROM hotel_categories WHERE id = ?",[req.params.id], (error, results, fields) => {
        con.query("SELECT hotel_cat_services.service_name, hotel_cat_features.feature_name FROM hotel_room_services, hotel_cat_services, hotel_cat_features WHERE hotel_room_services.service_id = hotel_cat_services.id AND hotel_cat_services.features_id = hotel_cat_features.id AND hotel_room_services.cat_id = ?",
        [req.params.id], (error, results1, fields) => {
            des.push({
                name: results[0].name,
                photos: results[0].photos,
                max_guest: results[0].max_guest,
                child: results[0].child,
                descriptions: results[0].descriptions,
                services: results1
            })
            res.json(des)
        })
        
    })
})


module.exports = router