const mongoose=require('mongoose');

const scheduleMatchSchema = new mongoose.Schema({

    groupOptions:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'matchFormat',
        required:[true,'groupOptions is must']
    },

    players:[{
        playerId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:[true,'playerId is must']
        },
        seqId:{
            type:Number,
            required:[true,'seqId of player is must']
        }
    }],

    courseId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Course',
        required:[true,'courseId is must']
    },

    matchDate:{
        type:Number,
        required:[true,'matchDate is must']
    },

    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:[true,'createdBy id is must']
    },
    
    matchStatus:{
        type:Number,
        default:1,//1->scheduled 2->started 3->completed/past 4->friends
    },
    matchResult:Object
},{timestamps:true});

const scheduleMatch=mongoose.model('scheduleMatch',scheduleMatchSchema);

module.exports=scheduleMatch;