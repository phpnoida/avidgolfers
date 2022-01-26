const ongoingMatch=require('./../models/ongoingMatch');
const Hole=require('./../models/hole');
const Course=require('./../models/course');
const scheduleMatch=require('./../models/scheduleMatch');
const matchFormat=require('./../models/matchFormat');

const startMatch=async(req,res)=>{
    //console.log('startMatch..');
    
    //getting data from frontend
    const {
        scheduledMatchId,
        courseId,
        players,
        matchStartedFromHoleId,
        scoringFormat,
        scoringDetails,
        editingRights

    } =req.body;

    //1.get totalNo Holes
    const {totalHoles}=await Course.findById(courseId).select('totalHoles');
    const {holeNo}=await Hole.findOne({
        courseId:courseId,
        _id:matchStartedFromHoleId
    });
    let matchStartedFromHoleNo=holeNo;
    const totalHolesPlaying=totalHoles;
    /*
    making sequnce in order hole is played
    ex1:[1,2,3,..,18]
    ex2:[3,4,5,..,18]

    */
    let holeNoSeq=[];
    for(let i=1;i<=totalHolesPlaying;i++){
        holeNoSeq.push(matchStartedFromHoleNo)
        matchStartedFromHoleNo++
        if(matchStartedFromHoleNo>totalHolesPlaying){
        matchStartedFromHoleNo=1;
        }
    }
    

    //final cal
    let matchRounds=[];
    let insertObj={
        scheduledMatchId:scheduledMatchId,
        courseId:courseId,
        matchStartedFromHoleId:matchStartedFromHoleId,
        scoringFormat:scoringFormat,
        scoringDetails:scoringDetails,
        editingRights:editingRights,
        


    };
    for(let holeSeq of holeNoSeq){
        insertObj.holeNo=holeSeq;
        //getting holeId
        const {_id,par}=await Hole.findOne({
            "courseId":courseId,
            "holeNo":holeSeq,

        });
        insertObj.holeId=_id;
        insertObj.par=par;
        const finalPlayer=[];
        for(let player of players){
            const playerObj={};
            //console.log('holeNo',holeSeq,'player No',player.playerSeqId)
            const {par,strokes}=await Hole.findOne({
                "courseId":courseId,
                "holeNo":holeSeq,
                "strokes":{$elemMatch:{"teeId":player.teePlayingFromId}}

            },{"strokes.$":1}).select('par');
            //destructuring strokesArray
            const [stroke]=strokes;
            //finally destrcuturing stroke object
            const {teeName,stks,colorCode,yards}=stroke;
            //deciding finalStroke
            let finalStokeValue=0;
            if(player.matchStroke<=18){
                if(stks<=player.matchStroke){
                    finalStokeValue=-1;
                }
            }else{
                let extra=player.matchStroke-18;
                if(stks<=extra){
                    finalStokeValue=-2;
                }else{
                    finalStokeValue=-1;
                }
            }
            playerObj.playerId=player.playerId;
            playerObj.playerSeqId=player.playerSeqId;
            playerObj.teePlayingFromId=player.teePlayingFromId;
            playerObj.teeName=teeName;
            playerObj.teeColorCode=colorCode;
            playerObj.yards=yards;
            playerObj.matchStroke=player.matchStroke;
            playerObj.holeStroke=stks;
            playerObj.finalStroke=finalStokeValue;
            playerObj.downIn=par;
            const net=Number(par)+Number(finalStokeValue);
            playerObj.net=net;
            finalPlayer.push(playerObj);
            
        }//end for playersLoop
    insertObj['players']=finalPlayer;
    await ongoingMatch.create(insertObj)
    }//end of outer loop running 18 times
    //changing matchStatus to started in scheduleMatch table
    const data=await scheduleMatch.findByIdAndUpdate(scheduledMatchId,{
        $set:{
            matchStatus:2
        }
    },{new:true});

    const roundId=await ongoingMatch.find({
        holeResult:0,
        scheduledMatchId:scheduledMatchId
    }).limit(1).select('_id')

    if(data){
        res.status(200).json({
        status:true,
        roundId:roundId[0]._id,
        message:'Match started Successfully'
         })

    }
    
}

