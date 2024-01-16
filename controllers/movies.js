const mongoose = require('mongoose').default;
const Movie = require('../models/movies');
const {
  STATUS_CREATED,
  STATUS_OK,
} = require('../errors/status');
const NotFound = require('../errors/NotFound');
const BadRequest = require('../errors/BadRequest');
const Forbidden = require('../errors/Forbidden');

const { ValidationError } = mongoose.Error;

module.exports.getMyMovies = (req, res, next) => {
  const userId = req.user._id;
  Movie.find({ owner: userId })
    .then((movies) => res.status(STATUS_OK).send(movies))
    .catch(next);
};

module.exports.addMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner = req.user._id,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner,
  })
    .then((movie) => {
      Movie.findById(movie._id)
        .then((movies) => res.status(STATUS_CREATED).send(movies));
    })
    .catch((err) => {
      if (err instanceof ValidationError) {
        next(new BadRequest('Некорректные данные при добавлении фильма'));
      } next(err);
    });
};

module.exports.deleteMovie = (req, res, next) => Movie.findById(req.params.movieId)
  .then((movie) => {
    const userId = req.user._id;
    if (!movie) {
      next(new NotFound(`Фильм с указанным id: ${req.params.movieId} не найден`));
    } if (!movie.owner.equals(userId)) {
      next(new Forbidden('Попытка удалить чужой фильм!'));
    } Movie.deleteOne(movie)
      .then(() => res.status(STATUS_OK).send(movie));
  })
  .catch((err) => {
    if (err instanceof ValidationError) {
      next(new BadRequest('Некорректные данные при добавлении фильма'));
    } next(err);
  });
