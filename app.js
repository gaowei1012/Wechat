const express = require('express'),
    config = require('./config'),
    wechat = require('./wechat/wechat');

const app = express();

var wechatApp = new WeChat(config); // 实例 wechat 模块

app.get('/', (req, res) => {
    wechatApp.getAccessToken().then((data) => {
        res.send(data);
    })
});

app.listen(3000, (err) => {
    console.log(err);
});

