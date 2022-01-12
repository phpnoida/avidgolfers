const express=require('express');
const {
    startMatch,
    getRoundDetails,
    recordScore,
    getAllRounds,
    myOngoingMatch
}=require('./../controllers/ongoingMatch');

const router=express.Router();

router.route('/startMatch').post(startMatch);
router.route('/getRoundDetailsFor/:roundId').get(getRoundDetails);
router.route('/recordScoreForRound/:roundId').patch(recordScore);
router.route('/getAllRoundsFor/:matchId').get(getAllRounds);

//ongoing
router.route('/ongoingMatch/:userId').get(myOngoingMatch);

module.exports=router;