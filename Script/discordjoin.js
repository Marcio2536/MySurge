/* Bypass Discord Restriction on Joining NSFW Groups
Discord Join = type=http-response,pattern=https://discord.com/api/v9/invites,requires-body=1,max-size=-1,control-api=1,script-path=https://raw.githubusercontent.com/Marcio2536/MySurge/main/Script/discordjoin.js,script-update-interval=0 */
let body = $response.body;
body = body.replace(/"nsfw": true/,'"nsfw": false');
body = body.replace(/"nsfw_level": \d/,'"nsfw_level": 0');
$done({body});
