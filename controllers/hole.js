const Course = require('../models/course');
const Hole=require('./../models/hole');

const getOne=async(req,res)=>{
    console.log('individual hole..');
    const courseId=req.params.courseId;
    const holeId=req.params.holeId;
    let data = await Hole.findOne({
        _id:holeId,
        courseId:courseId
    }).select('-strokes._id');
    if(data){
        res.status(200).json({
            status:true,
            data:data
        })
    }
}

const editHole =async(req,res)=>{
    console.log('edit hole');
    const courseId=req.params.courseId;
    const holeId=req.params.holeId;
    const data = await Hole.findOneAndUpdate({
        _id:holeId,
        courseId:courseId
    },req.body,{new:true});
    if(data){
        res.status(200).json({
            status:true,
            message:'updated',
            data:data
        })
    }
}

module.exports={getOne,editHole};