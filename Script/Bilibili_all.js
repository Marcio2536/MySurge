const url = $request.url
let body = $response.body
body = JSON.parse(body)

if (url.includes('feed/index')) {
    body['data']['items'].forEach((element, index) => {
        if (element.hasOwnProperty('ad_info') || element.hasOwnProperty('banner_item') || element['card_type'] != 'small_cover_v2') {
            body['data']['items'].splice(index, 1)
        }
    })
} else if (url.includes('account/mine')) {
    body['data']['sections_v2'] = [
        {
            "items": [
                {
                    "id": 396,
                    "title": "离线缓存",
                    "uri": "bilibili://user_center/download",
                    "icon": "http://i0.hdslb.com/bfs/archive/5fc84565ab73e716d20cd2f65e0e1de9495d56f8.png"
                },
                {
                    "id": 397,
                    "title": "历史记录",
                    "uri": "bilibili://user_center/history",
                    "icon": "http://i0.hdslb.com/bfs/archive/8385323c6acde52e9cd52514ae13c8b9481c1a16.png"
                },
                {
                    "id": 398,
                    "title": "我的收藏",
                    "uri": "bilibili://user_center/favourite",
                    "icon": "http://i0.hdslb.com/bfs/archive/d79b19d983067a1b91614e830a7100c05204a821.png"
                },
                {
                    "id": 399,
                    "title": "稍后再看",
                    "uri": "bilibili://user_center/watch_later",
                    "icon": "http://i0.hdslb.com/bfs/archive/63bb768caa02a68cb566a838f6f2415f0d1d02d6.png",
                    "need_login": 1
                }
            ],
            "style": 1,
            "button": {}
        },
        {
            "items": [
                {
                    "id": 410,
                    "title": "设置",
                    "icon": "http://i0.hdslb.com/bfs/archive/e932404f2ee62e075a772920019e9fbdb4b5656a.png",
                    "uri": "bilibili://user_center/setting"
                }
            ],
            "style": 2,
            "button": {}
        }
    ]

} else if (url.includes('show/tab')) {
    body['data']['tab'] = [
        {
            "id": 39,
            "name": "直播",
            "uri": "bilibili://live/home",
            "tab_id": "直播tab",
            "pos": 1
        },
        {
            "id": 40,
            "name": "推荐",
            "uri": "bilibili://pegasus/promo",
            "tab_id": "推荐tab",
            "pos": 2,
            "default_selected": 1
        },
        {
            "id": 41,
            "name": "热门",
            "uri": "bilibili://pegasus/hottopic",
            "tab_id": "热门tab",
            "pos": 3
        },
        {
            "id": 42,
            "name": "追番",
            "uri": "bilibili://pgc/home",
            "tab_id": "追番Tab",
            "pos": 4
        },
        {
            "id": 151,
            "name": "影视",
            "uri": "bilibili://pgc/cinema-tab",
            "tab_id": "影视tab",
            "pos": 5
        }
    ]

    body['data']['top'] = [
        {
            "id": 176,
            "icon": "http://i0.hdslb.com/bfs/archive/d43047538e72c9ed8fd8e4e34415fbe3a4f632cb.png",
            "name": "消息",
            "uri": "bilibili://link/im_home",
            "tab_id": "消息Top",
            "pos": 2
        }
    ]

    body['data']['bottom'] = [
        {
            "id": 177,
            "icon": "http://i0.hdslb.com/bfs/archive/63d7ee88d471786c1af45af86e8cb7f607edf91b.png",
            "icon_selected": "http://i0.hdslb.com/bfs/archive/e5106aa688dc729e7f0eafcbb80317feb54a43bd.png",
            "name": "首页",
            "uri": "bilibili://main/home/",
            "tab_id": "首页Bottom",
            "pos": 1
        },
        {
            "id": 179,
            "icon": "http://i0.hdslb.com/bfs/archive/86dfbe5fa32f11a8588b9ae0fccb77d3c27cedf6.png",
            "icon_selected": "http://i0.hdslb.com/bfs/archive/25b658e1f6b6da57eecba328556101dbdcb4b53f.png",
            "name": "动态",
            "uri": "bilibili://following/home/",
            "tab_id": "动态Bottom",
            "pos": 2
        },
        {
            "id": 181,
            "icon": "http://i0.hdslb.com/bfs/archive/4b0b2c49ffeb4f0c2e6a4cceebeef0aab1c53fe1.png",
            "icon_selected": "http://i0.hdslb.com/bfs/archive/a54a8009116cb896e64ef14dcf50e5cade401e00.png",
            "name": "我的",
            "uri": "bilibili://user_center/",
            "tab_id": "我的Bottom",
            "pos": 3
        }
    ]
}

body = JSON.stringify(body)
$done({ body })
