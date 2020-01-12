const router = require('express').Router()
const Joi = require('@hapi/joi');
const con = require('../config/db')
const verify = require('./verify_route')


router.get('/checkout', (req, res) => {
    con.query("SELECT book_id, booked_by FROM hotel_booking WHERE status = 1", (error, results, fields) => {
        res.render('checkout', {results})
    })
    
})

router.get('/bill/:book_id',  (req, res) => {
    let final_bill = []
    con.query("SELECT DATE_FORMAT(hotel_booking.checked_in, '%Y-%m-%d') AS checked_in, DATE_FORMAT(hotel_booking.checked_out, '%Y-%m-%d') AS checked_out, hotel_room.room_id, hotel_categories.name, hotel_cat_rate.rate, hotel_cat_rate.extra_bed, hotel_booking.booked_by, hotel_cat_rate.extra_guest FROM hotel_booking JOIN hotel_room ON hotel_room.room_id = hotel_booking.room_id AND hotel_booking.book_id = ? JOIN hotel_cat_rate ON hotel_room.cat_id = hotel_cat_rate.cat_id JOIN hotel_categories ON hotel_cat_rate.cat_id = hotel_categories.id",
    [req.params.book_id], (error, results, fields) => {
        console.log(results)
        res.json(results)
    })
    
})

module.exports = router