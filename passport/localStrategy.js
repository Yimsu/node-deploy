//로그인전략

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/user');

module.exports = () => {
    passport.use(new LocalStrategy({
        //LocalStrategy의 첫번째 인수
        usernameField: 'email', //req.body.email
        passwordField: 'password',  //req.body.password

    //LocalStrategy의 두번째 인수
    }, async (email, password, done) => {
        try { // 사용자디비에 일치하는 이메일 찾음
            const exUser = await User.findOne({ where: { email } });
            if (exUser) {  // 있다면, bcrypt.compare로 비밀번호를 비교
                const result = await bcrypt.compare(password, exUser.password);
                if (result) { //맞다면, done함수의 두번쨰 인수로 사용자 정보를 넣어 보냄
                    done(null, exUser);
                } else {
                    done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
                }
            } else {
                done(null, false, { message: '가입되지 않은 회원입니다.' });
            }
        } catch (error) {
            console.error(error);
            done(error);
        }
    }));
};