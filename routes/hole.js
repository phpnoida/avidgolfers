const express=require('express');
const {addHole,getOne,editHole}=require('./../controllers/hole');

const router=express.Router({mergeParams:true});

router.route('/').post(addHole);
router.route('/:holeId').get(getOne);
router.route('/:holeId').patch(editHole);

module.exports=router;