const express=require('express');
const {searchPlayers}=require('./../controllers/autoSuggestion');

const router=express.Router();

router.route('/searchFriendsFor/:userId').get(searchPlayers);


module.exports=router;