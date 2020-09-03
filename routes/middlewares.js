

exports.isLoggedIn = (req, res, next) => {
    //로그인중이면 true, 아니면 false
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(403).send('로그인 필요');
    }
};

//로그인하지 않은사람
exports.isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        next();
    } else {
        const message = encodeURIComponent('로그인한 상태입니다.');
        res.redirect(`/?error=${message}`);
    }
};