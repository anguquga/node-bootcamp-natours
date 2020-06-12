class APIFeatures {
  constructor(query, queryString) {
    this.queryString = queryString;
    this.query = query;
  }

  filter(){
    //Filtering
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    //Advance Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  };

  sort(){
    if (this.queryString.sort) {
      this.query = this.query.sort(this.queryString.sort.split(',').join(' ')); //sort=price,ratingsAvg en el QueryString
    } else {
      this.query = this.query.sort('-createdAt'); //Ordernarlo por createdAt descendente
    }
    return this;
  };

  limitFields(){
    if (this.queryString.fields) {
      this.query = this.query.select(this.queryString.fields.split(',').join(' ')); //fields=name,duration etc
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  };

  paginate(){
    const limit = this.queryString.limit * 1 || 100;
    const page = this.queryString.page * 1 || 1;
    const skip = (page - 1) * limit;
    /*let numTours;
    (async () => {
      numTours = await this.query.countDocuments() ;
    })();
    if (skip >= numTours) throw new Error('This page doesnt exist');*/ //TODO Ajustar
    this.query = this.query.skip(skip).limit(limit);
    return this;
  };
}

module.exports = APIFeatures;