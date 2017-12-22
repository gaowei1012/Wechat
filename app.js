const express = require('express'),
    crypto = require('crypto'),
    config = require('./config')

const app = express();

app.get('/', (req, res) => {
    // 获取微信服务请求参数
    var signature = req.query.signature, // 获取加密签名
        timestamp = req.query.timestamp, // 时间戳
        nonce = req.query.nonce, // 随机数
        echostr = req.query.echostr; // 水机字符串
    // 字典排序
    var array = [config.token, timestamp, nonce];
    array.sort();
    
    //将三个参数加密拼接成一个字符串
    var tempStr = array.join('');
    const hashCode = crypto.createHash('sha1'); // 加密算法
    var resultCode = hashCode.update(tempStr, 'utf8').digest('hex'); // 加密字符串

    // 表示请求
    if (resultCode === signature) {
        res.send(echostr);
    } else {
        res.send('mismatch');
    }
})

app.listen(3000, (err) => {
    console.log(err);
} )