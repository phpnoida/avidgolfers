const express = require('express');
const {addCourse,editCourse,getAll,getOne} =require('./../controllers/course');
const holeRoute=require('./hole');

const router=express.Router();

//hole routing
router.use('/course/:courseId/hole',holeRoute);

router.route('/course').post(addCourse);
router.route('/course/:courseId').patch(editCourse);
router.route('/courses').get(getAll);
router.route('/course/:courseId').get(getOne);



module.exports=router;