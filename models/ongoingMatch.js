const mongoose = require("mongoose");
const ongoingMatchSchema = new mongoose.Schema(
  {
    scheduledMatchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "scheduleMatch",
      required: [true, "scheduledMatchId is must"],
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "courseId is must"],
    },
    players: [
      {
        playerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: [true, "playerId is must"],
        },
        playerSeqId: {
          type: Number,
          required: [true, "playerSeqId is must"],
        },
        teePlayingFromId: {
          type: mongoose.Schema.Types.ObjectId,
          required: [true, "teePlyaingfrom is must"],
        },
        //backend
        teeName: {
          type: String,
        },
        //backend
        teeColorCode: {
          type: String,
        },

        //backend
        yards: {
          type: Number,
        },

        matchStroke: {
          type: Number,
          required: [true, "match stoke of player is must"],
        },
        //backend
        holeStroke: {
          type: Number,
        },
        //backend
        finalStroke: {
          type: Number,
        },
        //backend
        downIn: {
          type: Number,
        },
        //backend
        net: {
          type: Number,
        },
        //backend score=net-par
        score: {
          type: Number,
        },
        //backend
        downInSum: {
          type: Number,
        },
        //backend
        netSum: {
          type: Number,
        },
        //backend
        scoreSum: {
          type: Number,
        },
        //backend stableford  gross=downIn-par
        gross: {
          type: Number,
        },
        //backend, will be calculated upon finalStroke
        stableFordNet: {
          type: Number,
        },
        //backend, will calculated upon gross
        stableFordGross: {
          type: Number,
        },
        //backend
        stableFordNetSum: {
          type: Number,
        },
        //backend
        stableFordGrossSum: {
          type: Number,
        },
      },
    ],
    //hole
    matchStartedFromHoleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hole",
      required: [true, "matchStartedHoleId is must"],
    },
    //backend
    holeNo: {
      type: Number,
    },
    //backend
    par: {
      type: Number,
    },
    //backend
    holeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hole",
    },
    scoringFormat: {
      type: Number,
      default: 2, //1->autoPress 2->matchPlay 3->strokePlay 4->stableford 5->stableford-modi
    },
    scoringDetails: {
      front: {
        type: Number,
        default: 0,
      },
      back: {
        type: Number,
        default: 0,
      },
      match: {
        type: Number,
        default: 0,
      },
      //will be used in autoPress
      firstWin: {
        type: Number,
        default: 0, //21->[0,2,0] ,31->[1,1,1] ,51->[1,1,1,1,1]
      },
      //will be used in strokePlay
      pointsPerStroke: {
        type: Number,
        default: 0,
      },
      //will be used in stableford
      pointsPerPoint: {
        type: Number,
        default: 0,
      },
    },
    editingRights: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "editingRights is must"],
    },
    //result
    holeResult: {
      type: Number, //0->allSquare(means not played yet) ,1->halved 2->TGW 3->BGW,4->end Matchearly
      default: 0,
    },
    tgPoints: {
      type: Number,
      default: 0,
    },
    bgPoints: {
      type: Number,
      default: 0,
    },
    tgUpBy: {
      type: Number,
      default: 0,
    },
    bgUpBy: {
      type: Number,
      default: 0,
    },
    //result for autoPress
    matchArr: {
      type: [Number],
    },
    backNineArr: {
      type: [Number],
    },
    //who won 1st time front9
    firstTimeWonBy: {
      type: Number,
      default: 1, //1->not won yet ,2->topGr 3->bottGr
    },
    //only for noti, we will remove this field
    isNotiSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/*
STEP1:
decide top&bott grp
decide their min net score

*/
ongoingMatchSchema.statics.teamsMinNetScore = (groupOptionsSeqId, players) => {
  //console.log('inside teamPoints',groupOptionsSeqId)
  const teamPoints = {};
  const topGr = [];
  const bottGr = [];

  //logic for [2vs2]
  if (groupOptionsSeqId == 1) {
    //console.log('inside if1')
    for (let player of players) {
      if (player.playerSeqId == 1 || player.playerSeqId == 2) {
        topGr.push(player.net);
      } else {
        bottGr.push(player.net);
      }
    } //loop end
  }

  //logic for [1vs1]
  if (groupOptionsSeqId == 2) {
    //console.log('inside if2')
    for (let player of players) {
      if (player.playerSeqId == 1) {
        topGr.push(player.net);
      } else {
        bottGr.push(player.net);
      }
    } //loop end
  }
  //console.log('topGr',topGr);
  //console.log('bottGr',bottGr);

  teamPoints.topGrMinScore = Math.min(...topGr);
  teamPoints.bottGrMinScore = Math.min(...bottGr);
  //console.log('teampoints',teamPoints);
  return teamPoints;
};

