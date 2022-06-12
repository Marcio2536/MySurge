/* Blcok Crunchyroll Ads on iOS & iPadOS
Crunchyroll Adblock = type=http-response,pattern=https://beta-api.crunchyroll.com/cms,requires-body=1,max-size=-1,control-api=1,script-path=https://raw.githubusercontent.com/Marcio2536/MySurge/main/Script/crunchyroll.js,script-update-interval=0 */
let body = $response.body;
body = body.replace(/"offset_ms":\d+/g, '"offset_ms":99999999999999');
console.log(body)
$done({body});
