let body = $response.body;
body = body.replace(/"nsfw": true/,'"nsfw": false');
body = body.replace(/"nsfw_level": \d/,'"nsfw_level": 0');
console.log(body)
$done({body});