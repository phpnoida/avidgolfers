const mongoose=require('mongoose');
const handicapSchema = new mongoose.Schema({
    //date of rounds
    roundsDate:{
        type:Date,
        required:[true,'date of rounds is must']
    },
    groupId:{
         type:mongoose.Schema.Types.ObjectId,
         ref:'Group',
         required:[true,'group id is must']
    },
    loggedBy:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
        fullName:String
        
    },
    //players 
    players:[
        {
            id:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'User',
                required:[true,'user id is must']
            },
            //score can be +ve or -ve
            score:{
                type:Number,
                required:[true,'score is must']
            },
            //money can be +ve or -ve
            money:{
                type:Number,
                required:[true,'money is must']
            }
        }
    ],
    settings:{
        handicapCal:{
            type:Number,
            default:1, //1 means 6/12 & 2 means 8/20
        },
        strokeCal:{
            type:Number,
            default:1,//1 means .75 & 2 means 1

        }
    }
    
},{timestamps:true});

handicapSchema.statics.totalMerit =async function(groupId,playerId){
    //console.log('from model...')
    const totalMerit = await this.aggregate([
        {$unwind:"$players"},
        {$match:{
            groupId:mongoose.Types.ObjectId(groupId),
            "players.id":mongoose.Types.ObjectId(playerId)
               }
        },
        {$group:{
             _id:"$players.id",
            "total":{$sum:"$players.money"}
        }}
        
    ])
    return totalMerit[0].total;

}

handicapSchema.statics.handicapScore =async function(groupId,playerId){
    const data = await this.findOne({groupId:groupId});
    const {settings} =data;
    let totalRounds =12;
    let bestRounds=6;
    let multiplier=.75;
    if(settings.handicapCal==2){
        totalRounds =20;
        bestRounds=8;
        multiplier=1;
    }
    
    const handicapScore = await this.aggregate([
        {$match:{
            groupId:mongoose.Types.ObjectId(groupId),
            "players.id":mongoose.Types.ObjectId(playerId)
               }
        },
        {$sort:{"roundsDate":-1}},
        {$limit:totalRounds},
        {$unwind:"$players"},
        {$sort:{"players.score":1}},
        {$match:{"players.id":mongoose.Types.ObjectId(playerId)}},
        {$limit:bestRounds},
        {$group:{
            _id:null,
            totalScore:{$sum:"$players.score"}
        }}
      ])
    const handScre = ((handicapScore[0].totalScore)/bestRounds).toFixed(1);
    const stroke=(handScre*multiplier).toFixed(1);
    return {
        handScre,
        stroke

    }
}



const Handicap=mongoose.model('Handicap',handicapSchema);
module.exports=Handicap;