'use strict'

const WeChat = function (config) {
    this.config = config;
    this.token = config.token;
}
module.exports = WeChat;



/**
 * 微信接入验证
 * 
 */
WeChat.prototype.auth = function (req, res) {
    /**
     * 业务逻辑
     */
}