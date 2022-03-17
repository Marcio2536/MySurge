// LIHKG = type=http-response,pattern=https://lihkg.com/api_v2/thread,requires-body=1,max-size=-1,script-path=https://raw.githubusercontent.com/Marcio2536/MySurge/main/Script/LIHKG.js,script-update-interval=0
let body = $response.body;
body = body.replace(/"display_vote":false/g,'"display_vote":true');
$done({body});
