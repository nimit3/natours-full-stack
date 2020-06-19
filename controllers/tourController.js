const Tour = require(`../models/tourModel`);

const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');

//const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,difficulty,summary';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  //final execution of query
  //chaining all queries because we return this in all those methods
  const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();
  const tours = await features.query;
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

//responding to the URL parameters to get the specific tourd info with ID directly
exports.getTour = catchAsync(async (req, res, next) => {
  //  console.log(req.params);
  //  const id = req.params.id * 1; //for converting string to number. nice trick
  const tour = await Tour.findById(req.params.id);
  //breakdown Tour.findOne({ __id: req.parms.id })
  //no tour means null(changing last digit only of fid and we would get null in result. so deal with it)
  if (!tour) {
    return next(new AppError('NO tour found with that id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

//post some new tours data API
exports.createTour = catchAsync(async (req, res, next) => {
  //console.log(req.body);
  //first way through which we saved data in DB
  //const newTour = new Tour({});
  //newTour.save()

  //second eay way
  const newTour = await Tour.create(req.body);
  //console.log(newTour);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

//patach request for updatin some data
exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    //new: true will retutn actual updated the latest data in the return
    //runvalidators will check that the data that we are sending match the schema or not(ex - if datatype not matched then it will thwor an error)
  });

  if (!tour) {
    return next(new AppError('NO tour found with that id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

//deleting some resource
exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError('NO tour found with that id', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

//aggregation pipeline function
//we arite an array which has all diff stages. Then each those stages is actually an object
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: {
          $gte: 4.5,
        },
      },
    },
    {
      $group: {
        _id: {
          $toUpper: '$difficulty',
        }, //group by similar
        numRatings: {
          $sum: '$ratingsQuantity',
        },
        numTours: {
          $sum: 1,
        }, //one will be added each time
        avgrating: {
          $avg: '$ratingsAverage',
        },
        avgPrice: {
          $avg: '$price',
        },
        minPrice: {
          $min: '$price',
        },
        maxPrice: {
          $max: '$price',
        },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
    /* will exlcude easy tour.
    {
      $match: { _id: { $ne: 'EASY' } },
    },
    */
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; //2021

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates', //this will destrcture array elements  all those 3 dates will come in one result and then 1 orignal resul = 3 result
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: {
          $month: '$startDates',
        },
        numTourStarts: {
          $sum: 1,
        },
        tours: {
          $push: '$name',
        },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0, //it will not sho up the id in api result
      },
    },
    {
      $sort: {
        numTourStarts: -1,
      },
    },
    {
      $limit: 6,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