/*
STEP2:
holeResult=0(not played)
holeResult=1(halved)
holeResult=2(tgw)
holeResult=3(bgw)

*/
ongoingMatchSchema.statics.getholeResult = (topGrMinScore, bottGrMinScore) => {
  //console.log('inside getholeResult',topGrMinScore,bottGrMinScore)
  let holeResult;
  if (topGrMinScore < bottGrMinScore) {
    holeResult = 2;
  } else if (bottGrMinScore < topGrMinScore) {
    holeResult = 3;
  } else {
    holeResult = 1;
  }
  return holeResult;
};

/*
STEP3:
getUpBy

*/

ongoingMatchSchema.statics.getUpBy = (holeResult) => {
  const obj = {
    tg: 0,
    bg: 0,
  };
  if (holeResult == 2) {
    obj.tg = 1;
  } else if (holeResult == 3) {
    obj.bg = 1;
  }
  return obj;
};

/*
STEP4:
depends upon scoringFormat 2->MatchPlay,1->AutoPres
addPoint varies for front9 and back9

*/

ongoingMatchSchema.statics.getPoints = (
  holeResult,
  scoringFormat,
  addPoint
) => {
  //console.log('inside getPoints...');
  //console.log('snig',holeResult,scoringFormat,addPoint);

  const points = {
    tgPoints: 0,
    bgPoints: 0,
  };
  //logic for matchPlay & autoPress
  if (scoringFormat == 2 || scoringFormat == 1) {
    if (holeResult == 1) {
      //halved
      points.tgPoints = 0;
      points.bgPoints = 0;
    } else if (holeResult == 2) {
      //tg win
      points.tgPoints = addPoint;
      points.bgPoints = -addPoint;
    } else if (holeResult == 3) {
      //bg win
      points.tgPoints = -addPoint;
      points.bgPoints = addPoint;
    }
  }
  return points;
};

