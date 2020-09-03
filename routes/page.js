const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, User, Hashtag } = require('../models');

const router = express.Router();

//미들웨어
router.use((req, res, next) => {
    //로그인한경우 req.user가 존재, 팔로잉/팔로워 아이디리스트도 넣음
    res.locals.user = req.user;
    res.locals.followerCount = req.user ? req.user.Followers.length : 0;
    res.locals.followingCount = req.user ? req.user.Followings.length : 0;
    res.locals.followerIdList = req.user ? req.user.Followings.map(f => f.id) : [];
    next();
});

//자신의 프로필은 로그인을 해야 볼수 았어서 isLoggedIn 사용
router.get('/profile', isLoggedIn, (req, res) => {
    res.render('profile', { title: '내 정보 - NodeBird' });
});

router.get('/join', isNotLoggedIn, (req, res) => {
    res.render('join', { title: '회원가입 - NodeBird' });
});

router.get('/', async (req, res, next) => {
    try {
        //디비에서 게시글 조회
        const posts = await Post.findAll({
            include: {
                model: User,
                attributes: ['id', 'nick'],
            },
            order: [['createdAt', 'DESC']],
        });
        res.render('main', {
            title: 'NodeBird',
            twits: posts, // 게시글조회 결과 twits에 넣어 렌더링
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

//해시태그로 조회
router.get('/hashtag', async (req, res, next) => {
    const query = req.query.hashtag;
    if (!query) {
        return res.redirect('/'); //해시태그값이 없는경우 메인페이지로 이동
    }
    try { //getPost로 해시태그 모든게시글을 가지고 옴
        const hashtag = await Hashtag.findOne({ where: { title: query } });
        let posts = [];
        if (hashtag) {   //작성자 정보와 함께 모든 게시글을 가지고옴
            posts = await hashtag.getPosts({ include: [{ model: User }] });
        }

        return res.render('main', {
            title: `${query} | NodeBird`,
            twits: posts,  //조회된 게시글만
        });
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

module.exports = router;