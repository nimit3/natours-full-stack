const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) get All Tour data from the collection
  const tours = await Tour.find();

  // 2) BUild template of tour data

  // 3) render that template using tour data from 1 step

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = (req, res) => {
  res.status(200).render('tour', {
    title: 'the Forest Hiker Tour',
  });
};
