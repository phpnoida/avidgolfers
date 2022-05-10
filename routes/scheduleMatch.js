const express = require("express");
const {
  addMatch,
  getMyUpcomingMatches,
  getMatchData,
  editUpcomingMatch,
  deleteScheduledMatch,
  getMyFriendsUpcoming,
} = require("./../controllers/scheduleMatch");

const router = express.Router();
router.route("/scheduleMatch").post(addMatch);
router.route("/upcomingMatchesFor/:userId").get(getMyUpcomingMatches);
router.route("/matchDetails/:matchId").get(getMatchData);
router.route("/editMatchDetails/:matchId").patch(editUpcomingMatch);
router.route("/deleteScheduledMatch/:matchId").delete(deleteScheduledMatch);

//friends concepts
router.route("/upcomingMatchesFriends/:userId").get(getMyFriendsUpcoming);

module.exports = router;
