const User = require('../models/user');

exports.addFollowing = async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.user.id } });
        if (user) {
            //현재로그인한 사용자와의 관계를 지정
            await user.addFollowing(parseInt(req.params.id, 10));
            res.send('success');
        } else {
            res.status(404).send('no user');
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
};
