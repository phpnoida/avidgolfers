const mongoose=require('mongoose');
const courseSchema = new mongoose.Schema({
    name:{
        type:String,
        default:''
    },
    photo:{
        type:String,
        default:''
    },
    logo:{
        type:String,
        default:''
    },
    about:{
        type:String,
        default:''
    },
    gpsLocation:{
        type:String,
        default:''
    },
    country:{
        type:String,
        default:''
    },
    city:{
        type:String,
        default:''
    },
    totalHoles:{
        type:Number
    },
    totalTees:{
        type:Number
    },
    tees:[
        {
        teeName:{
         type:String
                },
        colorCode:{
         type:String
                  }
        }
    ],
    units:{
        type:Number,
        default:1 //1=yards 2=meters
    }

},
{
    timestamps:true,
    toObject:{virtuals:true},
    toJSON:{virtuals:true},

});

//virtual field for holeInfo
courseSchema.virtual('holeInfo',{
    localField:'_id',
    foreignField:'courseId',
    ref:'Hole'
})

//virtual field for yardageInfo
courseSchema.virtual('yardageInfo',{
    localField:'_id',
    foreignField:'courseId',
    ref:'Yardage'
})

const Course=mongoose.model('Course',courseSchema);
module.exports=Course;