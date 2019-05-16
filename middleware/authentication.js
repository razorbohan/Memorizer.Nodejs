module.exports = {
    isAuthenticated : function(req, res, next) {       
        if(req.isAuthenticated()) {
            return next();
        }
        req.session.returnTo = req.originalUrl;
        res.redirect('/User/Login');
    }
};