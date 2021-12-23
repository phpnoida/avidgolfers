const mongoose=require('mongoose');
const yardageSchema=new mongoose.Schema({
    courseId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Course'
    },
    totalPar:{
        type:String,
        default:''
    },
    yardage:[
        {
            holeNo:{
                type:String,
                default:''
            },
            par:{
                type:String,
                default:''
            },
            totalYards:{
                type:String,
                default:''
            },

            info:[
                {
                    colorId:{
                        type:String,
                        default:''
                    },
                    yards:{
                        type:String,
                        default:''
                    },
                    stks:{
                        type:String,
                        default:''
                    },
                    rating:{
                        type:String,
                        default:''
                    },
                    slope:{
                        type:String,
                        default:''
                    }
                }
            ]
          

        }
       


    ]
},{timestamps:true});

const Yardage=mongoose.model('Yardage',yardageSchema);

module.exports=Yardage;