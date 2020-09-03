const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;

const User = require('../models/user');

module.exports = () => {
    passport.use(new KakaoStrategy({
        clientID: process.env.KAKAO_ID, //카카오에서 발급해주는 아이디
        callbackURL: '/auth/kakao/callback',//카카오에서 받는 인증결과를받을 라우터주소

    }, async (accessToken, refreshToken, profile, done) => {
        console.log('kakao profile', profile);
        // 카카오를 통해 회원가입되어있는 경우
        try {
            const exUser = await User.findOne({
                where: { snsId: profile.id, provider: 'kakao' },
            });
            if (exUser) {
                done(null, exUser);
             // 카카오를 통한 회원가입한 사용자가 없다면 회원가입진행
            } else {
                const newUser = await User.create({
                    email: profile._json && profile._json.kaccount_email,
                    nick: profile.displayName,
                    snsId: profile.id,
                    provider: 'kakao',
                });
                done(null, newUser);
            }
        } catch (error) {
            console.error(error);
            done(error);
        }
    }));
};