/*
helper method for 
getting particular roundDetails
on basis of roundId

*/
const roundDetails =async(roundId)=>{
    //console.log('particular roundDetail');
    const resData={};
    const data=await ongoingMatch.findById(roundId)
               .select('scheduledMatchId holeNo holeResult courseId holeId players editingRights matchArr backNineArr scoringFormat scoringDetails')
    //populating data
    const data1=await data.populate({
        path:'scheduledMatchId',
        select:'groupOptions'

    }).populate({
        path:'courseId',
        select:'courseName'
    }).populate({
        path:'holeId',
        select:'par holeMap strokes'

    }).populate({
        path:'players.playerId',
        select:'firstName lastName profileImg'

    }).execPopulate();


    //getting groupOptions
    const matchFormatId=data1.scheduledMatchId.groupOptions;
    const groupOptions=await matchFormat.findById(matchFormatId);
    const {seqId,name}=groupOptions;
    //assigning groupOptions in resData
    resData.groupOptions={seqId,name};
    
    const {_id,holeResult,holeNo,holeId,players,courseId,editingRights}=data1;
    const {par,holeMap,strokes}=holeId;
    const {courseName}=courseId;
    //getting editor details
    const editor=players.find((player)=>{
        return player.playerId._id.toString()==editingRights.toString();
    })
    const {yards,holeStroke}=editor;

    /*
    player's name
    whom stroke is given on this roundId
    */
   let strokeplayersName=[];
   const strokeGivenTo=players.filter((player)=>{
       return player.finalStroke<0;
   })
   //pushName only when there is some players
   if(strokeGivenTo.length>=1){
       for(let player of strokeGivenTo){
            strokeplayersName.push(player.playerId.firstName)
         }
   }

   //autoPress sedning 9th hole matchArr result
   //getting score at 9th hole
   if(data.scoringFormat==1){
       const score = await ongoingMatch.findOne({
           scheduledMatchId:data1.scheduledMatchId._id

       }).select('matchArr').skip(8).limit(1);
       //console.log('f9',score);
       resData.fontNine=score.matchArr;

   }
   
   
    //final resData
    resData.roundId=_id;
    resData.scheduledMatchId=data1.scheduledMatchId._id;
    resData.courseName=courseName;
    resData.courseId=courseId._id;
    resData.holeNo=holeNo;
    resData.par=par;
    resData.yards=yards;
    resData.index=holeStroke;
    resData.holeMap=holeMap;
    resData.holeResult=holeResult;
    resData.players=players;
    resData.strokeGivenTo=strokeplayersName;
    resData.allTeeYardages=strokes;
    //for autoPress
    resData.matchArrPresent=data.matchArr;
    resData.backNineArrPresent=data.backNineArr;
    resData.scoringFormat=data.scoringFormat;
    resData.scoringDetails=data.scoringDetails;

    return resData;
}

//get roundId from frontend
//send them details of particular roundId
const getRoundDetails=async(req,res)=>{
    //console.log('start scoring...');
    const roundId=req.params.roundId;
    const data = await roundDetails(roundId);
    if(data){
        res.status(200).json({
            status:true,
            data:data
        })
    }
   
    
}


