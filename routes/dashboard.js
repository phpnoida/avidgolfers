const express=require('express');
const {dashboardData}=require('./../controllers/dashboard');

const router=express.Router();

router.route('/dashboard').get(dashboardData);

module.exports=router;