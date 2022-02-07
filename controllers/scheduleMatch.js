const scheduleMatch = require('./../models/scheduleMatch');
const Hole = require('../models/hole');
const moment=require('moment');
const {sendNotification}=require('./../common/sendPushnotification');

const addMatch = async(req,res)=>{
    console.log('add newMatch..');

    //adding 6hrs of expiry
    req.body.matchExpiry=(req.body.matchDate)*1+21600;
    console.log('matchExpiry',req.body.matchExpiry)
    const data=await scheduleMatch.create(req.body);
    const message=`Congratulations!

    You have
    scuccessfully
    scheduled a match!`;
    //populating data
    const finaldata = await data.populate({
        path:'players.playerId',
        select:'firstName lastName petName profileImg'
    }).populate({
        path:'courseId',
        select:'courseName'
    }).execPopulate();
    //sending courseName,date,time,player's lists
    let resData={};
    //destructuring
    const {courseId,matchDate,players}=finaldata;
    const {courseName}=courseId;
    resData.courseName=courseName;
    players.forEach(function(v,i){
        resData['player'+`${i+1}`]=`${v.playerId.firstName} ${v.playerId.lastName}`
    })
    resData.matchDate=matchDate;
    //resData.matchTime=moment.unix(matchDate).format("hh:mm A");
    //console.log('resData',resData);
    /*
    ToDo:Send pushNotifications
    */
   const d=moment.unix(matchDate).format("Do MMM");
   const t=moment.unix(matchDate).format("hh:mm A");
   const title='The Avid Golfer';
   const createdByName=players.find((el)=>{
       return el.playerId._id.toString()===req.body.createdBy.toString();
   })
   const body=`A new Golf Game has been Scheduled for you by ${createdByName.playerId.firstName}, on the ${d} at ${t}.`
   for(let el of players){
       
       await sendNotification(el.playerId._id,title,body,1);

   }
    if(data){
        res.status(201).json({
            status:true,
            message,
            data:resData
        })
    }
}

const getMyUpcomingMatches=async(req,res)=>{
    console.log('my upcoming matches..');
    const loggedInUserId=req.params.userId;
    //show only those matches which has not been started yet
    const custom_query=scheduleMatch.find({
        matchExpiry:{$gte:moment().unix()},
        matchStatus:1,
        players:{$elemMatch:{playerId:loggedInUserId}}
    }).sort({matchDate:1}).select('-__v -createdBy -groupOptions -matchStatus')
    //pagination concept
    const page=req.query.page*1||1;
    const limit=req.query.limit*1||10;
    const skip=(page-1)*limit;
    const myUpcoming=await custom_query.populate({
        path:'players.playerId',
        select:'firstName lastName profileImg'
    }).populate({
        path:'courseId',
        select:'courseName'
    })
    .skip(skip).limit(limit);
    //send to frontend only desired outputs
    const resData=[];
    for(let el of myUpcoming){
        const obj={players:[]};
        const {_id,players,courseId,matchDate}=el;
        const {courseName}=courseId;
        for(let player of players){
            const {playerId}=player;
            const {firstName,lastName,profileImg}=playerId;
            obj.players.push({
                playerName:`${firstName} ${lastName}`,
                profileImg:profileImg,
                initials:`${firstName[0].toUpperCase()}${lastName[0].toUpperCase()}`
            })
        }
        obj.matchId=_id;
        obj.courseName=courseName;
        obj.matchDate=matchDate;
        //obj.matchTime=moment.unix(matchDate).format("hh:mm A");
        resData.push(obj)
    }
    
    //console.log('resData',resData)
    if(myUpcoming){
        res.status(200).json({
            status:true,
            totalRec:myUpcoming.length,
            data:resData
        })
    }

}

//get particular/one matchDetails
const getMatchData=async(req,res)=>{
    console.log('particular match details..');
    const matchId=req.params.matchId;
    const data=await scheduleMatch.findById(matchId).lean()
    .populate({
        path:'groupOptions'

    }).populate({
        path:'players.playerId',
        select:'firstName lastName profileImg'
    }).populate({
        path:'courseId'
    
    });
    data['date']=moment.unix(data.matchDate).format("DD/MM/YYYY");
    data['time']=moment.unix(data.matchDate).format("hh:mm A");
    //Adding holeInfo as it is not populated from course
    const holeData=await Hole.find({
        courseId:data.courseId._id
    }).select('holeNo');
    data.courseId.holeInfo=holeData;

    if(data){
        res.status(200).json({
            status:true,
            data:data

        })
    }

}

const editUpcomingMatch =async(req,res)=>{
    console.log('update particular match..');
    const matchId=req.params.matchId;
    const data=await scheduleMatch.findByIdAndUpdate(matchId,req.body,{new:true});
    const matchExpiry=(data.matchDate)+21600;
    await scheduleMatch.findByIdAndUpdate(matchId,{
        $set:{
            "matchExpiry":matchExpiry
        }
    });
    if(data){
        /*
        ToDo:send pushNoti about updated details
        */
        const d=moment.unix(data.matchDate).format("Do MMM");
        const t=moment.unix(data.matchDate).format("hh:mm A");
        const title='The Avid Golfer';
        const body=`Golf Game has been re-scheduled to the ${d} at ${t}.`;
        for(let el of data.players){
            
            await sendNotification(el.playerId._id,title,body,1);

        }
        res.status(200).json({
           status:true,
           message:'Match updated'
        })
    }
}

//delete scheduledMatch
const deleteScheduledMatch=async(req,res,next)=>{
    console.log('delete scheduledMatch..');
    const scheduledMatchId=req.params.matchId;
    console.log('scheduledMatchId-->',scheduledMatchId);
    const data=await scheduleMatch.findByIdAndDelete(scheduledMatchId);
    if(data==null){
        return res.status(400).json({
            status:false,
            message:'invalid matchId'
        })
    }
    res.status(200).json({
        status:true,
        message:'Deleted Successfully'
    })
}



module.exports={addMatch,
    getMyUpcomingMatches,
    getMatchData,
    editUpcomingMatch,
    deleteScheduledMatch
}