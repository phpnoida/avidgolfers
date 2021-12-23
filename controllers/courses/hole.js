const Course=require('./../../models/course');
const Hole=require('./../../models/hole');

const getParticularHole=async(req,res)=>{
    console.log('from individual hole..');
    const courseId=req.params.courseId;
    const holeId=req.params.holeId;
    const data = await Hole.findOne({
        courseId:courseId,
        holes:{$elemMatch:{_id:holeId}}
    },{"holes.$":1}).select('-_id')
    if(data){
        res.status(200).json({
            status:'ok',
            data:data
        })
    }

}

const editHoleDetails =async(req,res)=>{
    console.log('editing particular hole..');
    const courseId=req.params.courseId;
    const holeId=req.params.holeId;
    const data= await Hole.findOneAndUpdate({
        courseId:courseId,
        holes:{$elemMatch:{_id:holeId}}
    },{
        $set:{
            "holes.$":req.body.holes
        }
    },{new:true});
    if(data){
        res.status(200).json({
            status:'ok',
            message:'hole info updated',
            data:data
        })
    }
}




module.exports={getParticularHole,editHoleDetails};