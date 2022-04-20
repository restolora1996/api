const Users = require('../models/Users');

module.exports = async (_id, obj) => {
    try{
        const results = await Users.update(
            { _id },
            { $set: obj }
        )
        return true
    }catch (err){
        console.log(err)
        return false
    }
}