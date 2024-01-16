const router = require('express').Router();
const { validationUserInfo } = require('../middlewares/validation');
const {
  updateUserInfo, getMyUser,
} = require('../controllers/users');

router.get('/me', getMyUser);
router.patch('/me', validationUserInfo, updateUserInfo);

module.exports = router;
