const express = require('express');
const router = express.Router();

const Create = require('../services/Create');
const Retrieve = require('../services/Retrieve');
const Delete = require('../services/Delete');
const Update = require('../services/Update');


// insert
router.post('/create', async ( req, res ) => {
    const { fname, lname, contact } = req.body
    const result = await Create(fname, lname, contact)

    if(result) {
        res.status(200).send({ 
            status: result,
            message: "Successfully created"
        }) 
    } else {
        res.status(500).send({
            status: result,
            message: "Error created"
        })
    }
})

// retrieve
router.get('/', async ( req, res ) => {
    const _id = "";
    const result = await Retrieve(_id);

    if(result) {
        res.status(200).send(result) 
    } else {
        res.status(500).send({
            status: result,
            message: "Error Retrive"
        })
    }
})
// getData by id 
router.get('/:id', async ( req, res ) => {
    const _id = req.params.id;
    const result = await Retrieve(_id);

    if(result) {
        res.status(200).send(result);
    } else {
        res.status(500).send({
            status: result,
            message: "Error Retrive"
        });
    }
})

// update 
router.put('/update', async ( req, res ) => {
    const obj = req.body;
    const id  = req.body._id;
    const result = await Update(id, obj)
    console.log(id);
    console.log(obj);
    // const result = true;
    if(result) {
        res.status(200).send({
            status: result,
            message: "Successfuly Updated"
        }) 
    } else {
        res.status(500).send({
            status: result,
            message: "Error Update"
        })
    }
});

//delete
router.delete('/delete/:id', async ( req, res ) => {
    const _id  = req.params.id
    const result = await Delete(_id)
    
    if(result) {
        res.status(200).send({
            status: result,
            message: "Successfuly Deleted"
        }) 
    } else {
        res.status(500).send({
            status: result,
            message: "Error Delete"
        })
    }
});


module.exports = router