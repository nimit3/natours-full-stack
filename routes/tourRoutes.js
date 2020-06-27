const express = require('express');

const tourController = require(`../controllers/tourController`);
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

//creating a munting so all getall tours can be saved in on router and other with specific id can be saved in another var
const router = express.Router(); //this will work as a middleware

////////////////NESTED ROUTES  (review child of tour---- it works with parent child referencing mostly)
//while creating a review we want to pass tour id automatically with the url and user id will come from currently logged in user's
//ex url POST /tour/id_of_tour/reviews
//same will be for GET /tour/tour_id/reviews
// GET /tour/tour_id/reviews/review_id

//mounting a router
router.use('/:tourId/reviews', reviewRouter);

//app.get("/api/v1/tours", getAllTours);
//app.route("api/v1/tours").get(getAllTours).post(createTour); we can use like this directly in app.js

//param middleware for getting the value of id whetehr its valid in our database or not
//router.param("id", tourController.checkID);

//TOURS route
router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

//geosspeical routes
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
//tour-distance/233/center/-40,45/unit/km

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

//creating a middleware fn for protecting getalltour routes
router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );
//we can attach 2 middleware function to same request too. here first checkbody will be executed and then createtour gets executed
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
