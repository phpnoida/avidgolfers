const express=require('express');
const controller=require('./../controllers/handicap');

const router=express.Router({mergeParams:true});

router.route('/create').post(controller.createHandicap);
router.route('/:memberId/getone').get(controller.individualRoundDetails);
router.route('/getAll').get(controller.getAll);
router.route('/:handicapId/:playerId/update').patch(controller.updateIndividualRoundDetails);
//settings route
router.route('/settings').get(controller.getSettings)
router.route('/settings').patch(controller.updateSettings);

module.exports=router;