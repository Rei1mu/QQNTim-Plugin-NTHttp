import http = require("http");
import https = require("https");
import fs = require("fs");
import crypto = require("crypto");
import { URL } from "url";
const adr = __dirname.indexOf("src") ? __dirname.substring(0, __dirname.length - 4) : __dirname;
export interface _msg {
    m: string;
}
async function _i(tmp: any, _msg: _msg, elements: any) {
    let L1 = 0;
    let L2 = 0;
    let m2: any;
    let j: any;
    L1 = _msg.m.indexOf(tmp);
    // console.log(L1);
    if (L1 == -1) return -1;
    const m1 = _msg.m.substring(0, L1);
    const _msg1: _msg = { m: m1 };
    if (m1 !== "") await convertMsg(_msg1, elements);

    switch (tmp) {
        case "[pic=":
            L2 = _msg.m.indexOf("]", L1);
            if (L2 == -1) return -1;

            m2 = _msg.m.substring(L1 + tmp.length, L2);
            if (m2.startsWith("http")) {
                m2 = await getPicByUrl(m2);
            } else if (m2.indexOf("/") == -1) {
                //适配[pic=F53E57F1BC8190193187B69FD9D1B272]
                let md5 = m2.toUpperCase()
                m2 = await getPicByUrl(`http://gchat.qpic.cn/gchatpic_new//--${md5}/720/${md5}]`);
            }
            if (m2 !== "" && m2 !== "m2error") {
                if (fs.existsSync(m2)) elements.push({ type: "image", file: m2 });
            }
            break;
        case "[bigFace,": {
            let L3 = _msg.m.indexOf(",flag=", L1);
            if (L3 == -1) L3 = _msg.m.indexOf(",key=", L1);
            L2 = _msg.m.indexOf("]", L3 + 1);
            m2 = _msg.m.substring(L1 + tmp.length - 1, L2 + 1);
            const emojiPackageId = getArgs(",id=", m2) || getArgs(",emojiPackageId=", m2);
            const faceName = getArgs(",name=", m2) || getArgs(",faceName=", m2);
            const emojiId = getArgs(",hash=", m2) || getArgs(",emojiId=", m2);
            const key = getArgs(",key=", m2) || getArgs(",flag=", m2);
            // console.log("bigface", key, emojiId, faceName, emojiPackageId)
            j = {
                type: "raw",
                raw: {
                    elementType: 11,
                    elementId: "114514",
                    marketFaceElement: {
                        itemType: 6,
                        faceInfo: 1,
                        emojiPackageId: emojiPackageId,
                        subType: 3,
                        faceName: faceName,
                        emojiId: emojiId,
                        key: key,
                        emojiType: 1,
                    },
                },
            };
            elements.push(j);
            break;
        }
        case "[audio=":
            L2 = _msg.m.indexOf("]", L1);
            if (L2 == -1) return -1;
            m2 = _msg.m.substring(L1 + tmp.length, L2);
            if (fs.existsSync(m2)) {
                j = {
                    type: "raw",
                    raw: {
                        elementType: 4,
                        pttElement: {
                            filePath: m2,
                        },
                    }
                };
                //"C:\\soft\\qpic\\123456\\nt_qq\\nt_data\\Ptt\\2023-07\\Ori\\9fcab3ea090a3ee6ff8e3a04b44f74d6.amr"
                elements.push(j);
            }
            _msg.m = _msg.m.substring(L2 + 1, _msg.m.length);
            return L1;
        case "[face,": {
            //   console.log("ffffffffffface", _msg, elements);
            L2 = _msg.m.indexOf("]", L1);
            // console.log("ffffffffffface2", L1, L2, _msg, elements);
            if (L2 == -1) return -1;
            m2 = _msg.m.substring(L1 + tmp.length - 1, L2 + 1);
            const faceIndex = getArgs(",id=", m2) || getArgs(",faceIndex=", m2) || getArgs(",Id=", m2);
            const faceType = getArgs(",faceType=", m2);
            j = {
                type: "face",
                faceIndex: faceIndex,
                faceType: faceType,
            };
            elements.push(j);
            //console.log("ffffffffffface3", L1, L2, _msg, elements);
            break;
        }
        case "[reply,": {
            L2 = _msg.m.indexOf("]", L1);
            if (L2 == -1) return -1;
            m2 = _msg.m.substring(L1 + tmp.length - 1, L2 + 1);
            const replayMsgSeq = getArgs(",msgSeq=", m2) || getArgs(",replayMsgSeq=", m2);
            const senderUid = getArgs(",uin=", m2) || getArgs(",senderUid=", m2);
            const replyMsgTime = getArgs(",msgTime=", m2) || getArgs(",replyMsgTime=", m2);
            //console.log(m2, replayMsgSeq, senderUid, replyMsgTime)
            j = senderUid
                ? {
                    type: "raw",
                    raw: {
                        elementType: 7,
                        replyElement: {
                            replayMsgSeq: replayMsgSeq,
                            senderUid: senderUid,
                            replyMsgTime: replyMsgTime,
                        },
                    }
                }
                : {
                    type: "raw",
                    raw: {
                        elementType: 7,
                        replyElement: {
                            replayMsgSeq: replayMsgSeq,
                            senderUidStr: getArgs(",uid=", m2) || getArgs(",senderUidStr=", m2),
                            replyMsgTime: replyMsgTime,
                        },
                    }
                };
            elements.push(j);
            break;
        }
        case "[@":
            L2 = _msg.m.indexOf("]", L1);
            if (L2 == -1) return -1;
            m2 = _msg.m.substring(L1 + tmp.length, L2);
            j = {
                type: "raw",
                raw: {
                    elementType: 1,
                    textElement: {
                        atType: 2,
                        atNtUid: m2,
                    },
                }
            };
            elements.push(j);
            break;
        case "[json=":
            L2 = _msg.m.lastIndexOf("]", L1);
            if (L2 == -1) return -1;
            m2 = _msg.m.substring(L1 + tmp.length, L2);
            j = {
                type: "raw",
                raw: {
                    elementType: 10,
                    arkElement: {
                        bytesData: m2,
                    },
                }
            };
            elements.push(j);
            break;
        case "[xml=":
            L2 = _msg.m.lastIndexOf("]", L1);
            if (L2 == -1) return -1;
            m2 = _msg.m.substring(L1 + tmp.length, L2);
            j = {
                type: "raw",
                raw: {
                    elementType: 1,
                    multiForwardMsgElement: {
                        xmlContent: m2,
                        // "resId": "ldsviXEpNPHBsuE1JoSylD99jSGQ31cy3lgbLrX539zxNgETP8GD+u6uuNeUX2PS",
                        // "fileName": "C7EEDCC3-C627-4DDD-8EF5-3300AB27BD56"
                    },
                }
            };
            elements.push(j);
            break;
    }
    // console.log(L1, "tmp1:", `((((${tmp}))))`, _msg.m, JSON.stringify(elements));
    _msg.m = _msg.m.substring(L2 + 1, _msg.m.length);
    // console.log(L1, "tmp2:", `((((${tmp}))))`, _msg.m, JSON.stringify(elements));
    // console.log("ffffffffffface4", L1, L2, _msg, elements);
    if (L1 !== -1) {
        // L1 = 0
        return false;
    } else {
        return true;
    }
}

