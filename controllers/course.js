const Hole = require('../models/hole');
const Course=require('./../models/course');

const addCourse = async(req,res)=>{
    //console.log('add golf course');
    const data = await Course.create(req.body);
    const {teesInfo}=data;
    const strokes=[];
    for(let el of teesInfo){
        const obj={
            teeId:el._id,
            colorCode:el.colorCode,
            teeName:el.teeName,
            yards:0,
            stks:0
        }
        strokes.push(obj)
    }
    //creating holes 
    for(let i=1;i<=data.totalHoles;i++){
        await Hole.create({
            courseId:`${data._id}`,
            holeNo:`${i}`,
            strokes:strokes,
            mainPhoto:''
        })
    }
    if(data){
        res.status(201).json({
            status:true,
            message:'Course Added',
            data:data
        })
    }
}

const editCourse =async(req,res)=>{
    //console.log('edit course..');
    const courseId=req.params.courseId;
    const data=await Course.findByIdAndUpdate(courseId,req.body,{new:true});
    if(data){
        res.status(200).json({
            status:true,
            message:'updated..',
            data:data
        })
    }
}

const getAll = async(req,res)=>{
    console.log('get all..');
    let data = await Course.find().select('courseName country city');
    //console.log('data',data)
    if(req.query.searchKeyword!=undefined){
        const sk=req.query.searchKeyword;
        data=await Course.find({
            courseName:new RegExp(`.*${sk}.*`,'i')
        }).select('courseName country city');
    }
    if(data){
        res.status(200).json({
            status:true,
            totalRec:data.length,
            data:data
        })
    }
}

const getOne=async(req,res)=>{
    console.log('idividiual detail..');
    const courseId=req.params.courseId;
    const data=await Course.findById(courseId).populate({
        path:'holeInfo',
        select:'holeNo holeName par -courseId mainPhoto strokes'
    });
    if(data){
        res.status(200).json({
            status:true,
            data:data

        })
    }
}

module.exports={addCourse,editCourse,getAll,getOne};