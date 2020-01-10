const router = require('express').Router()
const con = require('../config/db')
const verify = require('./verify_route')


//get new enquires
router.get('/new_inquiry', verify, (req, res) => {
    con.query("SELECT id, first_name, last_name, address, DATE_FORMAT(checked_in, '%Y-%m-%d') AS checked_in, DATE_FORMAT(checked_out, '%Y-%m-%d') AS checked_out, rooms, adult, child, extra_bed, amount, called, DATE_FORMAT(date, '%Y-%m-%d') AS date FROM hotel_inquiry WHERE called = 0 ORDER BY DATE ASC",
    (error, results, fields) => {
        res.render('inquiry', {results})
    })
})

router.get('/inquiry/:id', verify, (req, res) => {
    con.query("SELECT * FROM hotel_inquiry WHERE id = ?", 
    [req.params.id], (error, results, fields) => {
        if (error){
            throw error
        }else{
            res.render('update_inquiry', {results})
        }
    })
})

router.post('/inquiry', verify, (req, res) => {
    con.query("UPDATE hotel_inquiry SET called = ? WHERE id = ?",
    [req.body.called, req.body.id], (error, results, fields) => {
        if(error){
            throw error
        }else{
            res.redirect('/admin/old_inquiry')
        }
    })
})

//get old enquires
router.get('/old_inquiry', verify, (req, res) => {
    con.query("SELECT id, first_name, last_name, address, DATE_FORMAT(checked_in, '%Y-%m-%d') AS checked_in, DATE_FORMAT(checked_out, '%Y-%m-%d') AS checked_out, rooms, adult, child, extra_bed, amount, called, DATE_FORMAT(date, '%Y-%m-%d') AS date FROM hotel_inquiry WHERE called = 1 ORDER BY DATE ASC",
    (error, results, fields) => {
        res.render('inquiry', {results})
    })
})

// copy from inquiry to booking
router.get('/copy/:id', verify, (req, res) => {
    con.query("SELECT * FROM hotel_inquiry WHERE id = ?", 
    [req.params.id], (error, results, fields) => {
        res.render('booking', {results})
    })
})


module.exports = router