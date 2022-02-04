const express=require('express');
const {
    startMatch,
    getRoundDetails,
    recordScore,
    getAllRounds,
    myOngoingMatch,
    canStartMatch,
    endMatchEarly,
    pastMatches
}=require('./../controllers/ongoingMatch');

const router=express.Router();

router.route('/startMatch').post(startMatch);
router.route('/getRoundDetailsFor/:roundId').get(getRoundDetails);
router.route('/recordScoreForRound/:roundId').patch(recordScore);
router.route('/getAllRoundsFor/:matchId').get(getAllRounds);
router.route('/canStartMatch/:userId').get(canStartMatch);

//endMatch
router.route('/endMatchEarly').post(endMatchEarly);

//ongoing
router.route('/ongoingMatch/:userId').get(myOngoingMatch);

//pastMatches
router.route('/getPastMatchesFor/:userId').get(pastMatches);

module.exports=router;