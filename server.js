const dotenv = require("dotenv");

dotenv.config({
    path: `${__dirname}/config.env`
});
const app = require("./app");
//console.log(process.env);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App running on port ${process.env.port}😊!`);
});