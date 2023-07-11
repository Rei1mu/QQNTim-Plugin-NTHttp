
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
const wssClients = new Set();

const convert = require('./src/msg.js');

function getSettingJ(account) {
    let p = __dirname + '\\setting.json'
    let j = JSON.parse(fs.readFileSync(p));
    if (j.length == 1) {
        //如果json数组只有一个，则setting.json无需指定acc
        j[0].acc = account;
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

try {
    fs.mkdir(__dirname + '\\pic');
} catch (error) {
}
var botID, qjj;
module.exports = async (qqntim) => {
    async function getAcc() {
        let list = await qqntim.nt.getAccountInfo()
        return list
    }
    botID = await getAcc()
    qjj = getSettingJ(botID.uin)
    if (!qjj)//setting.json中对应acc的json
    {
        console.log('寻找账号对应配置失败，请在\\setting.json 填入对应bot账号')
        // alert('寻找账号对应配置失败，请在\\setting.json 填入对应bot账号');
        return;
    }
    if (qjj.ws) {
        try { createWs(); } catch {
            console.log("WsConnect error");
        }
    }
    if (qjj.http) {
        try { useHttpApi(); } catch (err) { console.log("useHttp() error"); }
    }
    if (qjj.wss) { createWsServer(); }

    async function recvWsMsgEvent(j, cws) {
        let elements = [], je = [];
        if (!j) return;
        if (j.op == 'smsg') {
            if (j.msg)
                je = await convert.convertMsg(j.msg, elements);
            if (j.data) {
                for (let i = 0; i < j.data.length; i++) {
                    je.push(j.data[i])
                }
            }
            let elementId = await qqntim.nt.sendMessage({
                "uid": j.uid,
                "chatType": j.t
            }, je);
            let j1 = JSON
            j1.op = "callback"
            j1.eventId = !j.eventId ? 1 : j.eventId
            j1.elementId = elementId
            cws.send(JSON.stringify(j1))
        }
    }
    function createWsServer() {
        try {
            var wss = new WebSocketServer({ port: qjj.wsServerPort });
            wss.on('connection', function connection(wsse) {
                wsse.send('bind:qqntim||' + qjj.httpUrl + '||' + botID.uin + '||' + botID.uid);
                wssClients.add(wsse);
                wsse.on('message', function incoming(data) {
                    //  console.log('received: %s', data);

                    var msg = data.toString();
                    //  console.log(msg);
                    if (msg == 'ping') {
                        wsse.send('pong'); return;
                    }
                    var j = JSON.stringify(msg)
                    recvWsMsgEvent(j, wsse);
                });
                wsse.on('close', function close() {
                    wssClients.delete(wsse);
                });
            });
        } catch (e) {
            //  console.log("createWsServer() error"); console.log(e);
        }
    }



    function createWs() {
        try {
            ws = new WebSocket(qjj.rwsUrl);
            initEventHandle();
        } catch (e) {
            reconnect();
        }
    }

    function initEventHandle() {
        ws.on('open', function open() {
            ws.send('bind:qqntim||' + qjj.httpUrl + '||' + botID.uin + '||' + botID.uid);
            heartCheck.start();
        });

        ws.on('message', function incoming(data) {
            // console.log('data', data);
            // 如果收到心跳消息，就重置心跳检测
            var msg = data.toString();
            //  console.log(msg);
            if (msg == 'pong') {
                heartCheck.reset().start(); return;
            }
            var j = JSON.stringify(msg)
            recvWsMsgEvent(j, ws);
        });

        ws.on('error', function error(err) {
            console.log(err);
            reconnect();
        });

        ws.on('close', function close() {
            console.log('disconnected');
            reconnect();
        });
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
    var heartCheck = {
        timeout: 15000,
        timeoutObj: null,
        start: function () {
            var self = this;
            this.timeoutObj = setTimeout(function () {
                // 发送心跳消息
                ws.send('ping');
                // 如果超过一定时间没有收到回复，就关闭连接，触发重连
                // self.timeoutObj = setTimeout(function () {
                //     ws.close();
                // }, self.timeout);
            }, this.timeout);
        },
        reset: function () {
            clearTimeout(this.timeoutObj);
            return this;
        }
    };

    function sendMsg(data) {
        if (!qjj) return;//setting.json中对应acc的json
        if (qjj.ws) {
            try { ws.send(data); } catch (e) { console.log("ws.send error") }
        }
        if (qjj.sendHttpMsg) {//若多账号则需修改为不冲突的端口号
            postMsg(data);
        }
        if (qjj.wss) {//若多账号则需修改为不冲突的端口号
            try {
                sendWsServerMsg(data)
            } catch (e) {
                console.log("wssSend error")
            }
        }

    }
    function sendWsServerMsg(message) {
        if (wssClients.length < 1) return;
        wssClients.forEach(function each(client) {
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
                    // ws.send(JSON.stringify(messages));
                    // console.log(
                    //     "[Example-AutoReply] 好友 " +
                    //     friend.nickName +
                    //     " 的最近 20 条消息",
                    //     messages
                    // )
                    if (qjj.sendHistoryMsg) {
                        let data = messages2Msg(messages, 'LoadListFriends');
                        // console.log('msgLog: ', data);
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
                    // console.log("[Example-AutoReply] 群组 " + group.name + " 的最近 20 条消息", messages)
                    if (qjj.sendHistoryMsg) {
                        let data = messages2Msg(messages, 'LoadListGroups');
                        sendMsg(data)
                    }

                })
        );
    });

    qqntim.nt.on("new-messages", (messages) => {
        messages.forEach((message) => {
            ws.send(JSON.stringify(messages));
            let data = convert.message2Msg(message, "newMsg")
            //  console.log('msgLog: ', data)
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

    function useHttpApi() {
        app.use(bodyParser({
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
        router.get('/groupList', async (ctx, next) => {
            let list = await qqntim.nt.getGroupsList();
            ctx.body = JSON.stringify(list);
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
            const data = Buffer.from(ctx.request.rawBody, 'base64');

            // const data = Buffer.from(ctx.request.rawBody);
            // const hash = crypto.createHash('md5');
            // hash.update(data);
            // const md5 = hash.digest('hex');
            // console.log(md5);
            // let p = __dirname + '\\pic\\' + md5 + ".png"
            // fs.access(p, fs.constants.F_OK, (err) => {
            //     if (err) {
            //         fs.promises.writeFile(p, data, (err) => {
            //             if (err) throw err;
            //             console.log('文件创建成功');
            //         });
            //     } else {
            //         console.log('文件已存在');
            //     }
            // });
            ctx.body = convert.saveFileWithHash(data);
        });
        router.all('/smsg', async (ctx, next) => {
            /*HTTP POST发送例子 文本 + bigface ：
            "t": 分为 "group", "friend"
            "uid": 为groupid/friendUin
            msg 和 data 共同组成 elements
            {
                "t": "group",
                "uid": "625224327",
                "msg":"[face,id=277,faceType=normal-extended][face,id=63,faceType=normal]asdff\r\n阿斯蒂芬\r\n士大夫\r\n",
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

                    je = await convert.convertMsg(ctx.request.body.msg, elements);
                if (ctx.request.body.data) {
                    for (let i = 0; i < ctx.request.body.data.length; i++) {
                        je.push(ctx.request.body.data[i])
                    }
                }

                let ret = await qqntim.nt.sendMessage({
                    "uid": ctx.request.body.uid,
                    "chatType": ctx.request.body.t
                }, je);
                ctx.body = `send_message req success! elementId: ${ret}`
            } else if (ctx.query.data) {
                let d = JSON.parse(ctx.query.data);
                if (d.msg)
                    je = await convert.convertMsg(d.msg, elements);
                if (d.data) {
                    for (let i = 0; i < d.data.length; i++) {
                        je.push(d.data[i])
                    }
                }
                let ret = await qqntim.nt.sendMessage({
                    "uid": d.uid,
                    "chatType": d.t
                }, je);
                ctx.body = `send_message req success! elementId: ${ret}`
            } else {
                ctx.body = 'error'
            }
        });

        app.use(router.routes());
        app.use(router.allowedMethods());
        app.listen(qjj.httpApiPort);
    }
};



var qjj = {
    "acc": 123456,
    "ws": true,
    "rwsUrl": "ws://127.0.0.1:4545",
    "http": true,
    "httpApiPort": 4544,
    "httpUrl": "127.0.0.1:4544",
    "wss": true,
    "wsServerPort": 4543,
    "sendHttpMsg": true,
    "sendHttpTar": "http://114.514.19.19:810/recv",
    "sendHistoryMsg": true
}


function messages2Msg(message, op) {
    var je = []
    for (let i = 0; i < message.length; i++) {
        var jj = message2Msg(message[i], op)
        je.push(jj)
    }
    return JSON.stringify(je)
}
function message2Msg(message, op) {
    var j = JSON, msg = ''
    if (op) j.op = op;
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
                    case 8:
                        let grayTipElement_ = i_.raw.grayTipElement
                        if (!grayTipElement_)
                            break;
                        let name = !message.sender.memberName ? message.sender.nickName : message.sender.memberName
                        msg = msg + `${name} 撤回了一条消息`
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
module.exports.message2Msg = message2Msg;
module.exports.messages2Msg = messages2Msg;