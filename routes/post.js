const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Post, Hashtag } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

try {
    fs.readdirSync('uploads');  //디렉토리를 읽어온다
} catch (error) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
}

const upload = multer({
    storage: multer.diskStorage({  //파일지정 관련옵션 설정
        destination(req, file, cb) {
            cb(null, 'uploads/');
        },
        filename(req, file, cb) {  //저장할 파일이름
            const ext = path.extname(file.originalname); //파일경로의 확장자반환
            //path.basename 파일경로의 파일이름부분의 반환
            cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
});

// 이미지 하나를 업로드 받은뒤 이미지의 저장경로를 클리아이언트로 응답
router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
    console.log(req.file);
    res.json({ url: `/img/${req.file.filename}` });
});

const upload2 = multer();
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => {
    try {
        const post = await Post.create({
            content: req.body.content,
            img: req.body.url,
            UserId: req.user.id,
        });
        //게시글내용에서 해시태그를 추출
        const hashtags = req.body.content.match(/#[^\s#]*/g);
        if (hashtags) {
            const result = await Promise.all( //해시태그 붙어있는거 모두 작업
                hashtags.map(tag => {
                    return Hashtag.findOrCreate({ //해시태그를 디비에저장하거나 찾음
                        //해시태그에 #를 떼고 소문자로 바꿈
                        where: { title: tag.slice(1).toLowerCase() },
                    })
                }),
            );
            //게시글과 연결
            await post.addHashtags(result.map(r => r[0])); //result.map(r => r[0]) 로 모델만추출
        }
        res.redirect('/');
    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;