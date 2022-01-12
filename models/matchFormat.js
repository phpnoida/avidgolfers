const mongoose=require('mongoose');
const matchFormatSchema = new mongoose.Schema({
    name:{
        type:String
    },
    matchFormat:[Number],
    seqId:{
        type:Number
    },
},{timestamps:true});

const matchFormat=mongoose.model('matchFormat',matchFormatSchema);

module.exports=matchFormat;