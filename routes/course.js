const express = require('express');
const course=require('./../controllers/courses/course');
const hole=require('./../controllers/courses/hole');
const yardage=require('./../controllers/courses/yardage');

const router=express.Router();

//course routes
router.route('/course').post(course.createCourse);
router.route('/courses').get(course.getAllCourse);
router.route('/course/:courseId').patch(course.editCourse);
router.route('/course/:courseId/courseInfo').get(course.getParticularCourse);

//holes routes
router.route('/course/:courseId/:holeId').get(hole.getParticularHole);
router.route('/course/:courseId/:holeId').patch(hole.editHoleDetails);

//yardage routes
router.route('/course/:courseId/yardage').post(yardage.addEditYardage);

module.exports=router;