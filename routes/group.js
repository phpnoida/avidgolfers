const express=require('express');
const getAll=require('./../controllers/group');

const handicapRoute=require('./handicap');

const router=express.Router();
//nesting routes
router.use('/groups/:groupId/handicap',handicapRoute);

router.route('/groups').get(getAll);

module.exports=router;