'use strict'

/**
 * 回复文本消息
 * @param {String} toUser  接收用户
 * @param {Stirng} fromUser 发送用户
 * @param {Strinf} contnet 发送消息
 */
exports.txtMsg = (toUser, fromUser, contnet) => {
    var xmlContent = "<xml><ToUserName><![CDATA["+ toUser +"]]></ToUserName>";
        xmlContent += "<FromUserName><![CDATA["+ fromUser +"]]></FromUserName>";
        xmlContent += "<CreateTime>"+ new Date().getTime() +"</CreateTime>";
        xmlContent += "<MsgType><![CDATA[text]]></MsgType>";
        xmlContent += "<Content><![CDATA["+ content +"]]></Content></xml>";
    
    return xmlContent;    
}

/**
 * 
 * @param {String} toUser 接收用户
 * @param {String} fromUser 发送消息
 * @param {Array} contentArr 图文信息集合
 */
exports.graphicMsg = (toUser, fromUser, contentArr) => {
    var xmlContent = "<xml><ToUserName><![CDATA["+ toUser +"]]></ToUserName>";
        xmlContent += "<FromUserName><![CDATA["+ fromUser +"]]></FromUserName>";
        xmlContent += "<CreateTime>"+ new Date().getTime() +"</CreateTime>";
        xmlContent += "<MsgType><![CDATA[news]]></MsgType>";
        xmlContent += "<ArticleCount>"+contentArr.length+"</ArticleCount>";
        xmlContent += "<Articles>";
        contentArr.map((item, index) => {
            xmlContent += "<item>";
            xmlContent+="<Title><![CDATA["+ item.Title +"]]></Title>";
            xmlContent+="<Description><![CDATA["+ item.Description +"]]></Description>";
            xmlContent+="<PicUrl><![CDATA["+ item.PicUrl +"]]></PicUrl>";
            xmlContent+="<Url><![CDATA["+ item.Url +"]]></Url>";
            xmlContent+="</item>";
        });
        xmlContent += "</Articles></xml>";
    return xmlContent;    
}