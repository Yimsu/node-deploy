const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const User = require('../models/user');

const router = express.Router();

//회원가입
//기존에 같은 이메일로 가입한 사용자가 있는지 조회 후, 있으면 회원가입페이지로 되돌려보냄
router.post('/join', isNotLoggedIn, async (req, res, next) => {
    const { email, nick, password } = req.body;
    try {
        const exUser = await User.findOne({ where: { email } });
        if (exUser) { //이메일이 있다면 다시 회원가입 페이지로
            return res.redirect('/join?error=exist');
        }
        //비밀번호 암호화
        const hash = await bcrypt.hash(password, 12);
        await User.create({
            email,
            nick,
            password: hash,
        });
        return res.redirect('/');
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.post('/login', isNotLoggedIn, (req, res, next) => {
    //로컬 로그인/ authError값이 있으면 실패,user값이있으면 성공
    passport.authenticate('local', (authError, user, info) => {
        if (authError) { //로그인실패
            console.error(authError);
            return next(authError);
        }
        if (!user) {
            return res.redirect(`/?loginError=${info.message}`);
        }
        //user값이 있다면
        return req.login(user, (loginError) => {
            if (loginError) {
                console.error(loginError);
                return next(loginError);
            }
            return res.redirect('/');
        });
    })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
});

router.get('/logout', isLoggedIn, (req, res) => {
    req.logout(); // user객체를 제거
    req.session.destroy(); // req.session객체의 내옹을 제거
    res.redirect('/');
});

router.get('/kakao', passport.authenticate('kakao'));

router.get('/kakao/callback', passport.authenticate('kakao', {
    failureRedirect: '/',  // 로그인실패시
}), (req, res) => {
    res.redirect('/');
});

module.exports = router;