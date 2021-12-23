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
    ]
    
},{timestamps:true});

handicapSchema.statics.totalMerit =async function(groupId,playerId){
    console.log('from model...')
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
    const handicapScore = await this.aggregate([
        {$match:{
            groupId:mongoose.Types.ObjectId(groupId),
            "players.id":mongoose.Types.ObjectId(playerId)
               }
        },
        {$sort:{"roundsDate":-1}},
        {$limit:12},
        {$unwind:"$players"},
        {$sort:{"players.score":1}},
        {$match:{"players.id":mongoose.Types.ObjectId(playerId)}},
        {$limit:6},
        {$group:{
            _id:null,
            totalScore:{$sum:"$players.score"}
        }}
      ])
    const score = ((handicapScore[0].totalScore)/6).toFixed(1);
      return score;
}

const Handicap=mongoose.model('Handicap',handicapSchema);
module.exports=Handicap;