ongoingMatchSchema.statics.calFinalResult = async function (scheduledMatchId) {
  //console.log('inside calFinalResult matchPlay',scheduledMatchId);
  const resultObj = {};

  //we need to give gross,Net&Score as well as scoringFormat and scoringDetails
  const summary = await this.find({
    scheduledMatchId: scheduledMatchId,
  }).select("players scoringFormat scoringDetails");

  //getting lastround value
  const finalSummary = summary.slice(-1);

  resultObj.players = finalSummary[0].players;
  resultObj.scoringFormat = finalSummary[0].scoringFormat;
  resultObj.scoringDetails = finalSummary[0].scoringDetails;

  //end of functionality for gross,Net&Score

  //pointFront
  const pointsFront = await this.aggregate([
    { $match: { scheduledMatchId: scheduledMatchId } },
    { $limit: 9 },
    {
      $group: {
        _id: null,
        tgPoints: { $sum: "$tgPoints" },
        bgPoints: { $sum: "$bgPoints" },
        tgUpBy: { $sum: "$tgUpBy" },
        bgUpBy: { $sum: "$bgUpBy" },
      },
    },
  ]);

  //pointsBack
  const pointsBack = await this.aggregate([
    { $match: { scheduledMatchId: scheduledMatchId } },
    { $skip: 9 },
    { $limit: 9 },
    {
      $group: {
        _id: null,
        tgPoints: { $sum: "$tgPoints" },
        bgPoints: { $sum: "$bgPoints" },
        tgUpBy: { $sum: "$tgUpBy" },
        bgUpBy: { $sum: "$bgUpBy" },
      },
    },
  ]);

  //diff at front9
  const diff1 = pointsFront[0].tgUpBy - pointsFront[0].bgUpBy;
  if (diff1 > 0) {
    resultObj.pointsFront = {
      diff: diff1,
      wonBy: "Top Group won Front 9",
      points: pointsFront[0].tgPoints,
      tgPoints: pointsFront[0].tgPoints,
      bgPoints: pointsFront[0].bgPoints,
    };
  } else if (diff1 < 0) {
    resultObj.pointsFront = {
      diff: Math.abs(diff1),
      wonBy: "Bottom Group won Front 9",
      points: pointsFront[0].bgPoints,
      tgPoints: pointsFront[0].tgPoints,
      bgPoints: pointsFront[0].bgPoints,
    };
  } else if (diff1 == 0) {
    resultObj.pointsFront = {
      diff: 0,
      wonBy: "No Group won Front 9",
      points: 0,
    };
  }
  //diff at back9
  let diff2;
  if (pointsBack.length == 1) {
    //console.log("reached");
    //means back9 was played
    diff2 = pointsBack[0].tgUpBy - pointsBack[0].bgUpBy;
    if (diff2 > 0) {
      resultObj.pointsBack = {
        diff: diff2,
        wonBy: "Top Group won Back 9",
        points: pointsBack[0].tgPoints,
        tgPoints: pointsBack[0].tgPoints,
        bgPoints: pointsBack[0].bgPoints,
      };
    } else if (diff2 < 0) {
      resultObj.pointsBack = {
        diff: Math.abs(diff2),
        wonBy: "Bottom Group won Back 9",
        points: pointsBack[0].bgPoints,
        tgPoints: pointsBack[0].tgPoints,
        bgPoints: pointsBack[0].bgPoints,
      };
    } else if (diff2 == 0) {
      resultObj.pointsBack = {
        diff: 0,
        wonBy: "No Group won Back 9",
        points: 0,
        tgPoints: pointsBack[0].tgPoints,
        bgPoints: pointsBack[0].bgPoints,
      };
    }
  }

  //final match calulations
  //upBy
  const upBy = await this.aggregate([
    { $match: { scheduledMatchId: scheduledMatchId } },
    {
      $group: {
        _id: null,
        tgUp: { $sum: "$tgUpBy" },
        bgUp: { $sum: "$bgUpBy" },
      },
    },
  ]);

  //getting match value from scoringDetails
  const { scoringDetails } = await this.findOne({
    scheduledMatchId: scheduledMatchId,
  }).select("scoringDetails");
  const { match } = scoringDetails;

  //tg won cal
  let calStructure;
  if (upBy[0].tgUp > upBy[0].bgUp) {
    const diff = upBy[0].tgUp - upBy[0].bgUp;
    calStructure;
    let total;
    if (pointsBack.length == 1) {
      total =
        match + resultObj.pointsFront.tgPoints + resultObj.pointsBack.tgPoints;
      calStructure = `${match}+${resultObj.pointsFront.tgPoints}+${resultObj.pointsBack.tgPoints}`;
    } else {
      total = match + resultObj.pointsFront.tgPoints;
      calStructure = `${match}+${resultObj.pointsFront.tgPoints}`;
    }
    resultObj.wonBy = {
      diff: diff,
      wonBy: "Top Group won the match",
      points:match,
      totalPoints: total,
      calStructure: calStructure,
    };
  }
  //bg won cal
  else if (upBy[0].bgUp > upBy[0].tgUp) {
    const diff = upBy[0].bgUp - upBy[0].tgUp;
    let total;
    if (pointsBack.length == 1) {
      total =
        match + resultObj.pointsFront.bgPoints + resultObj.pointsBack.bgPoints;
      calStructure = `${match}+${resultObj.pointsFront.bgPoints}+${resultObj.pointsBack.bgPoints}`;
    } else {
      total = match + resultObj.pointsFront.bgPoints;
      calStructure = `${match}+${resultObj.pointsFront.bgPoints}`;
    }

    resultObj.wonBy = {
      diff: diff,
      wonBy: "Bottom Group won the match",
      points: match,
      totalPoints: total,
      calStructure: calStructure,
    };
  }
  //match tie
  else {
    resultObj.wonBy = {
      diff: 0,
      wonBy: "No Group won the match",
      points: 0,
      totalPoints: 0,
      calStructure: 0,
    };
  }

  //return console.log("resultObj", resultObj);
  return resultObj;
};

