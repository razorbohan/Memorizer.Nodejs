const express = require('express');
const router = express.Router();
const homeController = require('../controllers/home');

router.get('/', homeController.getIndex);
router.get('/Mode/:mode', homeController.switchMode);
router.get('/GetMemos', homeController.getMemos);
router.post('/SubmitAnswer', homeController.postAnswer);
router.post('/Update', homeController.update);
router.post('/Add', homeController.add);
router.post('/Delete/:id', homeController.delete);
router.get('/Find/:key?/:value?', homeController.find);

module.exports = router;