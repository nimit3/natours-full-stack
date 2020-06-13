/* eslint-disable prefer-template */
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

//simply creating modeling data with diff attr like required, default etc
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        //string's max length for data validation
        maxlength: [40, 'A tour name must have less or equal than 40 chars'],
        minlength: [10, 'A tour name must have more or equal than 10chars'],
        //validate: [validator.isAlpha, 'Tour name must only contain chars'],
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have duration'],
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size'],
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty must be either easy or medium or difficult!'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be at leat 1.0 or above'],
        max: [5, 'A rating cannot exceed value of 5']
    },
    ratingsQuantity: {
        type: Number,
        default: 0,
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price'],
    },
    //our own validator to check that discount price must be lower than actual price
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                //this only works while creating new data. for update it will not work
                return val < this.price; //100 <200 ==== return true
            },
            message: 'Discount price ({VALUE}) must be below the regular price!'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description'],
    },
    description: {
        type: String,
        trim: true,
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false, //will hide the output permannetly
    },
    startDates: [Date],
    //ex ho to use query middleware in mongoose
    secretTour: {
        type: Boolean,
        default: false,
    },
}, {
    //this is for options for schema(virtual flieds etc). we can use find methods for finding this in query too. its just for saving some unimportant data
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    },
});

////////////////////////////DOCUMENT MIDDLEWARE/////////////
//defining virtual properties which will not persist data
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7; //normal function so this keyword can have inner function scope
});

//monggose middleware document
//it means below will run beofore save() and create(). it will not run before insertmany
tourSchema.pre('save', function (next) {
    //console.log(this); //this will print whole new data with virtual function before it gets created
    this.slug = slugify(this.name, {
        lower: true
    });
    next();
});

// //we can use 2 pre middleware too.
// tourSchema.pre('save', function (next) {
//   console.log('will save document...');
//   next();
// });

// //here we will use doc. so doc menas it will have finished object. we can use that to modify thaty object
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

//////////////////////////QUERY MIDDLEWARE//////////////////////////
tourSchema.pre(/^find/, function (next) {
    this.find({
        secretTour: {
            $ne: true
        }
    });

    this.start = Date.now();
    next();
});

tourSchema.post(/^find/, function (docs, next) {
    console.log(`query took ${Date.now() - this.start} milliseconds`);
    //console.log(docs);
    next();
});

//////////////////////////AGGREGATION MIDDLEWARE////////////////////////
tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({
        $match: {
            sectretTour: {
                $ne: true
            }
        }
    })
    next();
});

//creating a new mode from upper schema
//syntax for ceating a model('name of the model', schema_name)
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;