const http = require('http');
const https = require('https');
const fs = require('fs');
const crypto = require('crypto');
const adr = __dirname.substring(0, __dirname.length - 4)

async function convertMsg(m, elements) {
    let L1
    while (true) {
        L1 = m.indexOf(`[pic=`)

        if (L1 !== -1) {
            let m1 = m.substring(0, L1);
            if (m1 !== '') {
                await convertMsg(m1, elements)
            }
            let L2 = m.indexOf(`]`, L1);
            if (L2 !== -1) {
                let m2 = m.substring(L1 + 5, L2);
                if (m2.startsWith('http')) {
                    try {
                        m2 = await getPicByUrl(m2);
                    } catch (error) {
                        m2 = "m2error";
                    }
                }
                if (m2 !== "" && m2 !== "m2error") {
                    if (fs.existsSync(m2))
                        elements.push({ type: "image", file: m2 })
                }
                m = m.substring(L2 + 1, m.length);
            } else {
                break;
            }
        } else {
            //[bigFace,id=234779,name=[擦汗],hash=feeabe66a1802901854d7574e3bcedae,key=1f895b61413fd55e]
            L1 = m.indexOf(`[bigFace,`)
            if (L1 !== -1) {
                let m1 = m.substring(0, L1);
                if (m1 !== '') {
                    await convertMsg(m1, elements)
                }
                let L3 = m.indexOf(`,flag=`, L1), emojiPackageId, faceName, emojiId, key;
                if (L3 == -1) L3 = m.indexOf(`,key=`, L1)
                if (L3 !== -1) {
                    let L2 = m.indexOf(`]`, L3 + 1);
                    let m2 = m.substring(L1, L2 + 1);
                    emojiPackageId = getArgs(',id=', m2) || getArgs(',emojiPackageId=', m2)
                    faceName = getArgs(',name=', m2) || getArgs(',faceName=', m2)
                    emojiId = getArgs(',hash=', m2) || getArgs(',emojiId=', m2)
                    key = getArgs(',key=', m2) || getArgs(',flag=', m2)
                    // console.log("bigface", key, emojiId, faceName, emojiPackageId)
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
                    elements.push(j)
                    m = m.substring(L2 + 1, m.length);
                } else {
                    break;
                }
            } else {
                L1 = m.indexOf(`[audio=`)
                if (L1 !== -1) {
                    let m1 = m.substring(0, L1);
                    if (m1 !== '') {
                        await convertMsg(m1, elements)
                    }
                    let L2 = m.indexOf(`]`, L1);
                    if (L2 !== -1) {
                        let m2 = m.substring(L1 + 7, L2);

                        if (fs.existsSync(m2)) {
                            let j = {
                                "type": "raw",
                                "raw": {
                                    "elementType": 4,
                                    "pttElement": {
                                        "filePath": m2
                                    }
                                }
                            }
                            //"C:\\soft\\qpic\\123456\\nt_qq\\nt_data\\Ptt\\2023-07\\Ori\\9fcab3ea090a3ee6ff8e3a04b44f74d6.amr"
                            elements.push(j)
                        }
                        m = m.substring(L2 + 1, m.length);
                    } else {
                        break;
                    }
                } else {
                    //[face,id=277,faceType=normal-extended][face,id=63,faceType=normal]
                    L1 = m.indexOf(`[face,`)
                    if (L1 !== -1) {
                        let m1 = m.substring(0, L1);
                        if (m1 !== '') {
                            await convertMsg(m1, elements)
                        }
                        let L2 = m.indexOf(`]`, L1);
                        if (L2 !== -1) {
                            let m2 = m.substring(L1 + 5, L2 + 1);
                            faceIndex = getArgs(',id=', m2) || getArgs(',faceIndex=', m2) || getArgs(',Id=', m2)
                            faceType = getArgs(',faceType=', m2)
                            let j = {
                                "type": "face",
                                "faceIndex": faceIndex,
                                "faceType": faceType
                            }
                            elements.push(j)
                            m = m.substring(L2 + 1, m.length);
                        } else {
                            break;
                        }
                    } else {
                        //[reply,msgSeq=${replyElement_.replayMsgSeq},uin=${replyElement_.senderUid},uid=${replyElement_.senderUidStr},msgTime=${replyElement_.replyMsgTime}]
                        //[reply,msgSeq=2431,senderUid=123456,replyMsgTime=1688387198]
                        //  "replayMsgSeq": "2431",
                        // "senderUid": "123456",
                        //  "senderUidStr": "u_gjayzWw6w_6Jp1nZhenOUg",
                        // "replyMsgTime": "1688387198"
                        L1 = m.indexOf(`[reply,`)
                        if (L1 !== -1) {
                            let m1 = m.substring(0, L1);
                            if (m1 !== '') {
                                await convertMsg(m1, elements)
                            }
                            let L2 = m.indexOf(`]`, L1), L3, replayMsgSeq, senderUid, senderUidStr, replyMsgTime;
                            if (L2 !== -1) {
                                let m2 = m.substring(L1 + 6, L2 + 1);
                                replayMsgSeq = getArgs(',msgSeq=', m2) || getArgs(',replayMsgSeq=', m2)
                                senderUid = getArgs(',uin=', m2) || getArgs(',senderUid=', m2)
                                replyMsgTime = getArgs(',msgTime=', m2) || getArgs(',replyMsgTime=', m2)
                                //console.log(m2, replayMsgSeq, senderUid, replyMsgTime)
                                let j = senderUid ? {
                                    "type": "raw",
                                    "raw": {
                                        "elementType": 7,
                                        "replyElement": {
                                            "replayMsgSeq": replayMsgSeq,
                                            "senderUid": senderUid,
                                            "replyMsgTime": replyMsgTime
                                        }
                                    }
                                } : {
                                    "type": "raw",
                                    "raw": {
                                        "elementType": 7,
                                        "replyElement": {
                                            "replayMsgSeq": replayMsgSeq,
                                            "senderUidStr": getArgs(',uid=', m2) || getArgs(',senderUidStr=', m2),
                                            "replyMsgTime": replyMsgTime
                                        }
                                    }
                                }
                                elements.push(j)
                                m = m.substring(L2 + 1, m.length);
                            } else {
                                break;
                            }
                        } else {
                            //[@u_noGwjHveY-OvOXyWsqYAXw]
                            L1 = m.indexOf(`[@`)
                            if (L1 !== -1) {
                                let m1 = m.substring(0, L1);
                                if (m1 !== '') {
                                    await convertMsg(m1, elements)
                                }
                                let L2 = m.indexOf(`]`, L1);
                                if (L2 !== -1) {
                                    let m2 = m.substring(L1 + 2, L2);
                                    let j = {
                                        "type": "raw",
                                        "raw": {
                                            "elementType": 1,
                                            "textElement": {
                                                "atType": 2,
                                                "atNtUid": m2
                                            }
                                        }
                                    }
                                    elements.push(j)
                                    m = m.substring(L2 + 1, m.length);
                                } else {
                                    break;
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
        }
    }
    return elements;
}
function getArgs(args, m2) {
    let L3 = m2.indexOf(args)
    if (L3 == -1) return "";
    let L4 = m2.indexOf(',', L3 + 1)
    if (L4 == -1) L4 = m2.indexOf(']', L3 + 1)
    return m2.substring(L3 + args.length, L4)
}
function saveFileWithHash(data) {
    if (data.length < 100)
        if (data.toString() == "Not Found") { return "" };
    const hash = crypto.createHash('md5');
    hash.update(data);
    const md5 = hash.digest('hex');

    let p = adr + '\\pic\\' + md5 + ".png"
    fs.access(p, fs.constants.F_OK, async (err) => {
        if (err) {
            fs.writeFile(p, data, (err) => {
                if (err) throw err;
                // console.log('文件创建成功');

            });
        } else {
            //console.log('文件已存在');
        }
    });
    return p;
}
function getPicByUrl(url) {
    const http_ = url.startsWith('https') ? https : http
    return new Promise((resolve, reject) => {
        http_.get(url, res => {
            const chunks = []
            res.on('data', chunk => {
                chunks.push(chunk)
            })
            res.on('end', () => {
                resolve(saveFileWithHash(Buffer.concat(chunks)))
            })
            res.on('error', err => {
                console.log(err)
            })
        })
    })
}




module.exports.convertMsg = convertMsg;
module.exports.saveFileWithHash = saveFileWithHash;
