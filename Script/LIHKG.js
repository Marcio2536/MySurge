let body = $response.body;
body = body.replace(/"display_vote":false/g,'"display_vote":true');
$done({body});