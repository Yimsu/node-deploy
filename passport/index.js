const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const User = require('../models/user');

module.exports = () => {
    //로그인시 실행, req.session 객체에 어떤 데이터를 저장할지 정하는 메서드
    //매개변수로 user을 받고, done함수에 두번째 인수로 user.id를 넘김
    passport.serializeUser((user, done) => {
        //첫번째인수 : 에러발생시사용, 두번쨰인수 : 저장하고싶은데이터를 넣음
        done(null, user.id);
    });

    // 매 요청시 실행, serializeUser세션에 저장했던 아이디를 받아서 디비에서 사용자정보조회함(라우터실행전에 실행)
    // 조회한정보를 req.user에 저장 - 앞으로 req.user을통해서 로그인한사용자정보 가지고올수있음
    // 팔로워,팔로잉 목록도 함께 불러옴
    passport.deserializeUser((id, done) => {
        User.findOne({
            where: { id },
            include: [{
                model: User,
                attributes: ['id', 'nick'],
                as: 'Followers',
            }, {
                model: User,
                attributes: ['id', 'nick'],
                as: 'Followings',
            }],
        })
            .then(user => done(null, user))  //req.user저장
            .catch(err => done(err));
    });

    local();
    kakao();
};

// serializeUser 는 사용자 정보 객체를 세션에 아이디로 저장
// deserializeUser는 세션에 저장한 아이디로 사용자 정보객체를 불러옴