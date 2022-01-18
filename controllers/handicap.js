const mongoose = require('mongoose');
const Handicap=require('./../models/handicap');
const User = require('../models/user');
const _=require('lodash');


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

    },{"players.$":1}).lean().select('roundsDate loggedBy settings')
    .populate({
        path:'players.id',
        select:'firstName lastName petName'
    }).sort({roundsDate:-1});

    //concept to put * on lowest scores
    let playersMinScoreLists=[];
    const {settings}=await Handicap.findOne({
        groupId:groupId

    })
    if(settings.handicapCal==1){
        //console.log('inside settings.handicapCal==1')
        const newData=data.slice(0,12);
        //console.log(newData);
        for(let el of newData){
        const {players,settings}=el;
        //console.log(players[0].score,settings);
        playersMinScoreLists.push(players[0].score);
        
       }

    }
    else if(settings.handicapCal==2){
        //console.log('inside settings.handicapCal==2')
        const newData=data.slice(0,20);
        //console.log(newData);
        for(let el of newData){
            const {players,settings}=el;
            //console.log(players[0].score,settings);
            playersMinScoreLists.push(players[0].score);
        
       }

    }
    //console.log(playersMinScoreLists);
    const sortScoreArr=_.sortBy(playersMinScoreLists);
    const lowestSixScores=sortScoreArr.slice(0,6);
    const lowestEightScores=sortScoreArr.slice(0,8);
    //console.log(lowestSixScores);
    //console.log(lowestEightScores);
    
    let data1=[];
    const firstTwelveRounds=data.slice(0,12);
    const firstTwentyRounds=data.slice(0,20);
    const firstTwelveRoundsId=[];
    const firstTwentyRoundsId=[];
    for(let el of firstTwelveRounds){
        firstTwelveRoundsId.push(el._id)
    }
    for(let el of firstTwentyRounds){
        firstTwentyRoundsId.push(el._id)
    }
    for(let el of data){
        const {settings}=el;
        //console.log(el._id);
        //console.log(firstTwelveRoundsId)
        if(settings.handicapCal==1){
            //console.log('inside settings.handicapCal==1');
            if(firstTwelveRoundsId.includes(el._id)){
                //console.log('amit')
                if(lowestSixScores.includes(el.players[0].score)){
                    //console.log('bunny');
                    el.players[0].score=el.players[0].score+"*";

                }
                data1.push(el)
                
            }else{
                //console.log('adhita')
                data1.push(el)
            }

        }
        else if(settings.handicapCal==2){
            //console.log('inside settings.handicapCal==2');
            if(firstTwentyRoundsId.includes(el._id)){
                //console.log('amit')
                if(lowestEightScores.includes(el.players[0].score)){
                    //console.log('bunny');
                    el.players[0].score=el.players[0].score+"*";

                }
                data1.push(el);
                
            }else{
                //console.log('adhita')
                data1.push(el)
            }

        }

        
    }//end for and end logic for * on indi rounds score

    /*
     handicapScore will be calulated only when
     player has played atleast 6 rounds
     else handicapScore will be N/A
    */
    let handicapFinalScore;
    if(data.length>=6){
    /*
     Formula is :
     last 12 rounds
     top 6 scores divided by 6
    */
    const handicapScore = await Handicap.handicapScore(groupId,memberId);
    handicapFinalScore=handicapScore.handScre;
     }else{
        handicapFinalScore='N/A';
       }
    
    //calulating totalMoney earned
    const totalMerit = await Handicap.totalMerit(groupId,memberId);
    //console.log('handicapscore',handicapScore)
    res.status(200).json({
        data:data1,
        handicap:handicapFinalScore,
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
           obj.memberFullName=`${userInfo.firstName} ${userInfo.lastName}`;
        }else{
           obj.memberFullName=`${userInfo.firstName} ${userInfo.lastName}`; 
        }
        obj.playerId=el._id;
        //calulating individual total money
        const totalMerit = await Handicap.totalMerit(groupId,el._id);
        obj.merit=totalMerit;
        const totalMatchesPlayed =await Handicap.totalMatchesPlayed(groupId,el._id);
        let handicapFinalScore;
        let strokeFinal;
        if(totalMatchesPlayed>=6){
        //calulating individual handicapscore
        const handicapScore = await Handicap.handicapScore(groupId,el._id);
        handicapFinalScore=handicapScore.handScre;
        strokeFinal=handicapScore.stroke;
        }else{
            handicapFinalScore='N/A';
            strokeFinal='N/A'
        }
        
        obj.handicapScore=handicapFinalScore;
        obj.stroke=strokeFinal;
        finalList.push(obj);
    }
    
    if(req.query.searchKeyword){
        console.log(req.query.searchKeyword);
        const sk=req.query.searchKeyword;
        let expr = new RegExp(`.*${sk}.*`, "i");

        const searchResult=finalList.filter((el)=>{
            return expr.test(el.memberFullName)
        })
        return res.status(200).json({
        status:true,
        totalRecords:searchResult.length,
        data:searchResult
    })
    }
    
    //client needs stroke of each player to be subtracted from min stroke
    const stokesOfAllPlayers=[];
    for(let player of finalList){
        if(player.stroke!='N/A'){
            stokesOfAllPlayers.push(player.stroke)
        }
    }
    const mimStrokeValue=Math.min(...stokesOfAllPlayers);
    const finalList1=[];
    for(let el of finalList){
        if(el.stroke!='N/A'){
            el.stroke=(el.stroke-mimStrokeValue).toFixed(2)
        }
        finalList1.push(el)
    }
    
    


    res.status(200).json({
        status:'ok',
        totalRecords:finalList.length,
        data:finalList1
    })
    
    
};

const getSettings =async(req,res)=>{
    //console.log('get settings..');
    const groupId=req.params.groupId;
    const settings=await Handicap.findOne({
        groupId:groupId
    }).select('settings -_id');
    res.status(200).json({
        status:true,
        data:settings
    })
}

const updateSettings =async(req,res)=>{
    console.log('update settings..');
    const groupId=req.params.groupId;
    const data = await Handicap.updateMany({
        groupId:groupId
    },{
        $set:{
            "settings":req.body.settings
        }
    })
    res.status(200).json({
        status:true,
        message:'updated..'
    })

}

module.exports={
    createHandicap,
    getAll,
    individualRoundDetails,
    updateIndividualRoundDetails,
    getSettings,
    updateSettings
};