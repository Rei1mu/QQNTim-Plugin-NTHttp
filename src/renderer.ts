import { getPluginConfig } from "./config";
import { usePluginConfig } from "./utils/hooks";
import * as qqntim from "qqntim/renderer";

import Koa = require("koa");
import Router = require("koa-router");
import bodyParser = require("koa-bodyparser");
import * as convert from "./msg";
const app = new Koa();
const router = new Router();
import WebSocket = require("ws");
import * as fs from "fs";
const modulePaths = require.resolve.paths("express"); //require path
console.log(modulePaths);
console.log(__dirname);
const WebSocketServer = WebSocket.Server;
const wssClients = new Set();
const qj_uMap = new Map();
fs.mkdir(`${__dirname}\\pic`, { recursive: true }, (err) => {
    if (err) throw err;
});

let lock: boolean;
let botID: any = qqntim.nt.getAccountInfo()
let ws: WebSocket;
const config = getPluginConfig(qqntim.env.config.plugins.config);

export default class Entry implements QQNTim.Entry.Renderer {
    constructor() {
    }
}

console.log("[Template] Hello world!", qqntim);
console.log("[Template] 当前插件配置：", config);
// usePluginConfig(config, setConfig)

if (config.ws) {
    try {
        createWs();
    } catch {
        console.log("WsConnect error");
    }
}
if (config.http) {
    try {
        useHttpApi();
    } catch (err) {
        console.log("useHttp() error");
    }
}
if (config.wss) {
    createWsServer();
}

async function recvWsMsgEvent(j, cws) {
    let elements: any;
    let je: any;
    if (!j) return;
    if (j.op == "smsg") {
        const _msg: convert._msg = { m: j.msg };
        if (j.msg) je = await convert.convertMsg(_msg, elements);
        if (j.data) {
            for (let i = 0; i < j.data.length; i++) {
                je.push(j.data[i]);
            }
        }
        const elementId = await qqntim.nt.sendMessage(
            {
                uid: j.uid,
                chatType: j.t,
            },
            je,
        );
        let j1;
        j1.op = "callback";
        j1.eventId = !j.eventId ? 1 : j.eventId;
        j1.elementId = elementId;
        cws.send(JSON.stringify(j1));
    }
}
function createWsServer() {
    try {
        const wss = new WebSocketServer({ port: config.wsServerPort });
        wss.on("connection", function connection(wsse) {
            wsse.send(`bind:qqntim||${config.httpUrl}||${botID.uin}||${botID.uid}`);
            wssClients.add(wsse);
            wsse.on("message", function incoming(data) {
                //  console.log('received: %s', data);

                const msg = data.toString();
                //  console.log(msg);
                if (msg == "ping") {
                    wsse.send("pong");
                    return;
                }
                const j = JSON.stringify(msg);
                recvWsMsgEvent(j, wsse);
            });
            wsse.on("close", function close() {
                wssClients.delete(wsse);
            });
        });
    } catch (e) {
        //  console.log("createWsServer() error"); console.log(e);
    }
}

function createWs() {
    try {
        ws = new WebSocket(config.wsTarUrl);
        initEventHandle();
    } catch (e) {
        reconnect();
    }
}

function initEventHandle() {
    ws.on("open", function open() {
        ws.send(`bind:qqntim||${config.httpUrl}||${botID.uin}||${botID.uid}`);
        heartCheck.start();
    });

    ws.on("message", function incoming(data) {
        // console.log('data', data);
        // 如果收到心跳消息，就重置心跳检测
        const msg = data.toString();
        //  console.log(msg);
        if (msg == "pong") {
            heartCheck.reset().start();
            return;
        }
        const j = JSON.stringify(msg);
        recvWsMsgEvent(j, ws);
    });

    ws.on("error", function error(err) {
        console.log(err);
        reconnect();
    });

    ws.on("close", function close() {
        console.log("disconnected");
        reconnect();
    });
}
function reconnect() {
    if (lock) return;
    lock = true;
    setTimeout(function () {
        console.log("reconnecting");
        createWs();
        lock = false;
    }, 2000);
}
const heartCheck = {
    timeout: 15000,
    timeoutObj: null,
    start: function () {
        const self = this;
        this.timeoutObj = setTimeout(function () {
            // 发送心跳消息
            ws.send("ping");
            // 如果超过一定时间没有收到回复，就关闭连接，触发重连
            // self.timeoutObj = setTimeout(function () {
            //     ws.close();
            // }, self.timeout);
        }, this.timeout);
    },
    reset: function () {
        clearTimeout(this.timeoutObj);
        return this;
    },
};

