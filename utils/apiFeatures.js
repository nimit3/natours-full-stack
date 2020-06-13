class APIFeatures {
    constructor(query, queryString) {
        this.query = query; //Tour.find()
        this.queryString = queryString; //req.query()
    }

    filter() {
        //1 a) basic filtering
        const queryObj = {
            ...this.queryString
        };
        const excludeFileds = ['page', 'sort', 'limit', 'fields'];
        excludeFileds.forEach((el) => delete queryObj[el]);

        //1 b) advnace filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        //console.log(JSON.parse(queryStr));

        //console.log(req.query); //api/v1/tours/?duration[gte]=5&difficulty=easy ===
        //  { difficulty: 'easy', duration: { gte: '5' } } will be the answer //"$" sign is missing in gte
        //  { difficulty : 'easy' , duration: { $gte: 5 } } basic query in mongodb
        //we want to replace this gte, gt, lt, lte

        this.query = this.query.find(JSON.parse(queryStr));
        //let query = Tour.find(JSON.parse(queryStr));
        return this;
    }

    sort() {
        if (this.queryString.sort) {
            //console.log(req.query.sort) return 'field para through which we want to sort'
            //for double filter ex query.sort('days price)
            const sortBy = this.queryString.sort.split(',').join(' ');
            //console.log(sortBy)
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            //console.log(this.queryString.fields);
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v'); // '-field_name' ==== exlcude that specific field
        }
        return this;
    }

    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;

        //page=3&limit=10 , if 1-10, page 1,  11-20 page-2, 21-30 page 3
        this.query = this.query.skip(skip).limit(limit);

        return this;
    }

}

module.exports = APIFeatures;