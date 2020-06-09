const fs = require("fs");

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

//creating new middleware function
//this will check in all getuser, patch and delete request that if someone enters no like user/42424 which is not in our data then throw error
exports.checkID = (req, res, next, val) => {
    console.log(`Tour id is: ${val}`);

    if (req.params.id * 1 > tours.length) {
        return res.status(404).json({
            status: "fail",
            message: "Inavalid ID",
        });
    }
    next();
};

//creating another middleware function for post createtour to check whether it contains name and price property in response. if not then send error in json response
exports.checkBody = (req, res, next) => {
    if (!req.body.name || !req.body.price) {
        return res.status(400).json({
            status: "fail",
            message: "Missing name or price",
        });
    }
    next();
};

exports.getAllTours = (req, res) => {
    console.log(req.requestTime);
    res.status(200).json({
        status: "success",
        requestedAt: req.requestTime,
        results: tours.length,
        data: {
            tours,
        },
    });
};

//responding to the URL parameters to get the specific tourd info with ID directly
exports.getTour = (req, res) => {
    console.log(req.params);

    //getting id from URl and getting that specific data from json data
    const id = req.params.id * 1; //for converting string to number. nice trick

    const tour = tours.find((el) => el.id === id);

    //for checking if user input is valid number in our data or not
    // soultion 1
    //if (id > tours.length) {
    //solution 2 if it couldn't find the tour in our data
    if (!tour) {
        return res.status(404).json({
            status: "fail",
            message: "Inavalid ID",
        });
    }

    res.status(200).json({
        status: "success",
        data: {
            tour,
        },
    });
};

//post some new tours data API
exports.createTour = (req, res) => {
    //console.log(req.body);

    const newID = tours[tours.length - 1].id + 1;
    //object.assingn syntax ===== let newobject = Object.assign(target, source). it will copy all source properties to the source object
    // eslint-disable-next-line prefer-object-spread
    const newTour = Object.assign({
        id: newID
    }, req.body);

    tours.push(newTour);

    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), (err) => {
        res.status(201).json({
            status: "success",
            data: {
                tour: newTour,
            },
        });
    });
};

//patach request for updatin some data
exports.updateTour = (req, res) => {
    res.status(200).json({
        status: "success",
        data: {
            tour: "<Updated tour here...>",
        },
    });
};

//deleting some resource
exports.deleteTour = (req, res) => {
    res.status(204).json({
        status: "success",
        data: null,
    });
};