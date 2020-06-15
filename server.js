const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.ATLAS_URL.replace('<PASSWORD>', process.env.ATLAS_PWD);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log('DB Connection Successful!');
  });

//1- Start Server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

//Maneja el Rejection de todas las Promise que tienen Rejection
process.on('unhandledRejection', (err) => {
  console.error('!!!UNHANDLED REJETION!!! - - - - - - Shutting Down....');
  console.error(err.name, err.message);
  //Espera que el server termine todos sus procesos y luego si termina el proceso
  server.close(() => {
    process.exit(1);
  });
});

//Maneja las Excepciones no capturadas
process.on('uncaughtException', (err) => {
  console.error('!!!UNHANDLED EXCEPTION!!! - - - - - - Shutting Down....');
  console.error(err);
  //Espera que el server termine todos sus procesos y luego si termina el proceso
  server.close(() => {
    process.exit(1);
  });
});