function sendMsg(data) {
    if (data == "[]") return
    if (config.ws) {
        try {
            ws.send(data);
        } catch (e) {
            console.log("ws.send error");
        }
    }
    if (config.sendHttpMsg) {
        //若多账号则需修改为不冲突的端口号
        postMsg(data);
    }
    if (config.wss) {
        //若多账号则需修改为不冲突的端口号
        try {
            sendWsServerMsg(data);
        } catch (e) {
            console.log("wssSend error");
        }
    }
}
function sendWsServerMsg(message) {
    if (wssClients.size < 1) return;
    wssClients.forEach(function each(client: any) {
        // 如果客户端处于打开状态，就发送消息
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

qqntim.nt.getFriendsList(true).then((list) => {
    console.log("[Example-AutoReply] 好友列表", list);
    list.forEach((friend) =>
        qqntim.nt.getPreviousMessages({ chatType: "friend", uid: friend.uid }, 20).then(async (messages) => {
            // ws.send(JSON.stringify(messages));
            // console.log(
            //     "[Example-AutoReply] 好友 " +
            //     friend.nickName +
            //     " 的最近 20 条消息",
            //     messages
            // )
            if (config.sendHistoryMsg) {
                const data = await messages2Msg(messages, "LoadListFriends");
                // console.log('msgLog: ', data);

                sendMsg(data);
            }
        }),
    );
});

qqntim.nt.getGroupsList(true).then((list) => {
    //  console.log("[Example-AutoReply] 群组列表", list);
    list.forEach((group) =>
        qqntim.nt.getPreviousMessages({ chatType: "group", uid: group.uid }, 20).then(async (messages) => {
            //  ws.send(JSON.stringify(messages));
            // console.log("[Example-AutoReply] 群组 " + group.name + " 的最近 20 条消息", messages)
            if (config.sendHistoryMsg) {
                const data = await messages2Msg(messages, "LoadListGroups");

                sendMsg(data);
            }
        }),
    );
});

qqntim.nt.on("new-messages", (messages) => {
    messages.forEach(async (message: any) => {
        ws.send(JSON.stringify(messages));
        message.sender.uin = await getUserUin(message.sender.uid);
        const data = message2Msg(message, "newMsg");
        //  console.log('msgLog: ', data)
        sendMsg(data);
    });
});

async function getUserUin(uid) {
    let isUid: any;
    if (uid.startsWith("u_")) isUid = true;
    const r = qj_uMap.get(uid);

    if (!r || r == "") {
        if (isUid) {
            const j = await qqntim.nt.getUserInfo(uid);
            if (j.uin) {
                qj_uMap.set(uid, j.uin);
                qj_uMap.set(j.uin, uid);
            }
            return j.uin;
        } else {
            return "";
        }
    } else {
        return r;
    }
}

function postMsg(data) {
    fetch(config.sendHttpTar, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },
    });
}

function useHttpApi() {
    app.use(
        bodyParser({
            formLimit: "20mb",
            jsonLimit: "20mb",
        }),
    );
    router.get("/", async (ctx, next) => {
        // ctx.body = qqntim.nt.getFriendsList1()
        const list = botID.uin;
        ctx.body = list;
    });
    router.get("/bot", (ctx, next) => {
        ctx.body = JSON.stringify(botID);
    });
    router.get("/friendList", async (ctx, next) => {
        const list = await qqntim.nt.getFriendsList(true);
        ctx.body = JSON.stringify(list);
    });
    router.get("/groupList", async (ctx, next) => {
        const list = await qqntim.nt.getGroupsList(true);
        ctx.body = JSON.stringify(list);
    });
    router.get("/getUserInfo", async (ctx: any) => {
        const _uid: string = ctx.request.query.uid;
        if (ctx.request.query.uid) {
            const list = await qqntim.nt.getUserInfo(_uid);
            ctx.body = JSON.stringify(list);
        }
    });

    router.get("/getUin", async (ctx,) => {
        const _uid: any = ctx.request.query.uid;
        if (ctx.request.query.uid) {
            const list = await getUserUin(_uid);
            ctx.body = list;
        }
    });
    router.get("/gpic", async (ctx, next) => {
        const path = ctx.request.query.path;
        ctx.response.type = "image/png";
        ctx.response.body = fs.readFileSync(`${path}`);
        //自己开Api共享图片
        //一般pcqqnt接收图片的位置在"qqnt运行目录\nt_qq\nt_data\Pic\2023-06\Ori\8edf519ea8d2b47ca2fd72ef74fb482b.png"
    });
    router.get("/gau", async (ctx, next) => {
        //取语音文件
        const path = ctx.request.query.path;
        ctx.response.type = "audio/amr";
        ctx.response.body = fs.readFileSync(`${path}`);
    });
    router.all("/revokeMessageById", async (ctx: any, next) => {
        //撤回消息
        // qqntim.nt.revokeMessage(message.peer, id);
        const _uid: any = ctx.request.query.uid;
        if (ctx.request.query.uid) {
            qqntim.nt.revokeMessage(
                {
                    uid: ctx.request.query.uid,
                    chatType: ctx.request.query.t,
                },
                ctx.request.query.id,
            );
            ctx.body = "revokeMessageById req success nya";
        } else if (ctx.request.body) {
            console.log(ctx.request.body)
            const d = (ctx.request.body);
            console.log(d)
            await qqntim.nt.revokeMessage(
                {
                    uid: d.uid,
                    chatType: d.t,
                },
                d.id,
            );
            ctx.body = `revokeMessageById req success nya`;
        } else {
            ctx.body = "error";
        }
    });

    router.post("/uploadPic", async (ctx: { request: { rawBody: WithImplicitCoercion<string> | { [Symbol.toPrimitive](hint: "string"): string; }; }; body: any; }) => {
        //保存图片到本地，上传必需b64编码，默认保存位置为 ws文件夹\pic\ 下
        //base64解码图片的编码，处理后保存命名hash值并返回保存路径
        const data = Buffer.from(ctx.request.rawBody, "base64");

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

    router.all("/smsg", async (ctx) => {
        let elements: any = []; let je: any = [];
        if (ctx.request.query.uid) {
            if (ctx.request.query.msg) je = await convert.convertMsg(ctx.request.query.msg, elements);
            if (ctx.request.query.data) for (let i = 0; i < ctx.request.query.data.length; i++) je.push(ctx.request.query.data[i]);

            const ret = await qqntim.nt.sendMessage({ uid: ctx.request.query.uid, chatType: ctx.request.query.t }, je);
            ctx.body = `send_message req success! elementId: ${ret}`
        } else if (ctx.request.body) {
            const d: any = (ctx.request.body);
            let _msg = { m: d.msg };
            if (d.msg) je = await convert.convertMsg(_msg, elements);
            if (d.data) for (let i = 0; i < d.data.length; i++) await je.push(d.data[i]);
            const ret = await qqntim.nt.sendMessage({ uid: d.uid, chatType: d.t }, je)
            ctx.body = `send_message req success! elementId: ${ret}`
        } else {
            ctx.body = "error";
        }
    });

    app.use(router.routes());
    app.use(router.allowedMethods());
    app.listen(config.httpApiPort);
}
async function messages2Msg(message: any, op: any) {
    let je: any = [];
    for (let i = 0; i < message.length; i++) {
        message[i].sender.uin = await getUserUin(message[i].sender.uid);
        await je.push(message2Msg(message[i], op));
    }
    return JSON.stringify(je);
}
export function message2Msg(message: any, op: any) {
    const j: any = {};

    let msg: string = "";
    if (op) j.op = op;
    switch (message.peer.chatType) {
        case "friend":
            j.eventType = "private_msg";
            break;
        case "group":
            j.eventType = "group_msg";
            break;
    }
    //  ws.send(JSON.stringify(j));

    j.peer = message.peer;
    j.sender = message.sender;
    j.msgId = message.raw.msgId;
    j.msgRandom = message.raw.msgRandom;
    j.msgSeq = message.raw.msgSeq;
    for (let i = 0; i < message.elements.length; i++) {
        const i_ = message.elements[i];
        switch (i_.type) {
            case "text":
                if (i_.raw.elementType == 1) {
                    const atNtUid_ = i_.raw.textElement.atNtUid;
                    if (!atNtUid_) {
                        const c = i_.content;
                        msg = msg + c.replaceAll("\r", "\r\n");
                        break;
                    } else {
                        msg = `${msg}[@${atNtUid_}]`;
                        break;
                    }
                } else {
                    const c = i_.content;
                    msg = msg + c.replaceAll("\r", "\r\n");
                    break;
                }
            case "image":
                //如果是内测版： msg = `${msg}[pic=${config.httpUrl}/gpic?path=${i_.file}]`;
                let md5 = i_.raw.picElement.md5HexStr.toUpperCase()
                //md5版
                msg = `${msg}[pic=${md5}]`;
                //link版
                // msg = `${msg}[pic=http://gchat.qpic.cn/gchatpic_new//--${md5}/720/${md5}]`;
                // http://gchat.qpic.cn/gchatpic_new//--F53E57F1BC8190193187B69FD9D1B272/720
                break;
            case "face":
                msg = `${msg}[face,Id=${i_.faceIndex},faceType=${i_.faceType}]`;
                break;
            case "raw":
                switch (i_.raw.elementType) {
                    case 1: {
                        const atNtUid_ = i_.raw.textElement.atNtUid;
                        if (!atNtUid_) break;
                        msg = `${msg}[@${atNtUid_}]`;
                        break;
                    }
                    case 11: {
                        const bigFace_ = i_.raw.marketFaceElement;
                        if (!bigFace_) break;
                        msg = `${msg}[bigFace,id=${bigFace_.emojiPackageId},name=${bigFace_.faceName},hash=${bigFace_.emojiId},flag=${bigFace_.key}]`;
                        break;
                    }
                    case 4: {
                        const pttElement_ = i_.raw.pttElement;
                        if (!pttElement_) break;
                        msg = `${msg}[audio=${config.httpUrl}/gau?path=${pttElement_.filePath}]`;
                        break;
                    }
                    case 7: {
                        const replyElement_ = i_.raw.replyElement;
                        if (!replyElement_) break;
                        msg = `${msg}[reply,msgSeq=${replyElement_.replayMsgSeq},uin=${replyElement_.senderUid},uid=${replyElement_.senderUidStr},msgTime=${replyElement_.replyMsgTime}]`;
                        break;
                    }
                    case 8: {
                        const grayTipElement_ = i_.raw.grayTipElement;
                        if (!grayTipElement_) break;
                        const name = !message.sender.memberName ? message.sender.nickName : message.sender.memberName;
                        msg = `${msg}${name} 撤回了一条消息`;
                        break;
                    }
                    case 16: {
                        const xmlContent_ = i_.raw.multiForwardMsgElement.xmlContent;
                        if (!xmlContent_) break;
                        msg = `${msg}[xml=${xmlContent_}]`;
                        break;
                    }
                    case 10: {
                        const arkElement_ = i_.raw.arkElement.bytesData;
                        if (!arkElement_) break;
                        msg = `${msg}[json=${arkElement_}]`;
                        break;
                    }
                }
        }
    }

    j.msg = msg;
    const jr: any = JSON.stringify(j);
    return jr;
}
