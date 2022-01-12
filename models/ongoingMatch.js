const mongoose=require('mongoose');
const ongoingMatchSchema=new mongoose.Schema({
    scheduledMatchId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'scheduleMatch',
        required:[true,'scheduledMatchId is must']
    },
    courseId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Course',
        required:[true,'courseId is must']
    },
    players:[
        {
          playerId:{
              type:mongoose.Schema.Types.ObjectId,
              ref:'User',
              required:[true,'playerId is must']
          },
          playerSeqId:{
              type:Number,
              required:[true,'playerSeqId is must']
          },
          teePlayingFromId:{
              type:mongoose.Schema.Types.ObjectId,
              required:[true,'teePlyaingfrom is must']
          },
          //backend
          teeName:{
              type:String
          },
          //backend
          teeColorCode:{
              type:String
          },
          
          //backend
          yards:{
              type:Number
          },

          matchStroke:{
              type:Number,
              required:[true,'match stoke of player is must']
          },
          //backend
          holeStroke:{
              type:Number

          },
          //backend
          finalStroke:{
              type:Number
          },
          //backend
          downIn:{
              type:Number
          },
          //backend
          net:{
              type:Number,
             
          },

        }
    ],
    //hole
    matchStartedFromHoleId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Hole',
        required:[true,'matchStartedHoleId is must']
    },
    //backend
    holeNo:{
        type:Number

    },
    //backend
    par:{
        type:Number
    },
    //backend
    holeId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Hole'
    } ,  
    scoringFormat:{
        type:Number,
        default:2,//1->autoPress 2->matchPlay 3->strokePlay 4->sixPoint 5->stableford
    },
    scoringDetails:{
        front:{
            type:Number
        },
        back:{
            type:Number
        },
        match:{
            type:Number
        }
    },
    editingRights:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:[true,'editingRights is must']
    
    },
    //result
    holeResult:{
        type:Number,//0->allSquare(means not played yet) ,1->halved 2->TGW 3->BGW
        default:0
    },
    tgPoints:{
        type:Number,
        default:0
    },
    bgPoints:{
        type:Number,
        default:0
    },
    tgUpBy:{
        type:Number,
        default:0
    },
    bgUpBy:{
        type:Number,
        default:0
    }
    
    
    

},{timestamps:true});


/*
STEP1:
decide top&bott grp
decide their min net score

*/
ongoingMatchSchema.statics.teamsMinNetScore=(groupOptionsSeqId,players)=>{
    console.log('inside teamPoints',groupOptionsSeqId)
    const teamPoints={};
    const topGr=[];
    const bottGr=[];

    //logic for [2vs2]
    if(groupOptionsSeqId==1){
        //console.log('inside if')
        for(let player of players){
            if(player.playerSeqId==1 ||player.playerSeqId==2 ){
                topGr.push(player.net)

            }else{
                    bottGr.push(player.net)
                }

        }//loop end

    }
    //console.log('topGr',topGr);
    //console.log('bottGr',bottGr)
    
    teamPoints.topGrMinScore=Math.min(...topGr);
    teamPoints.bottGrMinScore=Math.min(...bottGr);
    return teamPoints;
}

/*
STEP2:
holeResult=0(not played)
holeResult=1(halved)
holeResult=2(tgw)
holeResult=3(bgw)

*/
ongoingMatchSchema.statics.getholeResult=(topGrMinScore,bottGrMinScore)=>{
    console.log('inside getholeResult',topGrMinScore,bottGrMinScore)
    let holeResult;
    if(topGrMinScore<bottGrMinScore){
            holeResult=2;
        }
    else if(bottGrMinScore<topGrMinScore){
            holeResult=3;
        }
    else{
            holeResult=1;
        }
    return holeResult;

}

/*
STEP3:
getUpBy

*/

ongoingMatchSchema.statics.getUpBy=(holeResult)=>{
    const obj={
        tg:0,
        bg:0
    };
    if(holeResult==2){
        obj.tg=1
    }
    else if(holeResult==3){
        obj.bg=1;
    }
    return obj;
}

/*
STEP4:
depends upon scoringFormat 2->MatchPlay,1->AutoPres
addPoint varies for front9 and back9

*/

