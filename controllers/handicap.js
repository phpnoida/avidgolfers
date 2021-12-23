const mongoose = require('mongoose');
const Handicap=require('./../models/handicap');
const User = require('../models/user');

/*
Purpose:save followings into db:
date ,
players id,score and money
loggedBy
*/
const createHandicap = async(req,res)=>{
    console.log('adding players,scores,money..');
    req.body.groupId=req.params.groupId;
    req.body.roundsDate=new Date(req.body.roundsDate);
    const data = await Handicap.create(req.body);
    res.status(201).json({
        status:'success',
        message:'You have successfully submitted to your Groups Handicap System.',
        data:data
    })
}


/*
get records of individual users
like rounds date , score , money ,loggedBy
*/

const individualRoundDetails =async(req,res)=>{
    console.log('individual rounds records..');
    const groupId = req.params.groupId;
    const memberId = req.params.memberId;
    //getting roundsDate,score,money
     const data =await Handicap.find({
         groupId:groupId,
        players:{$elemMatch:{id:mongoose.Types.ObjectId(memberId)}}

    },{"players.$":1}).select('roundsDate loggedBy')
    .populate({
        path:'players.id',
        select:'firstName lastName petName'
    }).sort({roundsDate:-1})

    //calulating totalMoney earned
    const totalMerit = await Handicap.totalMerit(groupId,memberId);
    
    /*
     Formula is :
     last 12 rounds
     top 6 scores divided by 6
    */
    const handicapScore = await Handicap.handicapScore(groupId,memberId)
    //console.log('handicapscore',handicapScore)
    res.status(200).json({
        data:data,
        handicap:handicapScore,
        orderOfMerit:totalMerit
    })


}

/*
Edit individual player records

*/
const updateIndividualRoundDetails =async(req,res)=>{
    console.log('update individual records..');
    const groupId=req.params.groupId;
    const handicapId=req.params.handicapId;
    const playerId=req.params.playerId;
    const data = await Handicap.findOneAndUpdate({
        _id:handicapId,
        groupId:groupId,
        players:{$elemMatch:{_id:playerId}}
    },{
        $set:{
           roundsDate:req.body.roundsDate,
           loggedBy:req.body.loggedBy,
           "players.$":{
               score:req.body.players.score,
               money:req.body.players.money,
               id:req.body.players.userId
           }
        }
    },{new:true})
    if(data){
        res.status(200).json({
            status:'ok',
            message:'updated successfully',
            data:data
        })
    }
}

const getAll = async(req,res)=>{
    console.log('all handicaps records..');
    const groupId = req.params.groupId;
    //array which will be returned in response
    let finalList=[];
    //step1:get all players list who played
    const playersList=await Handicap.aggregate([
        {$match:{
            groupId:mongoose.Types.ObjectId(groupId),
               }
        },
        {$unwind:"$players"},
        {$group:{_id:"$players.id"}}
        
    ]);
    //return console.log('playersList',playersList);
    /*
    step2:looping over all players
    to calulate individual fullName,totalMerit and handicapScore
    */
    for(let el of playersList){
        //return console.log('from loop',el);
        let obj={};
        const userInfo =await User.findById(el._id).select('firstName lastName petName');
        //return console.log(userInfo);
        if(userInfo.petName.length>1){
           obj.memberFullName=`${userInfo.firstName} ${userInfo.lastName}(${userInfo.petName})`;
        }else{
           obj.memberFullName=`${userInfo.firstName} ${userInfo.lastName}`; 
        }
        obj.playerId=el._id;
        //calulating individual total money
        const totalMerit = await Handicap.totalMerit(groupId,el._id);
        obj.merit=totalMerit;
        //calulating individual handicapscore
        const handicapScore = await Handicap.handicapScore(groupId,el._id);
        const stroke=(handicapScore*.75).toFixed(1);
        obj.handicapScore=handicapScore;
        obj.stroke=stroke;
        finalList.push(obj);
    }
    res.status(200).json({
        status:'ok',
        totalRecords:finalList.length,
        data:finalList
    })
    
    
}

module.exports={
    createHandicap,
    getAll,
    individualRoundDetails,
    updateIndividualRoundDetails
};