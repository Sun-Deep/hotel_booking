const jwt = require('jsonwebtoken')


module.exports = function(req, res, next){
    const token = req.cookies.auth_token
    if(!token){
        return res.status(401).send('Access Denied');
    }

    try{
        const verified = jwt.verify(token, process.env.TOKEN_SECRET)
        req.user_id = verified
        next()
    }catch (err){
        res.status(401).send('Invalid Token')
    }
}