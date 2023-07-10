## 发送消息

### HttpApi

#### \smsg
支持 Post/GET 调用
例：
##### POST JSON
```
{
    "t": "group",
    "uid": "625224327",
    "msg":"asdff\r\n阿斯蒂芬\r\n士大夫\r\n[pic=http:\/\/127.0.0.1:4544\/gpic?path=C:\\soft\\qpic\\3020646829\\nt_qq\\nt_data\\Pic\\2023-06\\Ori\\8edf519ea8d2b47ca2fd72ef74fb482b.png]",
    "data": [
         {
                "type": "raw",
                "raw": {
                    "elementType": 1,
                    "textElement": {
                        "atType": 2,
                        "atNtUid": "u_noGwjHveY-OvOXyWsqYAXw"
                    }
                }
            },{
            "type": "text",
            "content": " asdff"
        },
        {
            "type": "raw",
            "raw": {
                "elementType": 11,
                "elementId": "1",
                "marketFaceElement": {
                    "itemType": 6,
                    "faceInfo": 1,
                    "emojiPackageId": 234779,
                    "subType": 3,
                    "imageWidth": 200,
                    "imageHeight": 200,
                    "faceName": "[擦汗]",
                    "emojiId": "feeabe66a1802901854d7574e3bcedae",
                    "key": "1f895b61413fd55e",
                    "emojiType": 1
                }
            }
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
        },
        {
            "type": "face",
            "faceIndex": 277,
            "faceType": "normal-extended"
        },
        {
            "type": "face",
            "faceIndex": 63,
            "faceType": "normal"
        }
    ]
}
```