const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

//name, email, photo(string), password, passwordConfirm

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'A user must enter a valid email id!'],
    unique: true,
    lowercase: true,
    //npm 3rd party library for validation
    validate: [validator.isEmail, 'Please enter the valid email!'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'A user must enter a password'],
    minlength: [5, 'password must be more than 5 chars'],
  },
  passwordConfirm: {
    type: String,
    required: [true, 'password must be same as orignal entered password'],
    validate: {
      //this will only work on CREATE and SAVE method. (basically when we create new user only).
      validator: function (el) {
        return el === this.password; //this will compare both password and validate
      },
      message: 'password are not the same!',
    },
  },
});

//document mongoose middleware which will encrypt password before sving the data in DB
userSchema.pre('save', async function (next) {
  //isModified('field__name') is a methods which will check that whether the field name that we wrote in args has modified or not
  //if password is not modified then return from the fn and do nothing. t will only run when pass is modified
  if (!this.isModified('password')) return next();

  //encrypting password using hasing algo using bcrypt js npm packagee
  this.password = await bcrypt.hash(this.password, 12); //secong args is called as a cost paramter. defalut value is 10. more value means more intense cpu process will be and better encrypt password

  this.passwordConfirm = undefined; //so password in DB will not be persisted. (deleting so in DB no one can see the password)
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
