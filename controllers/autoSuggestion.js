const Group = require("./../models/group");
const User = require("./../models/user");
var _ = require("lodash");

/*
return those members list 
who are still part of group
from those group
in which loggedIn user is also active member
0=pending , 
1=active , 
2=if admin reject user request for joining group, 
3= remove it's self, 
4 = admin remove

*/
const friendLists = async (loggedInUserId) => {
  //console.log('search friends..',loggedInUserId);
  const data = await Group.find({
    users: { $elemMatch: { id: loggedInUserId, status: 1 } },
  })
    .select("users")
    .populate({
      path: "users.id",
      select: "firstName lastName petName profileImg",
    });
  let players = [];
  for (let el of data) {
    for (let el1 of el.users) {
      //eliminating loggedIn user details
      //fetching only those whose status is 1(active)
      if (el1.status == 1) {
        players.push({
          name: `${el1.id.firstName} ${el1.id.lastName}`,
          profilePic: `${el1.id.profileImg}`,
          playerID: `${el1.id._id}`,
          //status:el1.status
        });
      }
    }
  }

  const relatives = await User.findById(loggedInUserId).select(
    "relativeInSchool"
  );
  for (let el of relatives.relativeInSchool) {
    players.push({
      name: `${el.relativeName}`,
      playerID: `${el._id}`,
    });
  }

  //console.log('befoe',players);
  const playersWhoAreFriends = _.uniqBy(players, function (e) {
    return e.playerID;
  });
  //console.log('after',playersWhoAreFriends)
  return playersWhoAreFriends;
};

//search players who are friends
const searchPlayers = async (req, res) => {
  const loggedInUserId = req.params.userId;
  const friends = await friendLists(loggedInUserId);
  //console.log('friends',friends);
  const sk = req.query.searchKeyword;
  const friendsData = friends.filter((el) => {
    //console.log(el.name)
    return new RegExp(`.*${sk}.*`, "i").test(el.name);
  });
  //console.log('friendsData',friendsData)
  if (friendsData) {
    res.status(200).json({
      status: true,
      totalRec: friendsData.length,
      data: friendsData,
    });
  }
};

module.exports = { searchPlayers, friendLists };
