const User=require('./../models/user');
const moment=require('moment');

const dashboardData = async(req,res)=>{
    console.log('from dashboard..');
    const data={};
    const user=await User.find();
    data.totalUser=user.length;
    console.log(moment().unix()-30*86400)
    const activeOneMonth = await User.find({
        lastseen:{$gte:moment().unix()-30*86400}
    });
    data.activeoneMonth=activeOneMonth.length;
    const activeThreeMonth=await User.find({
        lastseen:{$gte:moment().unix()-90*86400}
    })
    data.activeThreeMonth=activeThreeMonth.length;
    res.status(200).json({
        status:true,
        data
    })
}

module.exports={dashboardData};