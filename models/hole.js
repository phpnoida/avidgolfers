const mongoose=require('mongoose');
const holeSchema=new mongoose.Schema({
    courseId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Course'

    },
    holes:[
        {
            holeNo:{
                type:String
            },
            name:{
                type:String,
                default:''
            },
            yardage:{
                type:String,
                default:''
            },
            par:{
                type:String,
                default:''
            },
            about:{
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
        }
        

    ]
    
},{timestamps:true});

const Hole=mongoose.model('Hole',holeSchema);
module.exports=Hole;