ongoingMatchSchema.statics.calFinalResultAuto = async function (
  scheduledMatchId
) {
  //console.log('inside calFinalResult autoPress',scheduledMatchId);
  const resultObj = {};

  //we need to give gross,Net&Score , scoringFormat , scoringDetails
  const summary = await this.find({
    scheduledMatchId: scheduledMatchId,
  }).select("players scoringFormat scoringDetails");

  //getting lastround value
  const finalSummary = summary.slice(-1);

  resultObj.players = finalSummary[0].players;
  resultObj.scoringFormat = finalSummary[0].scoringFormat;
  resultObj.scoringDetails = finalSummary[0].scoringDetails;

  //end of functionality for gross,Net&Score

  //get matchArr value at 9th hole(front9)
  const scoreF = await this.findOne({
    scheduledMatchId: scheduledMatchId,
  })
    .select("matchArr scoringDetails")
    .skip(8)
    .limit(1);
  const { scoringDetails } = scoreF;
  const backPoints = scoringDetails.back;
  const frontPoints = scoringDetails.front;
  const matchPoints = scoringDetails.match;
  //console.log('scoreAtNine',scoreF,frontPoints,backPoints,matchPoints);
  //let us cal count for +ve numbers and -ve numbers in array
  const calDiff = (arr) => {
    let positiveCount = 0;
    let negativeCount = 0;
    for (let el of arr) {
      if (el > 0) {
        positiveCount++;
      } else if (el < 0) {
        negativeCount++;
      }
    }
    return positiveCount - negativeCount;
  };

  const diff = calDiff(scoreF.matchArr);

  if (diff > 0) {
    //console.log('diff is greater means topGr wins front9');
    const points = diff * frontPoints;

    resultObj.pointsFront = {
      arr: scoreF.matchArr,
      diff: diff,
      wonBy: "Top Group won front9",
      points: points,
    };
  } else if (diff < 0) {
    //console.log('diff is less means bottomGr wins front9');
    const points = diff * frontPoints;

    resultObj.pointsFront = {
      arr: scoreF.matchArr,
      diff: Math.abs(diff),
      wonBy: "Bottom Group won front9",
      points: points,
    };
  } else if (diff == 0) {
    //console.log('diff is 0 means front9 is halved');

    resultObj.pointsFront = {
      arr: scoreF.matchArr,
      diff: 0,
      wonBy: "No Group won front9",
      points: 0,
    };
  }

  //prcoessing back9
  //firstCheck whether back9 is played or not
  //get matchArr,backNineArr value at 18th hole(back9)
  const count = await this.find({
    scheduledMatchId: scheduledMatchId,
  }).select("_id");
  //console.log('count--->',count.length);
  //console.log('final obj--->',resultObj);
  if (count.length > 9) {
    //means more than 9holes played
    //so back9 concept is there
    const { backNineArr } = await this.findOne({
      scheduledMatchId: scheduledMatchId,
    })
      .select("backNineArr")
      .skip(count.length - 1)
      .limit(1);
    //console.log('break',matchArr,backNineArr);
    const diff = calDiff(backNineArr);
    if (diff > 0) {
      //console.log('diff is greater means topGr wins back9');
      const points = diff * backPoints;

      resultObj.pointsBack = {
        arr: backNineArr,
        diff: diff,
        wonBy: "Top Group won back9",
        points: points,
      };
    } else if (diff < 0) {
      //console.log('diff is less means bottomGr wins back9');
      const points = diff * backPoints;

      resultObj.pointsBack = {
        arr: backNineArr,
        diff: Math.abs(diff),
        wonBy: "Bottom Group won back9",
        points: points,
      };
    } else if (diff == 0) {
      //console.log('diff is 0 means back9 is halved');

      resultObj.pointsBack = {
        arr: backNineArr,
        diff: 0,
        wonBy: "No Group won back9",
        points: 0,
      };
    }
  } //end of if for count.length>9

  //now let us finally cal finalMatch result
  const matchData = await this.find({
    scheduledMatchId: scheduledMatchId,
  }).select("matchArr");
  //if 9 holes was there means 9th hole matchArr is final one
  //if 18 hole was there means 18th hole matchArr is final one

  //so getting last index of matchData
  const finalMatchArr = matchData.splice(-1);
  const finalDiff = calDiff(finalMatchArr[0].matchArr);
  if (finalDiff > 0) {
    //console.log('diff is greater means topGr wins overal match');
    const points = finalDiff * matchPoints;
    let totalPoints;
    if (resultObj.pointsBack !== undefined) {
      totalPoints =
        points + resultObj.pointsFront.points + resultObj.pointsBack.points;
    } else {
      totalPoints = points + resultObj.pointsFront.points;
    }

    resultObj.wonBy = {
      arr: finalMatchArr[0].matchArr,
      diff: finalDiff,
      wonBy: "Top Group won match",
      points: points,
      totalPoints: totalPoints,
    };
  } else if (finalDiff < 0) {
    //console.log('diff is less means bottomGr wins overal match');
    const points = finalDiff * matchPoints;
    let totalPoints;
    if (resultObj.pointsBack !== undefined) {
      totalPoints =
        points + resultObj.pointsBack.points + resultObj.pointsFront.points;
    } else {
      totalPoints = points + resultObj.pointsFront.points;
    }

    resultObj.wonBy = {
      arr: finalMatchArr[0].matchArr,
      diff: Math.abs(finalDiff),
      wonBy: "Bottom Group won match",
      points: points,
      totalPoints: totalPoints, //changed
    };
  } else if (finalDiff == 0) {
    //console.log('diff is 0 means overall match is halved');

    resultObj.wonBy = {
      arr: finalMatchArr[0].matchArr,
      diff: 0,
      wonBy: "No Group won the match",
      points: 0,
      totalPoints: 0,
    };
  }

  //console.log('myObj--->',resultObj);

  return resultObj;
};

