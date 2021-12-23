const Yardage=require('./../../models/yardage');

const addEditYardage=async(req,res)=>{
    console.log('add or edit yardage..');
    const courseId=req.params.courseId;
    const yardage =await Yardage.findOne({
        courseId:courseId
    });
    req.body.courseId=courseId;
    let data;
    if(yardage){
        //will update records
        data=await Yardage.findOneAndUpdate({
            courseId:courseId
        },req.body,{new:true});

    }else{
        //will add new records
        data=await Yardage.create(req.body);
    }
    res.status(200).json({
        status:'ok',
        message:'yardage data updated'
    })
}

module.exports={addEditYardage};