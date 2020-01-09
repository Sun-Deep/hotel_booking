// including express library
const express = require('express')
const app = express()

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const dotenv = require('dotenv')
dotenv.config()

const cookieParser = require('cookie-parser')
app.use(cookieParser())

const con = require('./config/db')

var path = require('path')
var expressHbs = require('express-handlebars')
const hbs = expressHbs.create({
    defaultLayout:'layout', 
    extname: '.hbs',
    //create helpers
    helpers: {
        ifEquals: function(arg1, arg2, options) {
            return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
          },
        dec: function(value, options){
            return parseInt(value) - 1
        }
    }
})
app.engine('.hbs', hbs.engine)

app.set('view engine', '.hbs')
app.use(express.static(path.join(__dirname, 'public')))


const Joi = require('@hapi/joi');

const cors = require('cors')
app.use(cors())

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


//import routes
const authRoute = require('./routes/auth')
app.use('/admin/', authRoute)

app.get('/', (req, res) => {
    con.query("SELECT COUNT(id) as new_inquiry FROM hotel_inquiry WHERE called = 0",
    (error, new_inquiry, fields) => {
        new_inquiry = new_inquiry[0]
        con.query("SELECT COUNT(id) AS booked FROM hotel_booking WHERE hotel_booking.status = 1",
        (error, booked, fields) => {
            booked = booked[0]
            res.render('index', {new_inquiry, booked})
        })
    })
})


app.get('/hotel_categories', (req, res) => {
    con.query("SELECT * FROM hotel_categories", (error, results, fields) => {
        res.render('hotel_categories', {results})
    })
})

