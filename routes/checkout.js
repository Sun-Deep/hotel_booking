const router = require('express').Router()
const Joi = require('@hapi/joi');
const con = require('../config/db')
const verify = require('./verify_route')


router.get('/checkout', verify, (req, res) => {
    con.query("SELECT book_id, booked_by FROM hotel_booking WHERE status = 1", (error, results, fields) => {
        res.render('checkout', {results})
    })
    
})

router.get('/bill/:book_id', verify,  (req, res) => {
    let final_bill = []
    let final_amount = 0
    con.query("SELECT DATE_FORMAT(hotel_booking.checked_in, '%Y-%m-%d') AS checked_in, DATE_FORMAT(hotel_booking.checked_out, '%Y-%m-%d') AS checked_out, hotel_room.room_id, hotel_categories.name, hotel_cat_rate.rate, hotel_cat_rate.extra_bed as extra_bed_rate, hotel_booking.booked_by, hotel_cat_rate.extra_guest, hotel_booking.adult, hotel_booking.extra_bed FROM hotel_booking JOIN hotel_room ON hotel_room.room_id = hotel_booking.room_id AND hotel_booking.book_id = ? JOIN hotel_cat_rate ON hotel_room.cat_id = hotel_cat_rate.cat_id JOIN hotel_categories ON hotel_cat_rate.cat_id = hotel_categories.id",
    [req.params.book_id], (error, results, fields) => {
        final_bill.push(
            {person_info: [results[0].booked_by, results[0].checked_in, results[0].checked_out]}
        )
        for(let i = 0; i < Object.keys(results).length; i++){
            let temp_amount = results[i].rate + results[i].extra_guest * Math.abs(results[i].adult - 1) + results[i].extra_bed * results[i].extra_bed_rate
            final_amount += temp_amount
            final_bill.push({
                room_id: results[i].room_id,
                room_cat: results[i].name,
                amount: results[i].rate,
                extra_bed_rate: results[i].extra_bed_rate,
                extra_guest: results[i].extra_guest,
                adult: results[i].adult,
                extra_bed: results[i].extra_bed,
                total_amount: temp_amount,
            })
        }
        final_amount = final_amount + final_amount * req.app.locals.tax / 100
        final_bill.push({
            final_amount: final_amount 
        })
        res.json(final_bill)
    })
    
})

module.exports = router