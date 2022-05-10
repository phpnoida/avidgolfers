const matchFormat=require('./../models/matchFormat');

const addMatchFormat = async(req,res)=>{
    //console.log('add matchFormat');
    const data=await matchFormat.create(req.body);
    if(data){
        res.status(201).json({
            status:true,
            message:'Format Added'
        })
    }
}

const matchFormatLists = async(req,res)=>{
    //console.log('matchFormats lists..');
    const data=await matchFormat.find({}).sort({seqId:1});
    if(data){
        res.status(200).json({
            status:true,
            data:data
        })
    }
}

module.exports={matchFormatLists,addMatchFormat}