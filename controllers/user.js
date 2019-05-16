const passport = require('../config/passport');
const arrays = require('../models/arrays');
const User = require('../models/user');

exports.getLogin = (req, res) =>
    res.render('user/login', {
        message: req.flash('error'),
        loginProviders: arrays.loginProviders
    });
exports.postLogin = passport.authenticate('login', {
    successReturnToOrRedirect: '/Home',
    failureRedirect: '/User/Login',
    failureFlash: true
});

exports.getSignup = (req, res) => {
    res.render('user/register', {
        message: req.flash('error')
    });
};
exports.postSignup = passport.authenticate('signup', {
    successReturnToOrRedirect: '/Home',
    failureRedirect: '/User/Signup',
    failureFlash: true
});

exports.logout = (req, res) => {
    req.logOut();
    res.redirect('/');
};

exports.getManage = async (req, res) => {
    let user = await User.findById(req.user.id);
    res.render('profile/manage', {
        user: user,
        errorMessages: req.flash('error')
    });
}
exports.postManage = async (req, res) => {
    try {
        let newEmail = req.body.email;
        console.log(`Change email to ${newEmail}`);

        await User.findByIdAndUpdate(req.user.id,
            { email: newEmail },
            { runValidators: true });

        req.flash('info', 'Email changed!');
    } catch (error) {
        console.error(`Error changing email: ${error.message}`);
        req.flash('error', error.message);
    } finally {
        res.redirect('/User/Profile');
    }
}

exports.getChangePassword = (req, res) =>
    res.render('profile/changePassword', {
        user: req.user,
        errorMessages: req.flash('error'),
    });
exports.postChangePassword = async (req, res) => {
    try {
        let newPassword = req.body.newPassword;
        console.log(`Change password to ${newPassword}`);

        let errorMessages = [];
        let user = User.findById(req.user.id);
        if (!user.validatePassword(req.body.currentPassword)) {
            console.error('Wrong current password');
            errorMessages.push('Wrong current password');
        } if (newPassword.length < 5) {
            console.error('Password is too short');
            errorMessages.push('Password is too short');
        } if (newPassword != req.body.confirmPassword) {
            console.error('Passwords do not match');
            errorMessages.push('Passwords do not match');
        } if (errorMessages.length != 0) {
            req.flash('error', errorMessages);
            res.redirect('/User/Profile/ChangePassword');
        } else {
            user.setPassword(newPassword);
            await user.save();

            req.flash('info', 'Password changed!');
        }
    } catch (error) {
        console.error(`Error changing password: ${err.message}`);
        req.flash('error', `Error changing password: ${err.message}`)
    } finally {
        res.redirect('/User/Profile/ChangePassword');
    }
}

exports.getExternalLogins = (req, res) => {
    let currentLogins = [];
    let otherLogins = [];
    arrays.loginProviders.forEach((loginProvider) => {
        let provider = req.user.externalLogins.find((x) => x.serviceName == loginProvider.Name.toLowerCase());
        provider ? currentLogins.push(loginProvider) : otherLogins.push(loginProvider);
    });

    res.render('profile/externalLogins', {
        user: req.user,
        errorMessages: req.flash('error'),
        currentLogins,
        otherLogins
    });
}

exports.postRemoveExternalLogin = async (req, res) => {
    try {
        let user = await User.findById(req.user.id);
        user.externalLogins = user.externalLogins.filter(
            (x) => x.serviceName !== req.body.provider.toLowerCase());

        await user.save();

        req.flash('info', 'External login deleted!');
    } catch (error) {
        console.error(`Error deleting external login: ${err.message}`);
        req.flash('error', `Error deleting external login: ${err.message}`);
    } finally {
        res.redirect('/User/Profile/ExternalLogins');
    }
}

exports.getExternal = (provider) => passport.authenticate(provider, { scope: ['email'] });
exports.getExternalCallback = (provider) =>
    passport.authenticate(provider, {
        successReturnToOrRedirect: '/Home',
        failureRedirect: '/User/Login'
    });