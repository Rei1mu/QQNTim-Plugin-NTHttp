
let modulePaths = require.resolve.paths('express'); //require path
console.log(modulePaths);
console.log(__dirname);
const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new Router();
const WebSocket = require('ws');
const fs = require('fs');
const WebSocketServer = WebSocket.Server;
const crypto = require('crypto');
const clients = new Set();
function getSettingJ(account) {
    let p = __dirname + '\\setting.json'
    let j = JSON.parse(fs.readFileSync(p));
    if (j.length == 1) {
        //如果json数组只有一个，则setting.json无需指定acc(账号)的值
        j[0].acc = account;
        alert("??")
        return j[0];
    } else {

        for (let i = 0; i < j.length; i++) {
            if (j[i].acc == account) {
                return j[i];
            }
        }
    }

}
// 创建\pic目录 for Api upload & save pic
fs.mkdir(__dirname + '\\pic', (err) => {
    if (err) throw err;
    console.log('目录创建成功');
});
var botID, qjj;
module.exports = async (qqntim) => {
    async function getAcc() {
        let list = await qqntim.nt.getAccountInfo()
        return list
    }
    botID = await getAcc()
    qjj = getSettingJ(botID.uin)
    if (!qjj) {
        //qjj 为 setting.json中对应acc的json
        console.log('寻找账号对应配置失败，请在\\setting.json 填入对应bot账号')
        // alert('寻找账号对应配置失败，请在\\setting.json 填入对应bot账号');
        return;
    }
    if (qjj.ws) {
        try { createWs(); } catch {
            alert("createRWsConnect error")

        }
    }
    if (qjj.http) {//若多账号则需修改为不冲突的端口号
        try { useHttp(); } catch (err) {
            console.log("useHttp() error")
            alert("useHttp() error")
        }
    }
    if (qjj.wss) {//若多账号则需修改为不冲突的端口号
        try { createWsServer(); } catch (err) {
            alert("createWsServer() error")
        }
    }

    // await ws.send(botID.uin)
    // await ws.send(JSON.stringify(qjj))
    function createWsServer() {
        try {
            var wss = new WebSocketServer({ port: qjj.wsServerPort });
            wss.on('connection', function connection(wsse) {
                clients.add(wsse);
                wsse.on('message', function incoming(data) {
                    console.log('received: %s', data);
                });
                wsse.on('close', function close() {
                    clients.delete(wsse);
                });
            });
        } catch (e) {
            console.log(e);
        }
    }
    function reconnect() {
        if (reconnect.lock) return;
        reconnect.lock = true;
        setTimeout(function () {
            console.log('reconnecting');
            createWs();
            reconnect.lock = false;
        }, 2000);
    }

    // 定义一个创建 ws 实例的函数
    function createWs() {
        try {
            // 实例化 ws 对象
            ws = new WebSocket(qjj.rwsUrl);
            // 初始化事件处理函数
            initEventHandle();
        } catch (e) {
            // 如果出错，就重连
            reconnect();
        }
    }

    // 定义一个初始化事件处理函数的函数
    function initEventHandle() {
        // 监听打开事件
        ws.on('open', function open() {
            // 发送消息
            ws.send('bind:qqntim||' + botID.uin + '||' + qjj.rwsUrl);
            // 开启心跳检测
            heartCheck.start();
        });

        // 监听消息事件
        ws.on('message', function incoming(data) {
            // console.log('data', data);
            // 如果收到心跳消息，就重置心跳检测
            var msg = data.toString();
            console.log(msg);
            if (msg == 'pong') {
                heartCheck.reset().start(); return;
            }
            var j = JSON.stringify(msg)
            if (j.op == 'smsg') {
                console.log("mmm", msg, j,);
                qqntim.nt.sendMessage({
                    "uid": j.uid,
                    "chatType": j.chatType
                }, JSON.parse(j.data));
            }
        });

        // 监听错误事件
        ws.on('error', function error(err) {
            console.log(err);
            // 如果出错，就重连
            reconnect();
        });

        // 监听关闭事件
        ws.on('close', function close() {
            console.log('disconnected');
            // 如果关闭，就重连
            reconnect();
        });
    }

    // 定义一个心跳检测对象
    var heartCheck = {
        // 心跳超时时间，单位毫秒
        timeout: 15000,
        // 定时器变量
        timeoutObj: null,
        // 开启心跳检测的方法
        start: function () {
            var self = this;
            this.timeoutObj = setTimeout(function () {
                // 发送心跳消息
                ws.send('ping');
                console.log('ping');
                // 如果超过一定时间没有收到回复，就关闭连接，触发重连
                // self.timeoutObj = setTimeout(function () {
                //     ws.close();
                // }, self.timeout);
            }, this.timeout);
        },
        // 重置心跳检测的方法
        reset: function () {
            clearTimeout(this.timeoutObj);
            return this;
        }
    };

    function sendMsg(data) {
        if (!qjj) return;//setting.json中对应acc的json
        if (qjj.ws) {
            try { ws.send(data); } catch (e) {
                console.log("ws.send error")
            }
        }
        if (qjj.sendHttpMsg) {//若多账号则需修改为不冲突的端口号
            try {
                postMsg(data);
            } catch (e) {
                console.log("postSend error")
            }
        }
        if (qjj.wss) {//若多账号则需修改为不冲突的端口号
            try {
                sendWsServerMsg(data)
            } catch (e) {
                console.log("wssSend error")
                // alert(e)
            }
        }

    }
    function sendWsServerMsg(message) {
        // 遍历所有客户端
        console.log(clients.length)
        if (clients.length < 1) return;
        clients.forEach(function each(client) {
            // 如果客户端处于打开状态，就发送消息
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }

    qqntim.nt.getFriendsList().then((list) => {
        console.log("[Example-AutoReply] 好友列表", list);
        list.forEach((friend) =>
            qqntim.nt
                .getPreviousMessages({ chatType: "friend", uid: friend.uid }, 20)
                .then((messages) => {
                    //   ws.send(JSON.stringify(messages));
                    console.log(
                        "[Example-AutoReply] 好友 " +
                        friend.nickName +
                        " 的最近 20 条消息",
                        messages
                    )
                    if (qjj.sendHistoryMsg) {
                        let data = detailRecvMsg(message, 'LoadListFriends');
                        console.log('msgLog: ', data);
                        sendMsg(data)
                    }
                }
                )
        );
    });

    qqntim.nt.getGroupsList().then((list) => {
        console.log("[Example-AutoReply] 群组列表", list);
        list.forEach((group) =>
            qqntim.nt
                .getPreviousMessages({ chatType: "group", uid: group.uid }, 20)
                .then((messages) => {
                    //  ws.send(JSON.stringify(messages));
                    console.log("[Example-AutoReply] 群组 " + group.name + " 的最近 20 条消息", messages)

                    if (qjj.sendHistoryMsg) {
                        let data = detailRecvMsg(message, 'LoadListGroups');
                        console.log('msgLog: ', data);
                        sendMsg(data)
                    }

                })
        );
    });

    qqntim.nt.on("new-messages", (messages) => {

        messages.forEach((message) => {
            //   ws.send(JSON.stringify(messages));
            let data = detailRecvMsg(message)
            console.log('msgLog: ', data)
            sendMsg(data)
        }
        );
    });


    function postMsg(data) {
        fetch(qjj.sendHttpTar, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
    }

    function useHttp() {
        app.use(bodyParser({
            multipart: true,
            formLimit: "20mb",
            jsonLimit: "20mb"
        }));
        router.get('/', async (ctx, next) => {
            // ctx.body = qqntim.nt.getFriendsList1()

            let list = botID.uin;
            ctx.body = list

        });
        router.get('/bot', (ctx, next) => {
            ctx.body = JSON.stringify(botID);
        });
        router.get('/friendList', async (ctx, next) => {

            let list = await qqntim.nt.getFriendsList()
            ctx.body = JSON.stringify(list)
        });
        router.get('/groupList', (ctx, next) => {
            ctx.body = qqntim.nt.getGroupsList();
        });
        router.get('/gpic', async (ctx, next) => {
            let path = ctx.request.query.path;
            ctx.response.type = 'image/png';
            ctx.response.body = fs.readFileSync(`${path}`);
            //自己开Api共享图片
            //一般pcqqnt接收图片的位置在"qqnt运行目录\nt_qq\nt_data\Pic\2023-06\Ori\8edf519ea8d2b47ca2fd72ef74fb482b.png"
        });
        router.get('/gau', async (ctx, next) => {
            //取语音文件
            let path = ctx.request.query.path;
            ctx.response.type = 'audio/amr';
            ctx.response.body = fs.readFileSync(`${path}`);
        });
        router.all('/revokeMessageById', (ctx, next) => {
            //撤回消息
            // qqntim.nt.revokeMessage(message.peer, id);
            if (ctx.request.body.uid) {
                qqntim.nt.revokeMessage({
                    "uid": ctx.request.body.uid,
                    "chatType": ctx.request.body.t
                }, ctx.request.body.id);
                ctx.body = 'revokeMessageById req success nya'
            } else if (ctx.query.data) {
                let d = JSON.parse(ctx.query.data);
                console.log(d)
                qqntim.nt.revokeMessage({
                    "uid": d.uid,
                    "chatType": d.t
                }, d.id);
                ctx.body = 'revokeMessageById req success nya'
            } else {
                ctx.body = 'error'
            }
        });

        router.post('/uploadPic', async ctx => {
            //保存图片到本地，上传必需b64编码，默认保存位置为 ws文件夹\pic\ 下
            //base64解码图片的编码，处理后保存命名hash值并返回保存路径
            // const data = Buffer.from(ctx.request.rawBody, 'base64');
            const data = Buffer.from(ctx.request.rawBody);
            const hash = crypto.createHash('md5');
            hash.update(data);
            const md5 = hash.digest('hex');
            console.log(md5);
            let p = __dirname + '\\pic\\' + md5 + ".png"
            fs.access(p, fs.constants.F_OK, (err) => {
                if (err) {
                    fs.promises.writeFile(p, data, (err) => {
                        if (err) throw err;
                        console.log('文件创建成功');
                    });
                } else {
                    console.log('文件已存在');
                }
            });
            ctx.body = p
        });
        router.all('/smsg', async (ctx, next) => {
            /*HTTP POST发送例子 文本 + bigface ：
            "t": 分为 "group", "friend"
            "uid": 为"group" 时是groupUin, "friend" 时是friendUin
            {
                "t": "group",
                "uid": "625224327",
                "msg":"114514",
                "data": [
                    {
                        "type": "text",
                        "content": "asdff"
                    },
                    {
                        "type": "raw",
                        "raw": {
                            "elementType": 11,
                            "elementId": "1",
                            "marketFaceElement": {
                                "itemType": 6,
                                "faceInfo": 1,
                                "emojiPackageId": 232180,
                                "subType": 3,
                                "imageWidth": 200,
                                "imageHeight": 200,
                                "faceName": "[开心]",
                                "emojiId": "838396c7ac3d91fd95d704640a4a8b06",
                                "key": "6fdfb73e5854178b",
                                "emojiType": 1
                            }
                        }
                    },
                    {
                        "type": "text",
                        "content": "(by ntqq)"
                    }
                ]
            }
                
            
            //发送图片例子(绝对路径) 若非本机可使用Api上传：
            {
                "t":"group",
                "uid": 625224327,
                "data": [
                    {
                        "type": "image",
                        "file": "C:\\s\\114514.gif"
                    }
                ]
            }
            */
            let elements = [], je = [];
            if (ctx.request.body.uid) {
                if (ctx.request.body.msg)
                    je = detailMsg(ctx.request.body.msg, elements);
                if (ctx.request.body.data) {
                    for (let i = 0; i < ctx.request.body.data.length; i++) {
                        je.push(ctx.request.body.data[i])
                    }
                }

                let ret = await qqntim.nt.sendMessage({
                    "uid": ctx.request.body.uid,
                    "chatType": ctx.request.body.t
                }, je);
                ctx.body = `send_message req success nya ${ret}`
            } else if (ctx.query.data) {
                let d = JSON.parse(ctx.query.data);
                if (d.msg)
                    je = detailMsg(d.msg, elements);
                if (d.data) {
                    for (let i = 0; i < d.data.length; i++) {
                        je.push(d.data[i])
                    }
                }
                console.log(d)
                let ret = await qqntim.nt.sendMessage({
                    "uid": d.uid,
                    "chatType": d.t
                }, je);
                ctx.body = `send_message req success nya ${ret}`
            } else {
                ctx.body = 'error'
            }
        });

        app.use(router.routes());
        app.use(router.allowedMethods());
        app.listen(qjj.httpApiPort);
        // 定义一个重连的函数
    }
};
function detailMsg(m, elements) {
    let L1
    while (true) {
        L1 = m.indexOf(`[pic=`)
        console.log(L1)
        if (L1 !== -1) {
            let m1 = m.substring(0, L1);
            if (m1 !== '') {
                detailMsg(m1, elements)
                // elements.push({ type: "text", content: m1 })
            }
            let L2 = m.indexOf(`]`, L1);
            if (L2 !== -1) {
                let m2 = m.substring(L1 + 5, L2);
                elements.push({ type: "image", file: m2 })
                m = m.substring(L2 + 1, m.length);
                //   console.log(m1, m2, L2, m, elements)
            }
        } else {
            L1 = m.indexOf(`[bigFace,`)
            if (L1 !== -1) {
                let m1 = m.substring(0, L1);
                if (m1 !== '') {
                    detailMsg(m1, elements)
                    // elements.push({ type: "text", content: m1 })
                }
                let L3 = m.indexOf(`,flag=`), L4, emojiPackageId, faceName, emojiId, key;
                if (L3 !== -1) {
                    let L2 = m.indexOf(`]`, L3 + 1);
                    let m2 = m.substring(L1, L2 + 1);
                    L3 = m2.indexOf(',id=')
                    emojiPackageId = m2.substring(L3 + 4, m2.indexOf(',', L3 + 1))
                    console.log('L3::', L3, m2.indexOf(',', L3 + 1), emojiPackageId)
                    L3 = m2.indexOf(',name=')
                    faceName = m2.substring(L3 + 6, m2.indexOf(',', L3 + 1))
                    L3 = m2.indexOf(',hash=')
                    emojiId = m2.substring(L3 + 6, m2.indexOf(',', L3 + 1))
                    L3 = m2.indexOf(',flag=')
                    key = m2.substring(L3 + 6, m2.indexOf(']', L3 + 1))
                    console.log(key, emojiId, faceName, emojiPackageId)
                    let j = {
                        "type": "raw",
                        "raw": {
                            "elementType": 11,
                            "elementId": "114514",
                            "marketFaceElement": {
                                "itemType": 6,
                                "faceInfo": 1,
                                "emojiPackageId": emojiPackageId,
                                "subType": 3,
                                "faceName": faceName,
                                "emojiId": emojiId,
                                "key": key,
                                "emojiType": 1
                            }
                        }
                    }
                    console.log(j)
                    elements.push(j)
                    m = m.substring(L2 + 1, m.length);
                }
            } else {
                L1 = m.indexOf(`[audio=`)
                if (L1 !== -1) {
                    let m1 = m.substring(0, L1);
                    if (m1 !== '') {
                        detailMsg(m1, elements)
                        // elements.push({ type: "text", content: m1 })
                    }
                    let L2 = m.indexOf(`]`, L1);
                    if (L2 !== -1) {
                        let m2 = m.substring(L1 + 7, L2);
                        let j = {
                            "type": "raw",
                            "raw": {
                                "elementType": 4,
                                "pttElement": {
                                    "filePath": m2
                                }
                            }
                        }
                        //"C:\\soft\\qpic\\3020646829\\nt_qq\\nt_data\\Ptt\\2023-07\\Ori\\9fcab3ea090a3ee6ff8e3a04b44f74d6.amr"
                        elements.push(j)
                        m = m.substring(L2 + 1, m.length);
                        //   console.log(m1, m2, L2, m, elements)
                    }
                } else {
                    L1 = m.indexOf(`[face,`)
                    if (L1 !== -1) {
                        let m1 = m.substring(0, L1);
                        if (m1 !== '') {
                            detailMsg(m1, elements)
                            // elements.push({ type: "text", content: m1 })
                        }
                        let L2 = m.indexOf(`]`, L1);
                        if (L2 !== -1) {
                            L3 = m2.indexOf(',id=')
                            faceIndex = m2.substring(L3 + 4, m2.indexOf(',', L3 + 1))
                            L3 = m2.indexOf(',faceType=')
                            faceType = m2.substring(L3 + 4, m2.indexOf(']', L3 + 1))
                            let j = {
                                "type": "face",
                                "faceIndex": faceIndex,
                                "faceType": faceType
                            }
                            elements.push(j)
                            m = m.substring(L2 + 1, m.length);
                        }
                    } else {
                        if (m == '')
                            break;
                        elements.push({ type: "text", content: m.replaceAll("\r\n", "\r") })
                        break;
                    }
                }

            }
        }

    }
    return elements;
}

//msg = msg + `[reply,msgSeq=${replyElement_.replayMsgSeq},uin=${replyElement_.senderUid},uid=${replyElement_.senderUidStr},msgTime=${replyElement_.replyMsgTime}]`
function detailRecvMsg(message, op) {
    let j = JSON, msg = ''
    // j=JSON.parse(j);
    if (op)
        j.op = op
    switch (message.peer.chatType) {
        case 'friend': j.eventType = 'private_msg'; break;
        case 'group': j.eventType = 'group_msg'; break;
    }
    //  ws.send(JSON.stringify(j));
    j.peer = message.peer
    j.sender = message.sender
    j.msgId = message.raw.msgId
    j.msgRandom = message.raw.msgRandom
    j.msgSeq = message.raw.msgSeq
    for (let i = 0; i < message.elements.length; i++) {
        let i_ = message.elements[i]
        switch (i_.type) {
            case 'text':
                if (i_.raw.elementType == 1) {
                    let atNtUid_ = i_.raw.textElement.atNtUid
                    if (!atNtUid_) {
                        let c = i_.content
                        msg = msg + c.replaceAll("\r", "\r\n")
                        break;
                    } else {
                        msg = msg + `[@${atNtUid_}]`
                        break;
                    }
                } else {
                    let c = i_.content
                    msg = msg + c.replaceAll("\r", "\r\n")
                    break;
                }
            case "image":
                msg = msg + `[pic=${qjj.httpUrl}/gpic?path=${i_.file}]`
                break;
            case "face":
                msg = msg + `[face,Id=${i_.faceIndex},faceType=${i_.faceType}]`
                break;
            case "raw":
                switch (i_.raw.elementType) {
                    case 1:
                        let atNtUid_ = i_.raw.textElement.atNtUid
                        if (!atNtUid_)
                            break;
                        msg = msg + `[@${atNtUid_}]`
                        break;
                    case 11:
                        let bigFace_ = i_.raw.marketFaceElement
                        if (!bigFace_)
                            break;
                        msg = msg + `[bigFace,id=${bigFace_.emojiPackageId},name=${bigFace_.faceName},hash=${bigFace_.emojiId},flag=${bigFace_.key}]`
                        break;
                    case 4:
                        let pttElement_ = i_.raw.pttElement
                        if (!pttElement_)
                            break;
                        msg = msg + `[audio=${qjj.httpUrl}/gau?path=${pttElement_.filePath}]`
                        break;
                    case 7:
                        let replyElement_ = i_.raw.replyElement
                        if (!replyElement_)
                            break;
                        msg = msg + `[reply,msgSeq=${replyElement_.replayMsgSeq},uin=${replyElement_.senderUid},uid=${replyElement_.senderUidStr},msgTime=${replyElement_.replyMsgTime}]`
                        break;
                    case 16:
                        let xmlContent_ = i_.raw.multiForwardMsgElement.xmlContent
                        if (!xmlContent_)
                            break;
                        msg = msg + `${xmlContent_}`
                        break;
                }
        }
    }
    j.msg = msg
    return JSON.stringify(j);





}
