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

//verify route middleware
const verify = require('./routes/verify_route')

//import routes
const authRoute = require('./routes/auth')
app.use('/admin/', authRoute)

const roomsRoute = require('./routes/rooms')
app.use('/admin/', roomsRoute)

const hotelCatRoute = require('./routes/hotel_categories')
app.use('/admin/', hotelCatRoute)

const inquiryRoute = require('./routes/inquiry')
app.use('/admin/', inquiryRoute)

const bookingRoute = require('./routes/booking')
app.use('/admin/', bookingRoute)

const checkoutRoute = require('./routes/checkout')
app.use('/admin/', checkoutRoute)



app.get('/admin', verify, (req, res) => {
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


// starting server
const port = process.env.PORT || 3000
app.listen(port, console.log(`Server started at ${port}...`))