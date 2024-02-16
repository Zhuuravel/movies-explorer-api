require('dotenv').config();
const mongoose = require('mongoose').default;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = process.env;
const {
  STATUS_CREATED,
  STATUS_OK,
} = require('../errors/status');
const User = require('../models/users');

const { CastError, ValidationError } = mongoose.Error;
const NotFound = require('../errors/NotFound');
const BadRequest = require('../errors/BadRequest');
const ConflictingRequest = require('../errors/ConflictingRequest');

module.exports.registration = (req, res, next) => {
  const {
    email, password, name,
  } = req.body;
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      throw err;
    }
    User.create({
      email, password: hash, name,
    }).then(() => res.status(STATUS_CREATED).send({
      email, name,
    }))
      .catch((error) => {
        if (error instanceof ValidationError) {
          next(new BadRequest('При регистрации пользователя произошла ошибка.'));
        } else if (error.code === 11000) {
          next(new ConflictingRequest('Пользователь с таким email уже существует.'));
        } else {
          next(error);
        }
      });
  });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
      // res.cookie('jwt', token, {
      //   maxAge: 3600000,
      //   httpOnly: true,
      // });
      return res.status(STATUS_OK).send({ token });
    })
    .catch((err) => {
      if (err instanceof ValidationError) {
        next(new BadRequest('Вы ввели неправильный логин или пароль.'));
      } next(err);
    });
};

module.exports.getMyUser = (req, res, next) => {
  const userId = req.user._id;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        next(new NotFound(`Пользователь по id: ${req.params.userId} не найден`));
      } return res.status(STATUS_OK).send(user);
    })
    .catch(next);
};

module.exports.updateUserInfo = (req, res, next) => {
  const { email, name } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { email, name },
    {
      new: true, // обработчик then получит на вход обновлённую запись
      runValidators: true, // данные будут валидированы перед изменением
    },
  )
    .then((user) => res.status(STATUS_OK).send(user))
    .catch((err) => {
      if (err instanceof CastError) {
        next(new BadRequest('При обновлении профиля произошла ошибка.'));
      } else if (err.code === 11000) {
        next(new ConflictingRequest('Пользователь с таким email уже существует.'));
      } else {
        next(err);
      }
    });
};
