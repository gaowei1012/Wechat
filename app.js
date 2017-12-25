const express = require('express'),
    wechat = require('./wechat/wechat'),
    config = require('./config');
    

const app = express();

var wechatApp = new WeChat(config); // 实例 wechat 模块

// get 端口链接请求
app.get('/', (request, res) => {
    wechatApp.auth(req, res);
});

// post 端口链接请求
app.post('/', (req, res) => {
    wechatApp.handleMsg(req, res);
})

app.get('/getAccessToken', (req, res) => {
    wechatApp.getAccessToken().then((data) => {
        res.send(data);
    })
});

app.listen(3000);

