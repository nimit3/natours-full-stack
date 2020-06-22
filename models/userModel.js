const crypto = require('crypto');
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
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'A user must enter a password'],
    minlength: [5, 'password must be more than 5 chars'],
    select: false, //this means it will not show password filed when we return the data once we try to get this in some other query. ex(finding. ex creating tokens to users we want to see pass that its correct or not. so we will use explicitly select over there.)
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
  passwordChangedAt: Date,
  passwordresetToken: String,
  passwordresetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

//document mongoose middleware which will encrypt password before sving the data in DB
userSchema.pre('save', async function (next) {
  //isModified('field__name') is a methods which will check that whether the field name that we wrote in args has modified or not
  //if password is not modified then return from the fn and do nothing. t will only run when pass is modified
  if (!this.isModified('password')) return next();

  //encrypting password using hasing algo using bcrypt js npm package
  this.password = await bcrypt.hash(this.password, 12); //secong args is called as a cost paramter. defalut value is 10. more value means more intense cpu process will be and better encrypt password

  this.passwordConfirm = undefined; //so password in DB will not be persisted. (deleting so in DB no one can see the password)
  next();
});

//updating passwordChaneggdat prop while resetting password doucment middleware on save
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; //deducting 1 min just so new token is not assigned while resetiing password before data gets entered into the DB
  next();
});

userSchema.pre(/^find/, function (next) {
  //this will point to current find of any query
  this.find({ active: { $ne: false } });
  next();
});

//instance method. which will be available for all documents for certail collection. decrypted passsword once again so we can compare it when we log in
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  //this.password which refers to the current obj will not be avail because we have default it with select: false in our schema
  //goal of function. return true if pass is correct. false if its incorrect
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  //if use has not changed pass then this.passwordchangedAt will always be false
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10); ///1000 means convert into seconds(from ms)

    console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp; //100 < 200
  }
  //false menas password not changed.
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  //generate random token using built in express module crypto
  const resetToken = crypto.randomBytes(32).toString('hex');

  //save that data in the schema field(passwordResetToken)
  this.passwordresetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  //console.log({ resetToken }, this.passwordresetToken);

  //set now reset passsword exipary timing
  this.passwordresetExpires = Date.now() + 10 * 60 * 1000; //10 minutes

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