ongoingMatchSchema.statics.autoPress = async function (
  holeResult,
  firstWin,
  scheduledMatchId,
  roundId
) {
  //console.log('inside autoPress',holeResult,firstWin,scheduledMatchId,roundId);

  const upBy = await this.aggregate([
    { $match: { scheduledMatchId: scheduledMatchId } },
    { $limit: 9 },
    {
      $group: {
        _id: null,
        tgUpBy: { $sum: "$tgUpBy" },
        bgUpBy: { $sum: "$bgUpBy" },
      },
    },
  ]);

  //console.log('upBy--->',upBy);

  //who won first time front9
  const { firstTimeWonBy } = await this.findOne({
    scheduledMatchId: scheduledMatchId,
  }).select("firstTimeWonBy");

  //console.log('firstTimeWonBy--->',firstTimeWonBy);

  //getting rowId
  const frontNineRounds = await this.find({
    scheduledMatchId: scheduledMatchId,
  }).select("_id");
  //check is roundId whose result we are caluclating belongs to fron9 or back9
  const rowId = frontNineRounds.findIndex((el) => {
    return el._id.toString() == roundId.toString();
  });
  //console.log('rowId',rowId);

  //getting previous rows matchArr
  let matchArr;
  if (rowId == 0) {
    matchArr = [];
  } else {
    let data = await this.find({
      scheduledMatchId: scheduledMatchId,
    })
      .skip(rowId - 1)
      .limit(1);
    //console.log('data--->',data);
    matchArr = data[0].matchArr;
    backArr = data[0].backNineArr;
  }

  //checking which fomat is beingPlayed
  let defaultArr;
  if (firstWin == 21) {
    //console.log('0,2,0 format')
    if (holeResult == 2) {
      defaultArr = [0, 2, 0];
    } else if (holeResult == 3) {
      defaultArr = [0, -2, 0];
    }
  } else if (firstWin == 31) {
    //console.log('1,1,1 format')
    if (holeResult == 2) {
      defaultArr = [1, -1, 1];
    } else if (holeResult == 3) {
      defaultArr = [-1, 1, -1];
    }
  } else if (firstWin == 51) {
    //console.log('1,1,1,1,1 format')
    if (holeResult == 2) {
      defaultArr = [1, -1, 1, -1, 1];
    } else if (holeResult == 3) {
      defaultArr = [-1, 1, -1, 1, -1];
    }
  }

  if (holeResult == 2) {
    //console.log('holeWon by topGr..')
    //hole won by topGroup
    if (upBy[0].tgUpBy == 1 && firstTimeWonBy == 2) {
      //topGr won for first time
      //console.log('topGr won for 1st time..')
      await this.updateOne(
        {
          scheduledMatchId: scheduledMatchId,
          _id: roundId,
        },
        {
          $set: {
            matchArr: defaultArr,
          },
        }
      );
    } else {
      //after firstTime won
      //console.log('secondWin topGr');
      if (rowId <= 8) {
        //playing front9
        //adding 1 to all arr elements
        matchArr = matchArr.map((el) => {
          return el + 1;
        });
        //console.log('matchArr',matchArr);
        if (matchArr.slice(-1) == 2 || matchArr.slice(-1) == -2) {
          matchArr.push(0);
        }
        //console.log('finalArr',matchArr);
        await this.findByIdAndUpdate(roundId, {
          $set: {
            matchArr: matchArr,
          },
        });
      } //end of if for rowId<=8
      else if (rowId > 8 && rowId <= 17) {
        //playing back9
        //console.log('topGr won & playing back9');
        matchArr = matchArr.map((el) => {
          return el + 1;
        });
        //console.log('matchArr',matchArr);
        if (matchArr.slice(-1) == 2 || matchArr.slice(-1) == -2) {
          matchArr.push(0);
        }
        //console.log('finalArr',matchArr);
        if (rowId == 9) {
          //means exact on 10th hole
          await this.findByIdAndUpdate(roundId, {
            $set: {
              backNineArr: defaultArr,
              matchArr: matchArr,
            },
          });
        } else {
          backArr = backArr.map((el) => {
            return el + 1;
          });
          //console.log('backArr',backArr);
          if (backArr.slice(-1) == 2 || backArr.slice(-1) == -2) {
            backArr.push(0);
          }
          await this.findByIdAndUpdate(roundId, {
            $set: {
              backNineArr: backArr,
              matchArr: matchArr,
            },
          });
        }
      }
    }
  } //end of if for holeResult==2
  else if (holeResult == 3) {
    //console.log('holeWon by bottomGr..')
    //hole won by topGroup
    if (upBy[0].bgUpBy == 1 && firstTimeWonBy == 3) {
      //topGr won for first time
      //console.log('bottom won for 1st time..')
      await this.updateOne(
        {
          scheduledMatchId: scheduledMatchId,
          _id: roundId,
        },
        {
          $set: {
            matchArr: defaultArr,
          },
        }
      );
    } else {
      //after firstTime won
      //console.log('secondWin bottomGr');
      if (rowId <= 8) {
        //playing front9
        //adding 1 to all arr elements
        matchArr = matchArr.map((el) => {
          return el - 1;
        });
        //console.log('matchArr',matchArr);
        if (matchArr.slice(-1) == 2 || matchArr.slice(-1) == -2) {
          matchArr.push(0);
        }
        //console.log('finalArr',matchArr);
        await this.findByIdAndUpdate(roundId, {
          $set: {
            matchArr: matchArr,
          },
        });
      } //end of if for rowId<=8
      else if (rowId > 8 && rowId <= 17) {
        //playing back9
        //console.log('bottomGr won & playing back9');
        matchArr = matchArr.map((el) => {
          return el - 1;
        });
        //console.log('matchArr',matchArr);
        if (matchArr.slice(-1) == 2 || matchArr.slice(-1) == -2) {
          matchArr.push(0);
        }
        //console.log('finalArr',matchArr);
        if (rowId == 9) {
          //means exact on 10th hole
          await this.findByIdAndUpdate(roundId, {
            $set: {
              backNineArr: defaultArr,
              matchArr: matchArr,
            },
          });
        } else {
          backArr = backArr.map((el) => {
            return el - 1;
          });
          //console.log('backArr',backArr);
          if (backArr.slice(-1) == 2 || backArr.slice(-1) == -2) {
            backArr.push(0);
          }
          await this.findByIdAndUpdate(roundId, {
            $set: {
              backNineArr: backArr,
              matchArr: matchArr,
            },
          });
        }
      }
    }
  } //end of if else holeresult=3
  else if (holeResult == 1) {
    //hole was halved
    //console.log('hole is halved..')
    if (rowId <= 8) {
      await this.findByIdAndUpdate(roundId, {
        $set: {
          matchArr: matchArr,
        },
      });
    } else {
      await this.findByIdAndUpdate(roundId, {
        $set: {
          matchArr: matchArr,
          backNineArr: backArr,
        },
      });
    }
  }
};

