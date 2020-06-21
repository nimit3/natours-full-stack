const express = require('express');

const tourController = require(`../controllers/tourController`);
const authController = require('../controllers/authController');

//creating a munting so all getall tours can be saved in on router and other with specific id can be saved in another var
const router = express.Router(); //this will work as a middleware

//app.get("/api/v1/tours", getAllTours);
//app.route("api/v1/tours").get(getAllTours).post(createTour); we can use like this directly in app.js

//param middleware for getting the value of id whetehr its valid in our database or not
//router.param("id", tourController.checkID);

//TOURS route
router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

//creating a middleware fn for protecting getalltour routes
router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);
//we can attach 2 middleware function to same request too. here first checkbody will be executed and then createtour gets executed
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
