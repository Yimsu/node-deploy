const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AWS = require('aws-sdk'); //aws기능을 노드에서 사용할수 있게 해주는 패키지
const multerS3 = require('multer-s3');  //multer에서 s3로 이미지를 업로드

const { Post, Hashtag } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

// upload 폴더가 있다면 읽어오고, 없다면 만듬
try {
    fs.readdirSync('uploads');  //디렉토리를 읽어온다
} catch (error) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
}

//AWS에 관한 설정
AWS.config.update({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: 'ap-northeast-2',
});

const upload = multer({
    storage: multerS3({
        s3: new AWS.S3(),
        bucket: 'nodebird-project',
        key(req, file, cb) {//파일명(저장할 파일 설정)
            cb(null, `original/${Date.now()}${path.basename(file.originalname)}`);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
    console.log(req.file);
    const originalUrl = req.file.location; //eq.file.location에 s3버킷 이미지 주소가 담겨있음
    const url = originalUrl.replace(/\/original\//, '/thumb/');
    res.json({ url, originalUrl });
});
// const upload = multer({
//     storage: multer.diskStorage({  //파일지정 관련옵션 설정
//         destination(req, file, cb) {
//             cb(null, 'uploads/');
//         },
//         filename(req, file, cb) {  //저장할 파일이름
//             const ext = path.extname(file.originalname); //파일경로의 확장자반환
//             //path.basename 파일경로의 파일이름부분의 반환
//             cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
//         },
//     }),
//     limits: { fileSize: 5 * 1024 * 1024 },
// });
//
// // 이미지
// 하나를 업로드 받은뒤 이미지의 저장경로를 클리아이언트로 응답
// router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
//     console.log(req.file);
//     res.json({ url: `/img/${req.file.filename}` });
// });

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