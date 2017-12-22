'use strict'

const crypto = require('crypto'),
     https = require('https'),
     util = require('util'),
     fs = require('fs'),
     accessTokenJson =require('./access_token');

const WeChat = function (config) {
    this.config = config;
    this.token = config.token;
}
module.exports = WeChat;


var WeChat = function (config) {
    // 设置 wechat 对象属性 config
    this.config = config;
    //设置 WeChat 对象 token
    this.token = config.token;

    this.appID = config.appID;

    this.appScrect = config.appScrect;

    this.apiDomain = config.apiDomain;

    this.apiDomain = config.apiURL;

    /**
 * https get 请求
 * @param {*} url 
 */

this.requestGet = function (url) {

    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            var buffer = [],
                result = '';
            // 监听data事件
            res.on('data', (data) => {
                buffer.push(data);
            })

            res.on('end', () => {
                result = Buffer.concat(buffer, buffer.length).toString('utf-8');
                resolve(result); // 返回最终结果
            })
        }).on('error', (err) => {
            reject(err);
        })
    })
}
}


/**
 * 微信接入验证
 * 
 */
WeChat.prototype.auth = function (req, res) {
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
}

/**
 * 获取微信 access_token 
 * 
 */
WeChat.prototype.getAccessToken = function () {
    var that = this;
    return new Promise((resolve, reject) => {
        var currentime = new Date().getTime(); // 当前时间
        var url = util.format(that.apiURL.accessTokenJson, that/apiDomain, that.appID, that.appScrect)

        if (accessTokenJson.access_token === '' || accessTokenJson.expires_time < currentime) {
            that.requestGet(url).then((data) => {
                var result = JSON.parse(data);

                if ( data.indexOf('errcode') < 0) {
                    accessTokenJson.access_token = result.access_token;
                    accessTokenJson.expires_time = new Date().getTime() + (parseInt(result.expires_in) -200) * 1000;
                
                    // 更新本地存储
                    fs.writeFile('./wechat/access_token.json', JSON.stringify(accessTokenJson));

                    resolve(accessTokenJson.access_token);
                } else {
                    resolve(result)
                }
                
            })
        } else {
            
            resolve(accessTokenJson.access_token);
        }

    })


}
