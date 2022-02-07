const express=require('express');
const {addMatch,getMyUpcomingMatches,
      getMatchData,editUpcomingMatch,deleteScheduledMatch}=require('./../controllers/scheduleMatch');

const router=express.Router();
router.route('/scheduleMatch').post(addMatch);
router.route('/upcomingMatchesFor/:userId').get(getMyUpcomingMatches);
router.route('/matchDetails/:matchId').get(getMatchData);
router.route('/editMatchDetails/:matchId').patch(editUpcomingMatch);
router.route('/deleteScheduledMatch/:matchId').delete(deleteScheduledMatch);

module.exports=router;