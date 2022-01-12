const express=require('express');
const {matchFormatLists,addMatchFormat}=require('./../controllers/matchFormat');

const router=express.Router();
router.route('/matchFormat').post(addMatchFormat);
router.route('/matchFormats').get(matchFormatLists);

module.exports=router;