import { getPluginConfig } from "./config";
import { usePluginConfig } from "./utils/hooks";
//import * as qqntim from "qqntim/renderer";

import Koa = require("koa");
import Router = require("koa-router");
import bodyParser = require("koa-bodyparser");
import * as convert from "./msg";
const app = new Koa();
const router = new Router();
import WebSocket = require("ws");
import * as fs from "fs";

async function t() {
    const elements: any = [];
    let je: any = [];
    const d = {
        op: "smsg",
        t: "group",
        uid: "625224327",
        msg: "你好wa",
        data: [
            { type: "raw", raw: { elementType: 1, textElement: { atType: 2, atNtUid: "u_noGwjHveY-OvOXyWsqYAXw" } } },
            { type: "text", content: " asdff" },
            { type: "raw", raw: { elementType: 11, elementId: "1", marketFaceElement: { itemType: 6, faceInfo: 1, emojiPackageId: 234779, subType: 3, imageWidth: 200, imageHeight: 200, faceName: "[擦汗]", emojiId: "feeabe66a1802901854d7574e3bcedae", key: "1f895b61413fd55e", emojiType: 1 } } },
            { type: "raw", raw: { elementType: 11, elementId: "1", marketFaceElement: { itemType: 6, faceInfo: 1, emojiPackageId: 232180, subType: 3, imageWidth: 200, imageHeight: 200, faceName: "[开心]", emojiId: "838396c7ac3d91fd95d704640a4a8b06", key: "6fdfb73e5854178b", emojiType: 1 } } },
            { type: "text", content: "(by ntqq)" },
            { type: "face", faceIndex: 277, faceType: "normal-extended" },
            { type: "face", faceIndex: 63, faceType: "normal" },
        ],
    };
    const _msg = { m: d.msg };
    if (d.msg) je = await convert.convertMsg(_msg, elements);
    console.log(d.data);
    if (d.data) for (let i = 0; i < d.data.length; i++) je.push(d.data[i]);
    // const ret = await qqntim.nt.sendMessage(
    //     {
    //         uid: d.uid,
    //         chatType: d.t,
    //     },
    //     je
    // )
    const uu: _msg = {
        m: "你好wa",
        // m: "[pic=http://127.0.0.2:4544/gpic?path=C:\\soft\\qpic\\3020646829\\nt_qq\\nt_data\\Pic\\2023-06\\Ori\\8edf519ea8d2b47ca2fd72ef74fb482b.png][face,id=277,faceType=normal-extended][face,id=63,faceType=normal]你好miao[face,id=63,faceType=normal][face,id=277,faceType=normal-extended]",
    };

    // var u1 = { v: u }
    // const elements: any = [];
    // const je = await convert.convertMsg(uu, elements);
    console.log("jeeee", je);
    console.log("uu", uu);
    // ka.m = "[pic=http://127.0.0.1:4544/gpic?path=C:\\soft\\qpic\\3020646829\\nt_qq\\nt_data\\Pic\\2023-06\\Ori\\8edf519ea8d2b47ca2fd72ef74fb482b.png][face,id=277,faceType=normal-extended][face,id=63,faceType=normal]你好";
    //await t2(ka)
    //console.log(ka)
    console.log("t1()", await t1());
}
t();

interface _msg {
    m: any;
}
async function t1() {
    return 1 ? (1 ? (1 ? false : true) : true) : true;
    // 全1 执行假 否则 执行其他
}
async function t2(ka: any) {
    ka.m = "114514";
}
// function t1() {
//     return 0 ?0 ? 1 ? 2 : 3 : 4 : 5
// }[pic=c:\\1.png][reply,msgSeq=2431,senderUid=3020646829,replyMsgTime=1688387198][@u_noGwjHveY-OvOXyWsqYAXw][bigFace,id=234779,name=[擦汗],hash=feeabe66a1802901854d7574e3bcedae,key=1f895b61413fd55e][face,id=277,faceType=normal-extended][face,id=63,faceType=normal]asdff\r\n阿斯蒂芬\r\n士大夫\r\n[pic=http://127.0.0.1:4544/gpic?path=C:\\soft\\qpic\\3020646829\\nt_qq\\nt_data\\Pic\\2023-06\\Ori\\8edf519ea8d2b47ca2fd72ef74fb482b.png]
// console.log(t1())