/*
recordScore of particular round
mainly we update downIn&net
and give roundResult
*/
const recordScore=async(req,res)=>{
    //console.log('recordScore..')
    const roundId=req.params.roundId;
    const scores=req.body.scores;

    /*
    will help in deciding teams
    by groupOptions seqId
    */
    const groupOptionsData=await ongoingMatch.findById(roundId)
                              .select('scheduledMatchId')
                              .populate({
                                  path:'scheduledMatchId',
                                  select:'groupOptions'
                              });
    const {scheduledMatchId}=groupOptionsData;
    const {groupOptions}=scheduledMatchId;
    const groupId=groupOptions;
    const {seqId}=await matchFormat.findById(groupId).select('seqId');
    const groupOptionsSeqId=seqId;
    

    //variables for rsults
    let holeResult;
    let tgPoints;
    let bgPoints;
    let tgUpBy;
    let bgUpBy;
    let topGrMinScore;
    let bottGrMinScore;


    //update downIn and net of each players
    for(let score of scores){
        await ongoingMatch.findOneAndUpdate({
        _id:roundId,
        "players":{$elemMatch:{"playerId":score.playerId}}
    },{
        $set:{
            "players.$.downIn":score.downIn,
            "players.$.net":score.net
        }
    })
    }//end of loop



    //logic for roundsResult
    const {players,scoringFormat,scoringDetails}=await ongoingMatch.findById(roundId);

    /*
    decide tg&bg
    decide the minimum net score of tg&bg
    will decide holeResult
    ex:tgNetMinscore=1,bgNetMinScore=2 then holeResult=3
    */
    const teams=ongoingMatch.teamsMinNetScore(groupOptionsSeqId,players);
    topGrMinScore=teams.topGrMinScore;
    bottGrMinScore=teams.bottGrMinScore
    

    //cal holeResult
    holeResult=ongoingMatch.getholeResult(topGrMinScore,bottGrMinScore);
    
   


    //cal tgUpBy,bgUpBy
    const {tg,bg}=ongoingMatch.getUpBy(holeResult);
    tgUpBy=tg;
    bgUpBy=bg;


    /*
    cal points based on scoringFormat&Details

    */
    //get all front9rounds
    const frontNineRounds=await ongoingMatch.find({
        scheduledMatchId:scheduledMatchId._id
    }).select('_id');
    //check is roundId whose result we are caluclating belongs to fron9 or back9
    const rowId=frontNineRounds.findIndex((el)=>{
        return el._id.toString()==roundId.toString();
            
        });
    let addPoint;
    if(rowId<=8){
            //roundId belongs to front9
            addPoint=scoringDetails.front;

        }
    else if(rowId>8 && rowId<=17){
            //roundId belongs to back9
            addPoint=scoringDetails.back;
        }
    const points=ongoingMatch.getPoints(holeResult,scoringFormat,addPoint);
    tgPoints=points.tgPoints;
    bgPoints=points.bgPoints;

    
    



    //finally updating results data in model
    const data=await ongoingMatch.findByIdAndUpdate(roundId,{
        $set:{
            "holeResult":holeResult,
            "tgPoints":tgPoints,
            "bgPoints":bgPoints,
            "tgUpBy":tgUpBy,
            "bgUpBy":bgUpBy
        }
    },{new:true});




    /*
    implementing AutoPress
    after in db holeResult,UpBy&Points r updated
    */
    
    const isHoleWon=await ongoingMatch.findById(roundId);
    //console.log('isHoleWon',isHoleWon)
    if(isHoleWon.firstTimeWonBy==1){
        await ongoingMatch.updateMany({
            scheduledMatchId:scheduledMatchId._id
        },{
            $set:{
                firstTimeWonBy:holeResult
            }
        })
    }

    //console.log('points',points);
    //console.log('scoringFormat',scoringFormat);
    //console.log('scoringDetails',scoringDetails)
    let matchArr1=[];//will be used to send in response
    let backNineArr1=[];//will be used to send in response
    if(scoringFormat==1){
        //console.log('autoPress is being played..');
        const {firstWin}=scoringDetails;
        const autoPress=await ongoingMatch.autoPress(holeResult,firstWin,scheduledMatchId._id,roundId);
        const {matchArr,backNineArr}=await ongoingMatch.findById(roundId).select('matchArr backNineArr');
        matchArr1=matchArr;
        backNineArr1=backNineArr;
    }




    //preparing final response by getting nextRound Details
    const nextRoundId =await ongoingMatch.findOne({
        _id:{$gt:roundId},
        holeResult:0,
        scheduledMatchId:scheduledMatchId._id
    }).sort({_id:1}).limit(1);
    //check that round is not the last round
    if(nextRoundId){
        const nextRoundData=await roundDetails(nextRoundId._id);
        if(nextRoundData){

           return res.status(200).json({
               status:true,
               result:holeResult,
               isLastRound:false,
               matchArrLast:matchArr1,
               backNineArrLast:backNineArr1,
               data:nextRoundData
            })

        }
    }//end of if

    let finalMatchResult;
    if(scoringFormat==2){
      //console.log('finalResult for matchPlay');
      finalMatchResult=await ongoingMatch.calFinalResult(scheduledMatchId._id);

    }

    else if(scoringFormat==1){
        //console.log('finalResult for autoPress');
        finalMatchResult=await ongoingMatch.calFinalResultAuto(scheduledMatchId._id);

    }

    

    /*
    once match completed we need to change status in scheduledMatch to 3
    so that it comes in past category
    */

    if(Object.keys(finalMatchResult).length !== 0){
        await scheduleMatch.findByIdAndUpdate(scheduledMatchId._id,{
            $set:{
                matchStatus:3,
                matchResult:finalMatchResult
            }
        })

        res.status(200).json({
            status:true,
            isLastRound:true,
            data:finalMatchResult
         })

    }
    

    
    
    
    
}

/*
return all roundsId
when user clicks on hole dropdown

*/

const getAllRounds=async(req,res)=>{
    //console.log('allRounds of particular match');
    const scheduledMatchId=req.params.matchId;
    const frontNine=await ongoingMatch.find({
        scheduledMatchId:scheduledMatchId
    }).select('_id holeResult holeNo').limit(9);
    const backNine=await ongoingMatch.find({
        scheduledMatchId:scheduledMatchId
    }).select('_id holeResult holeNo').skip(9).limit(9);
    if(frontNine){
        res.status(200).json({
            status:true,
            frontNine:frontNine,
            backNine:backNine

        })
    }

}

/*
API for dashbaord ongoingMatch button
will send roundId if there any match
*/

const myOngoingMatch=async(req,res)=>{
    //console.log('anyOngoing match...');
    const userId=req.params.userId;
    const roundId=await ongoingMatch.findOne({
        editingRights:userId,
        holeResult:0
    }).select('_id');
    //console.log('roundId',roundId);
    if(roundId){
        return res.status(200).json({
            status:true,
            roundId:roundId._id
        })
    }

    res.status(200).json({
        status:false
    })

}

//player is not allowed to startMatch
//when already match is goingOn

const canStartMatch=async(req,res,next)=>{
    //console.log('check startMatch eligibility..');
    const userId=req.params.userId;
    const data=await ongoingMatch.findOne({
        holeResult:0,
        "players":{$elemMatch:{"playerId":userId}}
    });
    //console.log('data',data);
    if(data!=null){
       return res.status(200).json({
        status:false,
        message:'Please complete match first'
       })
    }
    res.status(200).json({
           status:true,
           message:'eligible to startMatch'
       })
    
};





module.exports={
    startMatch,
    getRoundDetails,
    recordScore,
    getAllRounds,
    myOngoingMatch,
    canStartMatch
};