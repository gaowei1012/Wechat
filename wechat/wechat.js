'use strict'

const crypto = require('crypto'),
     https = require('https'),
     util = require('util'),
     fs = require('fs'),
     accessTokenJson =require('./access_token'),
     urltil = require('url'),
     accessTokenJson = require('./access_token'),
     menus = require('./menus'),
     parseString = require('xm12js').parseString,
     msg = require('./msg'),
     cryptoGraphy = require('./cryptoGraphy');

/**
 * 构建 WeChat 对象
 * @param {JSON} config 微信配置文件
 */
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
     * @param {String} url 请求地址
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
    /**
     * 用于处理 https post 请求方法
     * @param { Stirng } url 请求地址
     * @param {JSON} data 提交的数据
     */
    this,requestPost = (url, data) => {
        return new Promise((resolve ,reject) => {
            // 解析URL地址
            var urlData = urltil.parse(url);
            //设置https.request options 传入参数
            var options = {
                // 目标主机地址
                hostname: urlData.hostname,
                // 目标地址
                path: urlData.path,
                //请求方法
                method: 'POST',
                // 头部协议
                headers: {
                    'Contnet-Type': 'application/x-www-form-urlencoded',
                    'Contnet-Lenght': Buffer.byteLength(data, 'utf-8')
                }
            };

            var req = this.request(options, (res) => {
                var buffer = [],
                    result = '';
                // 用于监听 data 事件 完成书籍接收
                res.on('data', (data) => {
                    buffer.push(data);
                });

                //用于监听end 事件 完成数据接收
                res.on('end', () => {
                    result = Buffer.concat(buffer).toString('utf-8');
                    resolve(result);
                })
            })
            // 监听 error 错误事件
            .on('error', (err) => {
                console.log(err);
                reject(err);
            });

            // 传入数据
            req.write(data);
            req.end();

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

/**
 * 微信消息处理
 */

WeChat.prototype.handleMsg = (req, res) => {

    var buffer = [], that = this;

    // 实例化微信消息加密对象
    var cryptoGraphy = new cryptoGraphy(that.config, req);

    // 监听 data 事件 用于接收数据
    req.on('data', (data) => {
        buffer.push(data);
    });

    // 监听 end 事件 用于处理接收完成的数据
    req.on('end', () => {

        var msgXml = Buffer.concat(buffer).toString('utf-8');

        // 解析 xml
        parseString(msgXml, {explicitArray: false}, (err, result) => {
            if (!err) {
                result = result.xml;
                //判断消息加密方式
                if (req.query.encrypt_type == 'aes') {
                    result = cryptoGraphy.decryptMsg(result.Encrypt);
                }

                var toUser = result.ToUserName; //接收微信
                var feomUser = result.FromUserName; // 发送微信
                var reportMsg = ''; // 生命回复消息变量

                if (result.MsgType.toLowerCase() === 'event') {
                    switch(result.Event.toLowerCase()) {
                        case 'subscribe': 
                            // 回复消息
                            var content = '欢迎关注';
                                content += '1.你是谁 \n';
                                contnet += '2.关于web \n';
                                content += '回复文章, 即可获得新推送的文章';
                            reportMsg = msg.txtMsg(fromUser, toUser, content);
                        break;

                        case 'click':  
                            // 自定义菜单
                            var contnetArr = [
                                {Title:"Node.js 微信自定义菜单",Description:"使用Node.js实现自定义微信菜单",PicUrl:"http://img.blog.csdn.net/20170605162832842?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvaHZrQ29kZXI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast",Url:"http://blog.csdn.net/hvkcoder/article/details/72868520"},
                                {Title:"Node.js access_token的获取、存储及更新",Description:"Node.js access_token的获取、存储及更新",PicUrl:"http://img.blog.csdn.net/20170528151333883?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvaHZrQ29kZXI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast",Url:"http://blog.csdn.net/hvkcoder/article/details/72783631"},
                                {Title:"Node.js 接入微信公众平台开发",Description:"Node.js 接入微信公众平台开发",PicUrl:"http://img.blog.csdn.net/20170605162832842?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvaHZrQ29kZXI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast",Url:"http://blog.csdn.net/hvkcoder/article/details/72765279"}
                            ];
                            // 回复图文消息
                            reportMsg = msg.graphicMsg(fromUser, toUser, contentArr);
                        break;
                        default: 
                            reportMsg = msg.txtMsg(fromUser, toUser, '没有这个选项');
                        break;    
                    }
                }
                // 判断消息加密方式, 如果未加密则使用明文, 对明文消息进行加密
                reportMsg = req.query.encrypt_type === 'ase' ? cryptoGraphy.encryptMsg(reportMsg) : reportMsg;  
                // 返回给微信服务器
                res.send(reportMsg);
            } else {
                // 打印错误
                console.log(err);
            }
        })

    });

 }

 module.exports = WeChat;