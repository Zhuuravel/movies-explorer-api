const router = require('express').Router();
const {
  validationAddMovie, validationDeleteMovie,
} = require('../middlewares/validation');
const {
  getMyMovies, addMovie, deleteMovie,
} = require('../controllers/movies');

router.get('/', getMyMovies);
router.post('/', validationAddMovie, addMovie);
router.delete('/:movieId', validationDeleteMovie, deleteMovie);

module.exports = router;
