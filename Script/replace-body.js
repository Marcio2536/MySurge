/*
[Script]   
test = type=http-response,pattern=https://example.com,requires-body=1,max-size=0,script-path= https://raw.githubusercontent.com/Marcio2536/MySurge/main/Script/replace-body.js,argument=false=true&no=yes
*/

function getRegexp(re_str) {
	let regParts = re_str.match(/^\/(.*?)\/([gims]*)$/);
	if (regParts) {
		return new RegExp(regParts[1], regParts[2]);
	} else {
		return new RegExp(re_str);
	}
}

if (typeof $argument == "undefined") {
	$done({});
} else {
	let body;
	if ($script.type === "http-response") {
		body = $response.body;
	} else if ($script.type === "http-request") {
		body = $request.body;
	} else {
		$done({});
	}

	$argument.split("&").forEach((item) => {
		let [match, replace] = item.split("=");
		let re = getRegexp(match);
		body = body.replace(re, replace);
	});

	$done({ body });
}