ongoingMatchSchema.statics.endAutoEarly = async function (
  roundId,
  scheduledMatchId
) {
  //console.log('roundId',roundId);
  const resultObj = {};
  const score = await this.findById(roundId).select("matchArr scoringDetails");
  const { scoringDetails } = score;
  const backPoints = scoringDetails.back;
  const frontPoints = scoringDetails.front;
  const matchPoints = scoringDetails.match;

  const calDiff = (arr) => {
    let positiveCount = 0;
    let negativeCount = 0;
    for (let el of arr) {
      if (el > 0) {
        positiveCount++;
      } else if (el < 0) {
        negativeCount++;
      }
    }
    return positiveCount - negativeCount;
  };

  //how much rounds has been played
  const data = await this.find({
    scheduledMatchId: scheduledMatchId,
    holeResult: { $in: [1, 2, 3] },
  });

  //console.log('length',data.length);

  //checking is 9thRoundPlayed or not

  const scoreF = await this.findOne({
    scheduledMatchId: scheduledMatchId,
  })
    .select("matchArr backNineArr")
    .skip(8)
    .limit(1);

  let lastData;

  if (data.length == 0) {
    //means matchis being ended on 1st round
    lastData = await this.findOne({
      scheduledMatchId: scheduledMatchId,
    }).select("matchArr backNineArr");
  } else {
    lastData = await this.findOne({
      scheduledMatchId: scheduledMatchId,
    })
      .select("matchArr backNineArr")
      .skip(data.length - 1)
      .limit(1);
  }

  let diff;
  if (scoreF) {
    //console.log('9thholewasplayed..')
    diff = calDiff(scoreF.matchArr);
  } else {
    //console.log('matchwasendedbefore9thround..')
    diff = calDiff(lastData.matchArr);
  }

  if (diff > 0) {
    //console.log('diff is greater means topGr wins front9');
    const points = diff * frontPoints;

    resultObj.pointsFront = {
      arr: scoreF.matchArr,
      diff: diff,
      wonBy: "Top Group won front9",
      points: points,
    };
  } else if (diff < 0) {
    //console.log('diff is less means bottomGr wins front9');
    const points = diff * frontPoints;

    resultObj.pointsFront = {
      arr: scoreF.matchArr,
      diff: Math.abs(diff),
      wonBy: "Bottom Group won front9",
      points: points,
    };
  } else if (diff == 0) {
    //console.log('diff is 0 means front9 is halved');

    resultObj.pointsFront = {
      arr: scoreF.matchArr,
      diff: 0,
      wonBy: "No Group won front9",
      points: 0,
    };
  }

  //processing back9
  if (data.length > 9) {
    let diff = calDiff(lastData.backNineArr);
    if (diff > 0) {
      //console.log('diff is greater means topGr wins back9');
      const points = diff * backPoints;

      resultObj.pointsBack = {
        arr: lastData.backNineArr,
        diff: diff,
        wonBy: "Top Group won back9",
        points: points,
      };
    } else if (diff < 0) {
      //console.log('diff is less means bottomGr wins back9');
      const points = diff * backPoints;

      resultObj.pointsBack = {
        arr: lastData.backNineArr,
        diff: Math.abs(diff),
        wonBy: "Bottom Group won back9",
        points: points,
      };
    } else if (diff == 0) {
      //console.log('diff is 0 means back9 is halved');

      resultObj.pointsBack = {
        arr: lastData.backNineArr,
        diff: 0,
        wonBy: "No Group won back9",
        points: 0,
      };
    }
  } //end of back9processing if

  //finalMatch process
  const finalDiff = calDiff(lastData.matchArr);
  if (finalDiff > 0) {
    //console.log('diff is greater means topGr wins overal match');
    const points = finalDiff * matchPoints;
    let totalPoints;
    if (resultObj.pointsBack !== undefined) {
      totalPoints =
        points + resultObj.pointsFront.points + resultObj.pointsBack.points;
    } else {
      totalPoints = points + resultObj.pointsFront.points;
    }

    resultObj.wonBy = {
      arr: lastData.matchArr,
      diff: finalDiff,
      wonBy: "Top Group won match",
      points: points,
      totalPoints: totalPoints,
    };
  } else if (finalDiff < 0) {
    //console.log('diff is less means bottomGr wins overal match');
    const points = finalDiff * matchPoints;
    let totalPoints;
    if (resultObj.pointsBack !== undefined) {
      totalPoints =
        points + resultObj.pointsBack.points + resultObj.pointsFront.points;
    } else {
      totalPoints = points + resultObj.pointsFront.points;
    }

    resultObj.wonBy = {
      arr: lastData.matchArr,
      diff: Math.abs(finalDiff),
      wonBy: "Bottom Group won match",
      points: points,
      totalPoints: totalPoints, //changed
    };
  } else if (finalDiff == 0) {
    //console.log('diff is 0 means overall match is halved');

    resultObj.wonBy = {
      arr: lastData.matchArr,
      diff: 0,
      wonBy: "No Group won the match",
      points: 0,
      totalPoints: 0,
    };
  }

  return resultObj;
};

