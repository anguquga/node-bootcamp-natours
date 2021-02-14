const dotenv = require('dotenv');
const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('./../../models/tourModel');

dotenv.config({ path: `${__dirname}/../../config.env` });

const DB = process.env.ATLAS_URL.replace('<PASSWORD>', process.env.ATLAS_PWD);
mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(() => {
  console.log('DB Connection Successful!');
});

//Read JSON
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

//import data
const importData = async () => {
  try{
    await Tour.create(tours);
    console.log('Data Success');

  }catch(err){
    console.log(err);
  }
  process.exit();
}

//Delete all Data
const deleteData = async () => {
  try{
    await Tour.deleteMany();
    console.log('Data Deleted Successfully');

  }catch(err){
    console.log(err);
  }
  process.exit();
}

if(process.argv[2] === '--import'){
  importData();
}else if(process.argv[2] === '--delete'){
  deleteData();
}


console.log(process.argv);