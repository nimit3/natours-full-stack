const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNHANDLED EXCEPTION 😥 SHUTTING DOWN!');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({
  path: './config.env',
});
const app = require('./app');
//console.log(process.env);
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

//setting up moongose connection with default properties
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    //console.log(con.connections);
    console.log('DB connection successful!');
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${process.env.port}😊!`);
});

//all unhandled rejection which cannot be caought in our application main code, will get caught here.
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION 😥 SHUTTING DOWN!');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

//for herkou
process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED. Shutting down gracefully🔥');
  server.close(() => {
    console.log('🔥 Process terminated!');
  });
});
