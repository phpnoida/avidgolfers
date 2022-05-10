const User=require('./../models/user');

const getAll = async(req,res)=>{
    console.log('from all users..');
    const user=await User.find().select('firstName lastName');
    res.status(200).json({
        status:'ok',
        data:user
    })
}

module.exports=getAll;