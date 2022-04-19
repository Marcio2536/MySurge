/*
Paramount+ = type=http-response,pattern=https://www.intl.paramountplus.com/apps-api/v2.0/ipad/videos/section/\d+\.json,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/Marcio2536/MySurge/main/Script/paramountplus.js,script-update-interval=0
 */
let body = $response.body;
body = body.replace(/"code":"AU","downloadable":true/g, '"code":"CA","downloadable":true},{"code":"AU","downloadable":true');
console.log(body)
$done({body});