const router = require('express').Router()
const Joi = require('@hapi/joi');
const con = require('../config/db')
const verify = require('./verify_route')


//check available rooms
router.post('/check', verify, (req, res) => {

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




router.get('/booking/:id?', verify, (req, res) => {
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
router.post('/booking', verify, async (req, res) => {
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
    console.log(value)
    con.query("SELECT book_id FROM hotel_booking ORDER BY book_id DESC LIMIT 1", (error, book_id, fields) => {
        let booking_id = book_id[0].book_id + 1
        let status = 1
        let room_count = 0
        let booked_by = value.firstname + ' ' + value.lastname
        if (typeof value.rooms == "string"){
            room_count = 1
            con.query("INSERT INTO hotel_booking (book_id, room_id, checked_in, checked_out, booked_by, status, adult, child, extra_bed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [booking_id, value.rooms, value.check_in, value.check_out, booked_by, status, room_details[0]['max_guest' + value.rooms], room_details[0]['child' + value.rooms], room_details[0]['extra_bed' + value.rooms]], (error, results, fields) => {
                if (error) throw error
                con.query("UPDATE hotel_room SET status = ? WHERE room_id = ?", [status, value.rooms], (error, results, fields) => {
                    res.status(200)
                    res.json('Booked Successfully')
                }) 
                res.json('Booked Successfully')
            })
        }else{
            room_count = value.rooms.length
            for (let j = 0; j < room_count; j++){
                con.query("INSERT INTO hotel_booking (book_id, room_id, checked_in, checked_out, booked_by, status, adult, child, extra_bed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [booking_id, value.rooms[j], value.check_in, value.check_out, booked_by, status, room_details[j]['max_guest' + value.rooms[j]], room_details[j]['child' + value.rooms[j]], room_details[j]['extra_bed' + value.rooms[j]]], (error, results, fields) => {
                        if (error) throw error
                        con.query("UPDATE hotel_room SET status = ? WHERE room_id = ?", [status, value.rooms[j]], (error, results, fields) => {
                            if (error) throw error;
                        }) 
                }) 
            }
            res.json('Booked Successfully')
        }
    })
})


router.get('/booked', (req, res) => {
    con.query("SELECT id, name FROM hotel_categories ORDER BY id ASC", (error, categories, fields) => {
        con.query("SELECT cat_id, room_id, status FROM hotel_room", (error, results, fields) => {
            console.log(results)
            res.render('view_booked_rooms', {categories, results})
        })
    })
    
})
module.exports = router