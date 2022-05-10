const express=require('express');
const getAll=require('./../controllers/user');

const router=express.Router();

router.route('/users').get(getAll);

module.exports=router;