export async function convertMsg(_msg: _msg, elements: any) {
    while (true) {
        //全true则 -1，否则 1-6继续循环
        const i_ = await _i("[json=", _msg, elements) ?
            await _i("[xml=", _msg, elements) ?
                await _i("[face,", _msg, elements) ?
                    await _i("[bigFace,", _msg, elements) ?
                        await _i("[pic=", _msg, elements) ?
                            await _i("[audio=", _msg, elements) ?
                                -1 : 1 : 2 : 3 : 4 : 5 : 6;

        console.log("TMP3:", i_, _msg, elements);
        if (i_ > -1) {

        } else {
            if (_msg.m == "") {
                break;
            } else {
                console.log();
                await elements.push({ type: "text", content: _msg.m.replaceAll("\r\n", "\r") });
                _msg.m = "";
            }
        }
    }
    return elements;
}
function getArgs(args: string | any, m2: any) {
    const L3 = m2.indexOf(args);
    if (L3 == -1) return "";
    let L4 = m2.indexOf(",", L3 + 1);
    if (L4 == -1) L4 = m2.indexOf("]", L3 + 1);
    return m2.substring(L3 + args.length, L4);
}

export function saveFileWithHash(data: Buffer): any {
    if (data.length < 100)
        if (data.toString() == "Not Found") {
            return "";
        }
    const hash = crypto.createHash("md5");
    hash.update(data);
    const md5 = hash.digest("hex");

    const p = `${adr}\\pic\\${md5}.png`;
    fs.access(p, fs.constants.F_OK, async (err) => {
        if (err) {
            fs.writeFile(p, data, (err) => {
                if (err) {
                    fs.mkdir(`${adr}\\pic`, { recursive: true }, (err) => {
                        if (err) throw err;
                    });
                    fs.writeFile(p, data, (err) => {
                        if (err) throw err;
                        console.log("文件创建成功");
                    });
                }
                console.log("文件创建成功");
            });
        } else {
            console.log("文件已存在");
        }
    });
    return p;
}
async function getPicByUrl(url: string) {
    const http_ = url.startsWith("https") ? https : http;
    let buffer = Buffer.alloc(0);

    return new Promise((resolve, reject) => {
        http_
            .get(url, (res) => {
                res.on("data", (chunk) => {
                    buffer = Buffer.concat([buffer, chunk]);
                });
                res.on("end", () => {
                    resolve(saveFileWithHash(buffer));
                });
            })
            .on("error", (err) => {
                if (err) resolve("");
            });
    });
}