ongoingMatchSchema.statics.strokePlay = async function (
  roundId,
  scheduledMatchId
) {
  //console.log('strokePlay model-->',roundId,scheduledMatchId);

  const data1 = await this.aggregate([
    {
      $match: {
        scheduledMatchId: scheduledMatchId,
        holeResult: { $in: [1, 2, 3] },
      },
    },
    { $unwind: "$players" },
    {
      $group: {
        _id: "$players.playerId",
        item: { $first: "$$ROOT.players" },
        downInSum: { $sum: "$players.downIn" },
        netSum: { $sum: "$players.net" },
        scoreSum: { $sum: "$players.score" },
        stableFordNetSum: { $sum: "$players.stableFordNet" },
        stableFordGrossSum: { $sum: "$players.stableFordGross" },
      },
    },
  ]);

  //console.log('data1-->',data1)
  //update summation of each players
  for (let data of data1) {
    //console.log('oop-->',typeof(data._id),data._id,data.downInSum)

    await this.findOneAndUpdate(
      {
        _id: roundId,
        players: { $elemMatch: { playerId: data._id } },
      },
      {
        $set: {
          "players.$.downInSum": data.downInSum,
          "players.$.netSum": data.netSum,
          "players.$.scoreSum": data.scoreSum,
          "players.$.stableFordNetSum": data.stableFordNetSum,
          "players.$.stableFordGrossSum": data.stableFordGrossSum,
        },
      }
    );
  } //end of loop

  return data1;
};

