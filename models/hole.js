const mongoose=require('mongoose');
const holeSchema = new mongoose.Schema({
    courseId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Course'
    },
    holeNo:{
        type:Number,
    
    },
    holeName:{
        type:String,
        default:''
    },
    par:{
        type:Number,
        default:0
    },
    strokes:[
        {
            teeId:{
                type:mongoose.Schema.Types.ObjectId,
                
            },
            colorCode:{
                type:String
            },
            teeName:{
                type:String

            },
            yards:{
                type:Number
            },
            stks:{
                type:Number
            },
            
        }

    ],
    about:{
        type:String,
        default:''
    },
    webYardage:{
        type:String,
        default:''
    },
    webPar:{
        type:String,
        default:''
    },
    greenLocation:{
        type:String,
        default:''
    },
    pinLocation:{
        type:String,
        default:''
    },
    mainPhoto:{
        type:String,
        default:''
    },
    video:{
        type:String,
        default:''
    },
    holeMap:{
        type:String,
        default:''
    },
    gallery:[String]
},{timestamps:true});

const Hole=mongoose.model('Hole',holeSchema);

module.exports=Hole;