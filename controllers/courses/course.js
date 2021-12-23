const Course=require('./../../models/course');
const Hole=require('./../../models/hole');
const Yardage=require('./../../models/yardage');

const createCourse =async(req,res)=>{
    console.log('new course details...');
    const data =await Course.create(req.body);
    let holeData=[];
    for(let i=1;i<=data.totalHoles;i++){
        holeData.push({
            holeNo:`Hole ${i}`,
            par:'',
            name:''
        })
    }
    await Hole.create({
        courseId:data._id,
        holes:holeData
    })
    if(data){
        res.status(201).json({
            status:'ok',
            message:'Course Details Added..',
            data:data
        })
    }
}

const editCourse = async(req,res)=>{
    console.log('edit course details..');
    const courseId=req.params.courseId;
    //console.log('courseId',courseId);
    const data =await Course.findByIdAndUpdate(courseId,req.body,{
        new:true
    });
    if(data){
        res.status(200).json({
            status:'ok',
            message:'updated sucessfully',
            data:data
        })
    }
}

const getAllCourse =async(req,res)=>{
    console.log('all courses lists..');
    const data=await Course.find({}).select('name country city');
    if(data){
        res.status(200).json({
            status:'ok',
            totalCourses:data.length,
            data:data
        })
    }
}

const getParticularCourse=async(req,res)=>{
    console.log('particular course details...');
    const courseId=req.params.courseId;
    const data=await Course.findById(courseId).populate({
        path:'holeInfo',
        select:'holes.holeNo holes.name holes.par holes._id -_id -courseId'
        
    }).populate({
        path:'yardageInfo'
    });
    if(data){
        res.status(200).json({
            status:'ok',
            data:data
        })
    }
}

module.exports={
    createCourse,
    editCourse,
    getAllCourse,
    getParticularCourse
};