ongoingMatchSchema.statics.calFinalResultStroke = async function (
  scheduledMatchId,
  groupOptionsSeqId
) {
  //console.log('final result strokePlay..',groupOptionsSeqId);
  const resultObj = {};
  const data = await this.find({
    scheduledMatchId: scheduledMatchId,
  }).select("players scoringFormat scoringDetails");

  //getting lastround value
  const data1 = data.slice(-1);

  resultObj.players = data1[0].players;
  resultObj.scoringDetails = data1[0].scoringDetails;
  resultObj.scoringFormat = data1[0].scoringFormat;

  //deciding top&bottom teams based on groupSeqId
  const topGr = [];
  const bottGr = [];

  //logic for [2vs2]
  if (groupOptionsSeqId == 1) {
    //console.log('inside if1')
    for (let player of data1[0].players) {
      if (player.playerSeqId == 1 || player.playerSeqId == 2) {
        topGr.push(player.scoreSum);
      } else {
        bottGr.push(player.scoreSum);
      }
    } //loop end
  }

  //logic for [1vs1]
  if (groupOptionsSeqId == 2) {
    //console.log('inside if2')
    for (let player of data1[0].players) {
      if (player.playerSeqId == 1) {
        topGr.push(player.scoreSum);
      } else {
        bottGr.push(player.scoreSum);
      }
    } //loop end
  }

  //sum of topGr scoreSum
  const topGrSum = topGr.reduce((acc, cr) => {
    return acc + cr;
  }, 0);

  //sum of bottGr scoreSum
  const bottGrSum = bottGr.reduce((acc, cr) => {
    return acc + cr;
  }, 0);

  //console.log('summation',topGrSum,bottGrSum);
  const diff = topGrSum - bottGrSum;
  const points = diff * data1[0].scoringDetails.pointsPerStroke;
  const calStructure = `${Math.abs(diff)}*points`;
  if (diff > 0) {
    //console.log('diff',diff,'topGr Wins',resultObj);
    resultObj.wonBy = {
      message: `Top Group won the match by ${Math.abs(diff)} strokes`,
      points: Math.abs(points),
      calStructure,
    };
  } else if (diff < 0) {
    //console.log('diff',diff,'bottGr Wins',resultObj);
    resultObj.wonBy = {
      message: `Bottom Group won the match by ${Math.abs(diff)} strokes`,
      points: Math.abs(points),
      calStructure,
    };
  } else if (diff == 0) {
    //console.log('diff',diff,'No Gr Wins',resultObj);
    resultObj.wonBy = {
      message: `No Group won the match.`,
      points: 0,
      calStructure: 0,
    };
  }

  return resultObj;
};

ongoingMatchSchema.statics.calFinalResultStableFord = async function (
  scheduledMatchId,
  groupOptionsSeqId
) {
  //console.log("stableFord", scheduledMatchId, groupOptionsSeqId);
  const resultObj = {};
  const data = await this.find({
    scheduledMatchId: scheduledMatchId,
  }).select("players scoringFormat scoringDetails");

  const keywords = await this.aggregate([
    {
      $match: {
        scheduledMatchId: scheduledMatchId,
        holeResult: { $in: [1, 2, 3] },
      },
    },
    { $unwind: "$players" },
    {
      $group: {
        _id: {
          player: "$players.playerId",
          score: "$players.score",
        },
        countScore: { $sum: 1 },
      },
    },
  ]);

  //getting lastround value
  const data1 = data.slice(-1);

  resultObj.players = data1[0].players;
  resultObj.scoringDetails = data1[0].scoringDetails;
  resultObj.scoringFormat = data1[0].scoringFormat;
  resultObj.keywords = keywords;

  //deciding top&bottom teams based on groupSeqId
  const topGr = [];
  const bottGr = [];

  //logic for [2vs2]
  if (groupOptionsSeqId == 1) {
    //console.log("inside if1");
    for (let player of data1[0].players) {
      if (player.playerSeqId == 1 || player.playerSeqId == 2) {
        topGr.push(player.stableFordNetSum);
      } else {
        bottGr.push(player.stableFordNetSum);
      }
    } //loop end
  }

  //logic for [1vs1]
  if (groupOptionsSeqId == 2) {
    //console.log('inside if2')
    for (let player of data1[0].players) {
      if (player.playerSeqId == 1) {
        topGr.push(player.stableFordNetSum);
      } else {
        bottGr.push(player.stableFordNetSum);
      }
    } //loop end
  }

  //sum of topGr stableFordNetSum
  const topGrSum = topGr.reduce((acc, cr) => {
    return acc + cr;
  }, 0);

  //sum of bottGr stableFordNetSum
  const bottGrSum = bottGr.reduce((acc, cr) => {
    return acc + cr;
  }, 0);

  const diff = topGrSum - bottGrSum;
  const points = diff * data1[0].scoringDetails.pointsPerPoint;
  const calStructure = `${Math.abs(diff)}*${
    data1[0].scoringDetails.pointsPerPoint
  }`;

  if (diff > 0) {
    //console.log('diff',diff,'topGr Wins',resultObj);
    resultObj.wonBy = {
      message: `Top Group won the match by ${Math.abs(diff)} points`,
      points: Math.abs(points),
      calStructure,
    };
  } else if (diff < 0) {
    //console.log('diff',diff,'bottGr Wins',resultObj);
    resultObj.wonBy = {
      message: `Bottom Group won the match by ${Math.abs(diff)} points`,
      points: Math.abs(points),
      calStructure,
    };
  } else if (diff == 0) {
    //console.log('diff',diff,'No Gr Wins',resultObj);
    resultObj.wonBy = {
      message: `No Group won the match.`,
      points: 0,
      calStructure: 0,
    };
  }

  return resultObj;
};

const ongoingMatch = mongoose.model("ongoingMatch", ongoingMatchSchema);

module.exports = ongoingMatch;