app.get('/add_hotel_categories', (req, res) => {
    res.render('add_hotel_categories')
})
// register hotel category
app.post('/hotel_categories', upload.single('photo'), (req, res) => {
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
app.get('/hotel_categories/:id', (req, res) => {
    con.query("SELECT * FROM hotel_categories WHERE id = ?", [req.params.id], (error, results, fields) => {
        if(error) throw error
        res.status(200)
        res.json(results[0])
    })
})

//update hotel category
app.put('/hotel_categories/:id', (req, res) => {
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

// get all the rooms
app.get('/rooms', (req, res) => {
    con.query("SELECT hotel_categories.id, hotel_categories.name, hotel_room.room_id FROM hotel_categories, hotel_room WHERE hotel_categories.id = hotel_room.cat_id",
    (error, results, fields) => {
        if (error) throw error
        res.status(200)
        res.render('rooms', {results})
    })
})

// add rooms
app.get('/add_room', (req, res) => {
    con.query('SELECT hotel_categories.id, hotel_categories.name FROM hotel_categories', (error, results, fields) => {
        res.render('add_room', {results})
    })
})

app.post('/add_room', (req, res) => {
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

//add rate of room categories
app.get('/add_rate', (req, res) => {
    con.query('SELECT hotel_categories.id, hotel_categories.name FROM hotel_categories', (error, results, fields) => {
        res.render('add_rate', {results})
    })
})

app.get('/view_room_rate', (req, res) => {
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
app.get('/room_features', (req, res) => {
    con.query("SELECT hotel_cat_features.feature_name FROM hotel_cat_features",
    (error, results, fields) => {
        res.status(200)
        res.render('room_features', {results})
    })
})

//add room features
app.get('/add_room_feature', (req, res) => {
    res.render('add_room_feature')
})

app.post('/room_features', (req, res) => {
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
app.get('/room_services', (req, res) => {
    con.query("SELECT hotel_cat_features.feature_name, hotel_cat_services.features_id, hotel_cat_services.service_name FROM hotel_cat_services, hotel_cat_features WHERE hotel_cat_features.id = hotel_cat_services.features_id",
    (error, results, fileds) => {
        res.render('room_services', {results})
    })
})

app.get('/add_room_services', (req, res) => {
    con.query("SELECT id, feature_name FROM hotel_cat_features",
    (error, results, fields) => {
        res.render('add_room_services', {results})
    })
    
})

// add room service
app.post('/room_services', (req, res) => {
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
app.get('/add_room_services_to_room', (req, res) => {
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


app.post('/add_room_services_to_room', (req, res) => {
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
app.get('/view_services_of_room', (req, res) => {
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

app.get('/add_room_services_to_room/:id', (req, res) => {
    con.query("DELETE FROM hotel_room_services WHERE id = ?",
    [req.params.id], (error, results, fields) => {
        if (error){
            throw error
        }else{
            res.redirect('/view_services_of_room')
        }
    }) 
})

//get new enquires
app.get('/new_inquiry', (req, res) => {
    con.query("SELECT id, first_name, last_name, address, DATE_FORMAT(checked_in, '%Y-%m-%d') AS checked_in, DATE_FORMAT(checked_out, '%Y-%m-%d') AS checked_out, rooms, adult, child, extra_bed, amount, called, DATE_FORMAT(date, '%Y-%m-%d') AS date FROM hotel_inquiry WHERE called = 0 ORDER BY DATE ASC",
    (error, results, fields) => {
        res.render('inquiry', {results})
    })
})

app.get('/inquiry/:id', (req, res) => {
    con.query("SELECT * FROM hotel_inquiry WHERE id = ?", 
    [req.params.id], (error, results, fields) => {
        if (error){
            throw error
        }else{
            res.render('update_inquiry', {results})
        }
    })
})

app.post('/inquiry', (req, res) => {
    con.query("UPDATE hotel_inquiry SET called = ? WHERE id = ?",
    [req.body.called, req.body.id], (error, results, fields) => {
        if(error){
            throw error
        }else{
            res.redirect('/old_inquiry')
        }
    })
})

//get old enquires
app.get('/old_inquiry', (req, res) => {
    con.query("SELECT id, first_name, last_name, address, DATE_FORMAT(checked_in, '%Y-%m-%d') AS checked_in, DATE_FORMAT(checked_out, '%Y-%m-%d') AS checked_out, rooms, adult, child, extra_bed, amount, called, DATE_FORMAT(date, '%Y-%m-%d') AS date FROM hotel_inquiry WHERE called = 1 ORDER BY DATE ASC",
    (error, results, fields) => {
        res.render('inquiry', {results})
    })
})

// copy from inquiry to booking
app.get('/copy/:id', (req, res) => {
    con.query("SELECT * FROM hotel_inquiry WHERE id = ?", 
    [req.params.id], (error, results, fields) => {
        res.render('booking', {results})
    })
})

//check available rooms
app.post('/check', (req, res) => {

    let available_rooms = []
    let checked_in = req.body.from
    let checked_out = req.body.to
    
    con.query("SELECT hotel_room.cat_id, COUNT(hotel_room.room_id) - COUNT(hotel_booking.room_id) AS remaining_rooms FROM hotel_booking RIGHT JOIN hotel_room ON hotel_booking.room_id = hotel_room.room_id AND hotel_booking.status = 1 AND hotel_booking.checked_in < ? AND hotel_booking.checked_out > ? GROUP BY hotel_room.cat_id",
    [checked_out, checked_in], (error, results, fields) => {
        if(error) throw error
        con.query("SELECT id, name, max_guest, child from hotel_categories", (error, results1, fields) => {
            for(let i = 0; i < results.length; i++){
                if (results[i].cat_id == results1[i].id){
                    available_rooms.push({
                        id: results[i].cat_id,
                        name: results1[i].name,
                        max_guest: results1[i].max_guest,
                        child: results1[i].child,
                        rooms: results[i].remaining_rooms
                    })
                }
             }
             res.json(available_rooms)
        })
    })
})
// get details of rooms
app.get('/rooms/:id', (req, res) => {
    con.query("SELECT hotel_categories.id, hotel_categories.name,hotel_room.room_id, hotel_categories.max_guest, hotel_categories.child, hotel_categories.extra_bed, hotel_cat_rate.rate AS adult_rate, hotel_cat_rate.extra_bed AS extra_bed_rate, hotel_cat_rate.extra_guest AS extra_guest_rate FROM hotel_categories, hotel_room, hotel_cat_rate WHERE hotel_categories.id = hotel_room.cat_id AND hotel_categories.id = hotel_cat_rate.cat_id AND hotel_room.room_id = ?",
    [req.params.id], (error, room_details, fields) => {
        if(error){
            console.log(error)
            return
        }
        res.json(room_details)
    })
})

// Get details of categories
app.get('/categories/:id', (req, res) => {
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

app.get('/booking/:id?', (req, res) => {
    con.query('SELECT hotel_room.id, hotel_categories.name, hotel_room.room_id FROM hotel_categories, hotel_room WHERE hotel_categories.id = hotel_room.cat_id AND STATUS = 0',
    (error, results, fields) => {
        if (error){
            console.log(error)
            return
        }else{
            con.query("SELECT hotel_categories.id, hotel_categories.max_guest, hotel_categories.child, hotel_categories.extra_bed FROM hotel_categories",
            (error, categories_details, fileds) => {
                if (error){
                    console.log(error)
                    return
                }else{
                    con.query("SELECT id, first_name, last_name, contact, address, DATE_FORMAT(checked_in, '%Y-%m-%d') AS checked_in, DATE_FORMAT(checked_out, '%Y-%m-%d') AS checked_out, rooms, adult, child, extra_bed, amount, called FROM hotel_inquiry WHERE id = ?", 
                        [req.params.id], (error, inquiry, fields) => {
                            if (error){
                                console.log(error)
                                return
                            }else{
                                inquiry = inquiry[0]
                                res.render('booking', {results, categories_details, inquiry})
                            }
                            
                        })
                    
                }
            })
            
        }
    })
    
})

// book hotel room
app.post('/booking', (req, res) => {
    let room_details = []
    
    if(typeof req.body.rooms == "object"){
        for(let i = 0; i < req.body.rooms.length; i++){
            let max_guest = "max_guest" + req.body.rooms[i]
            let child = "child" + req.body.rooms[i]
            let extra_bed = "extra_bed" + req.body.rooms[i]
            room_details.push({
               [max_guest]: req.body[max_guest],
               [child]: req.body[child],
               [extra_bed]: req.body[extra_bed]
            })
        }
    }else{
        let max_guest = "max_guest" + req.body.rooms
        let child = "child" + req.body.rooms
        let extra_bed = "extra_bed" + req.body.rooms
        room_details.push({
            [max_guest]: req.body[max_guest],
            [child]: req.body[child],
            [extra_bed]: req.body[extra_bed]
        })
    }
    
    console.log(room_details)
    
    // console.log(room_details)
    const schema = Joi.object({
        firstname: Joi.string().required(),
        lastname: Joi.string().required(),
        contact: Joi.number().required(),
        address: Joi.string().required(),
        check_in: Joi.string().required(),
        check_out: Joi.string().required(),
        rooms: Joi.required(),

    })

    const {error, value} = schema.validate(req.body, {abortEarly: false})
    // console.log(value, error)
    // con.query("SELECT book_id FROM hotel_booking ORDER BY book_id DESC LIMIT 1", (error, book_id, fields) => {
    //     let booking_id = book_id[0].book_id + 1
    //     let status = 1
    //     if(error) throw error
    //     con.query("INSERT INTO hotel_booking (book_id, room_id, checked_in, checked_out, booked_by, status, booking_amount, adult, child, extra_bed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    //     [booking_id, room_id, checked_in, checked_out, booked_by, status, booking_amount, adult, child, extra_bed], (error, results, fields) => {
    //         if (error) throw error
    //         res.status(200)
    //         res.json('Booked Successfully')
    //     })
    // })
})

app.post('/send', (req, res) => {
    if(req.body){
        console.log(req.body)
        res.status(400).json("Recieved Successfully")
    }else{
        res.json("Something went wrong")
    }
})

// starting server
const port = process.env.PORT || 3000
app.listen(port, console.log(`Server started at ${port}...`))