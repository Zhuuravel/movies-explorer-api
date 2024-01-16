const router = require('express').Router();
const {
  validationSignup, validationSignin,
} = require('../middlewares/validation');
const {
  registration, login,
} = require('../controllers/users');
const { auth } = require('../middlewares/auth');
const userRoutes = require('./users');
const movieRoutes = require('./movies');

router.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

router.post('/signup', validationSignup, registration);
router.post('/signin', validationSignin, login);

router.use(auth);

router.use('/users', userRoutes);
router.use('/movies', movieRoutes);

module.exports = router;
