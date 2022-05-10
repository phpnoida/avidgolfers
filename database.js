const mongoose=require('mongoose');

const connectDB=()=>{
    mongoose.connect(`mongodb://dev-golfer:NX73SV&eaTgQ39_@3.110.255.248:27017/golfers`,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false,
    useUnifiedTopology: true
}).then(()=>{
        console.log('DB Connected...')
    }).catch((err)=>{
        console.log('DB Err',err)
    })
}

module.exports=connectDB;