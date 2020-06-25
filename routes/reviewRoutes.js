const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
const { route } = require('./tourRoutes');

//mergeparams: true. just so reviewrouter can get tourId from tourroutes
//each paramters has access to their specific routes but with mergeparams we can access it from early router in middleware
//ex url POST /tour/id_of_tour/reviews
// GET /tour/tour_id/reviews/review_id
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

module.exports = router;
