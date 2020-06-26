const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { route } = require('./reviewRoutes');

const router = express.Router(); //middleware for user routing

router.get('/me', authController.protect, userController.getMe, userController.getUser);

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//so after before 4 routes which are technically middleware once run then below code will be executed. It means that authcontroller.protect will apply to all the middleware router which will be called next(aftet that line) middleware. ex patch,delete etc
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);
// router.patch('/updateMyPassword', authController.protect, authController.updatePassword);

router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

//protecting the routes of creating, deleting, updating user for admin only
router.use(authController.restrictTo('admin'));

router.route('/').get(userController.getAllUsers).post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
