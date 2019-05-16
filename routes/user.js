const express = require('express');
const router = express.Router();
const auth = require('../middleware/authentication');
const userController = require('../controllers/user');

router.get('/Login', userController.getLogin);
router.post('/Login', userController.postLogin);
router.get('/Signup', userController.getSignup);
router.post('/Signup', userController.postSignup);
router.all('/Logout', auth.isAuthenticated, userController.logout);

router.get('/Profile', auth.isAuthenticated, userController.getManage);
router.post('/Profile', auth.isAuthenticated, userController.postManage);
router.get('/Profile/ChangePassword', auth.isAuthenticated, userController.getChangePassword);
router.post('/Profile/ChangePassword', auth.isAuthenticated, userController.postChangePassword);
router.get('/Profile/ExternalLogins', auth.isAuthenticated, userController.getExternalLogins);
router.post('/Profile/ExternalLogins/Remove', auth.isAuthenticated, userController.postRemoveExternalLogin);

router.get('/Login/Vkontakte', userController.getExternal('vkontakte'));
router.get('/Login/Vkontakte/callback', userController.getExternalCallback('vkontakte'));
router.get('/Login/Facebook', userController.getExternal('facebook'));
router.get('/Login/Facebook/callback', userController.getExternalCallback('facebook'));

module.exports = router;