ongoingMatchSchema.statics.getPoints=(holeResult,scoringFormat,addPoint)=>{
    console.log('inside getPoints...');
    console.log('snig',holeResult,scoringFormat,addPoint)
    const points={
        tgPoints:0,
        bgPoints:0
    };
    //logic for matchPlay
    if(scoringFormat==2){
        if(holeResult==1){
            //halved
            points.tgPoints=0;
            points.bgPoints=0;
              
        }
        else if(holeResult==2){
            //tg win
            points.tgPoints=addPoint;
            points.bgPoints=-addPoint;

        }
        else if(holeResult==3){
            //bg win
            points.tgPoints=-addPoint;
            points.bgPoints=addPoint;

        }
    }
    return points;
}



ongoingMatchSchema.statics.calFinalResult= async function(scheduledMatchId){
    console.log('inside calFinalResult',scheduledMatchId);
    const resultObj={};
    
    
    //pointFront
    const pointsFront=await this.aggregate([
        {$match:{scheduledMatchId:scheduledMatchId}},
        {$limit:9},
        {$group:{
            _id:null,
            tgPoints:{$sum:"$tgPoints"},
            bgPoints:{$sum:"$bgPoints"}
        }}
        
    ])

    
    //pointsBack
    const pointsBack=await this.aggregate([
        {$match:{scheduledMatchId:scheduledMatchId}},
        {$skip:9},
        {$limit:9},
        {$group:{
            _id:null,
            tgPoints:{$sum:"$tgPoints"},
            bgPoints:{$sum:"$bgPoints"}
        }}
        
    ])
    
    if(pointsBack.length==1){
        //means they have played more than 9holes match
        resultObj.pointsFront={
        tgPoints:pointsFront[0].tgPoints,
        bgPoints:pointsFront[0].bgPoints

          }
        resultObj.pointsBack={
        tgPoints:pointsBack[0].tgPoints,
        bgPoints:pointsBack[0].bgPoints

        }
    }else{
        //means played 9holes match
        //so no back9 concept
        resultObj.pointsFront={
        tgPoints:pointsFront[0].tgPoints,
        bgPoints:pointsFront[0].bgPoints

          }
    }
    //upBy
    const upBy=await this.aggregate([
        {$match:{scheduledMatchId:scheduledMatchId}},
        {$group:{
            _id:null,
            tgUp:{$sum:"$tgUpBy"},
            bgUp:{$sum:"$bgUpBy"}
        }}
        
    ])

    //getting match value from scoringDetails
    const {scoringDetails}=await this.findOne({
        scheduledMatchId:scheduledMatchId
    }).select('scoringDetails');
    const {match}=scoringDetails;

    //tg won cal
    if(upBy[0].tgUp>upBy[0].bgUp){
        const diff=upBy[0].tgUp-upBy[0].bgUp;
        let total;
        if(pointsBack.length==1){
           total=match+resultObj.pointsFront.tgPoints+resultObj.pointsBack.tgPoints;
        }else{
            total=match+resultObj.pointsFront.tgPoints;
        }
        
        resultObj.wonBy=`Top Group won the match ${diff} Up`;
        resultObj.match=`Top Group won ${match} points`;
        resultObj.total=`Top Group won ${total} points`
    }
    //bg won cal
    else if(upBy[0].bgUp>upBy[0].tgUp){
        const diff=upBy[0].bgUp-upBy[0].tgUp;
        let total;
        if(pointsBack.length==1){
           total=match+resultObj.pointsFront.bgPoints+resultObj.pointsBack.bgPoints;
        }else{
            total=match+resultObj.pointsFront.bgPoints;
        }
        
        resultObj.wonBy=`Bottom Group won the match ${diff} Up`;
        resultObj.match=`Bottom Group won ${match} points`;
        resultObj.total=`Bottom Group won ${total} points`;

    }
    //match tie
    else{
        resultObj.wonBy=`Match Tie`;
        resultObj.match=`Match Tie`;
        resultObj.total=`Match Tie`;

    }
    
    //console.log('resultObj',resultObj)
    return resultObj;

}

const ongoingMatch=mongoose.model('ongoingMatch',ongoingMatchSchema);

module.exports=ongoingMatch;