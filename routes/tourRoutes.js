const express = require("express");

const tourController = require(`./../controllers/tourController`);

//creating a munting so all getall tours can be saved in on router and other with specific id can be saved in another var
const router = express.Router(); //this will work as a middleware

//app.get("/api/v1/tours", getAllTours);
//app.route("api/v1/tours").get(getAllTours).post(createTour);

//param middleware for getting the value of id whetehr its valid in our database or not
router.param("id", tourController.checkID);

//TOURS route
router
    .route("/")
    .get(tourController.getAllTours)
    .post(tourController.checkBody, tourController.createTour);
//we can attach 2 middleware function to same request too. here first checkbody will be executed and then createtour gets executed
router
    .route("/:id")
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour);

module.exports = router;