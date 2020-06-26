//create a function that will return a function which will look like a add, deleter, update controller function
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('NO doc found with that id', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      //new: true will retutn actual updated the latest data in the return
      //runvalidators will check that the data that we are sending match the schema or not(ex - if datatype not matched then it will thwor an error)
    });

    if (!doc) {
      return next(new AppError('NO doc found with that id', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    //console.log(req.body);
    //first way through which we saved data in DB
    //const newTour = new Tour({});
    //newTour.save()

    //second eay way
    const doc = await Model.create(req.body);
    //console.log(newTour);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    //  console.log(req.params);
    //  const id = req.params.id * 1; //for converting string to number. nice trick
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    //breakdown Tour.findOne({ _id: req.parms.id })
    //no tour means null(changing last digit only of fid and we would get null in result. so deal with it)
    if (!doc) {
      return next(new AppError('NO document found with that id', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //to allow for nested GET reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    //final execution of query
    //chaining all queries because we return this in all those methods
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    //for getting query statistics we can use explaing at the end and see query stats in the o/p in postman
    //const doc = await features.query.explain();
    const doc = await features.query;
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
