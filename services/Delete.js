const Users = require('../models/Users');

module.exports = async (_id) => {
    try{
        await Users.deleteOne({ _id })
        return true
    }catch (err){
        console.log(err)
        return false
    }
}