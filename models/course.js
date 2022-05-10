const mongoose= require('mongoose');
const courseSchema = new mongoose.Schema({
    courseName:{
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
    about:{
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
    location:{
        type:String,
        default:''
    },
    totalHoles:{
        type:String,
        default:''
    },
    units:{
        type:Number,
        default:1,//1-->yards , 2-->meters
    },
    totalTees:{
        type:String,
        default:''
    },
    teesInfo:[
        {
         teeName:{
            type:String,
            default:''
               },
         colorCode:{
            type:String,
            default:''
          },
         slope:{
            type:String,
            default:''
         },
         rating:{
            type:String,
            default:''
         }
        }
    ]
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true},
    timestamps:true});

courseSchema.virtual('holeInfo',{
    localField:'_id',
    foreignField:'courseId',
    ref:'Hole'
})

const Course = mongoose.model('Course',courseSchema);
module.exports =Course;
