const Users = require('../models/Users');

module.exports = async (_id) => {
    try{
        if( _id === ""){
            const results = await Users.find();
            return results
        }else{
            const results = await Users.find({ _id });
            return results
        }
        
    }catch (err){
        console.log(err)
        return []
    }
}