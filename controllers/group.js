const Group=require('./../models/group');

const getAll=async(req,res)=>{
    console.log('from all group..');
    const data=await Group.find().select('name description users');
    res.status(200).json({
        status:'ok',
        data:data
    })
}

module.exports=getAll;