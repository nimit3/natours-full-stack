const Tour = require(`../models/tourModel`);

const APIFeatures = require('../utils/apiFeatures');

//const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,difficulty,summary';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    //final execution of query
    //chaining all queries because we return this in all those methods
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'Something wrong with query!😥',
    });
  }
};

//responding to the URL parameters to get the specific tourd info with ID directly
exports.getTour = async (req, res) => {
  try {
    //  console.log(req.params);
    //  const id = req.params.id * 1; //for converting string to number. nice trick
    const tour = await Tour.findById(req.params.id);
    //breakdown Tour.findOne({ __id: req.parms.id })

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      mmessage: 'Invalid query!',
    });
  }
};

//post some new tours data API
exports.createTour = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      mmessage: err,
    });
  }
};

//patach request for updatin some data
exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      //new: true will retutn actual updated the latest data in the return
      //runvalidators will check that the data that we are sending match the schema or not(ex - if datatype not matched then it will thwor an error)
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      mmessage: 'somethring wrong with query!',
    });
  }
};

//deleting some resource
exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      mmessage: err,
    });
  }
};

//aggregation pipeline function
//we arite an array which has all diff stages. Then each those stages is actually an object
exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([{
        $match: {
          ratingsAverage: {
            $gte: 4.5
          }
        },
      },
      {
        $group: {
          _id: {
            $toUpper: '$difficulty'
          }, //group by similar
          numRatings: {
            $sum: '$ratingsQuantity'
          },
          numTours: {
            $sum: 1
          }, //one will be added each time
          avgrating: {
            $avg: '$ratingsAverage'
          },
          avgPrice: {
            $avg: '$price'
          },
          minPrice: {
            $min: '$price'
          },
          maxPrice: {
            $max: '$price'
          },
        },
      },
      {
        $sort: {
          avgPrice: 1
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
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1; //2021

    const plan = await Tour.aggregate([{
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
            $month: '$startDates'
          },
          numTourStarts: {
            $sum: 1
          },
          tours: {
            $push: '$name'
          },
        },
      },
      {
        $addFields: {
          month: '$_id'
        },
      },
      {
        $project: {
          _id: 0, //it will not sho up the id in api result
        },
      },
      {
        $sort: {
          numTourStarts: -1
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
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};