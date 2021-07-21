const url = decodeURI($request.url);
try {
  const name = url.match(/\/([^\/]*.user.js)/)[1];
  const script = processScript($response.body, name);
  notify(
    "🎩 [油猴腳本]",
    "🎉 轉換成功",
    `🛎 腳本：${name} 成功轉換。\n請複製或者保存此腳本到iCloud或者APP腳本文件夾中，並根據腳本內提示設置重寫。`
  );
  $done({ body: script });
} catch (err) {
  notify("[油猴腳本]", "❌ 轉換失敗", `${err.message}`);
  $done({});
}

function processScript(script, name) {
  script = script.replace(/`|\$|%{/g, function (match) {
    return "\\" + match;
  });
  // get host name
  const patterns = script.match(/(@match|@include)\s+([\S]*)/g).map((h) => {
    p = h.match(/:\/\/(.*)/)[1];
    return p.replace(/\./g, "\\.").replace(/\*/g, ".*");
  });
  const hostString = patterns.reduce(
    (acc, cur) => acc + cur + ", ",
    "[MITM]\nhostname="
  );
  // insert mitm
  const mitm = `
🔘 Quantumult X
[rewrite_local]
${patterns.reduce(
  (acc, cur) => acc + cur + " url script-response-body " + name + "\n",
  ""
)}

🔘 Loon
[Script]
${patterns.reduce(
  (acc, cur) =>
    acc +
    "http-response " +
    cur +
    " script-path=" +
    name +
    ", requires-body=true" +
    ", tag=" +
    name +
    "\n",
  ""
)}

🔘 Surge
[Script]
${patterns.reduce(
  (acc, cur) =>
    acc +
    name +
    "=" +
    "type=http-response, " +
    "pattern=" +
    cur +
    ", script-path=" +
    name +
    ", requires-body=true" +
    ", max-size=1310720" +
    "\n",
  ""
)}
`;
  //prettier-ignore
  // GM modules from https://github.com/pbodnar/gm-scripts/blob/master/JIRA_shortcuts.user.js
  const GM = `function GM_deleteValue(e){return new Promise((t,n)=>{chrome.runtime.sendMessage({key:e,name:"ApiDeleteValue",uuid:_uuid},e=>e?t():n())})}function GM_getValue(e,t){return new Promise(n=>{chrome.runtime.sendMessage({key:e,name:"ApiGetValue",uuid:_uuid},e=>{n(void 0!==e?e:t)})})}function GM_listValues(){return new Promise(e=>{chrome.runtime.sendMessage({name:"ApiListValues",uuid:_uuid},t=>e(t))})}function GM_setValue(e,t){return new Promise((n,r)=>{chrome.runtime.sendMessage({key:e,name:"ApiSetValue",uuid:_uuid,value:t},e=>{void 0!==e?n(e):(console.warn("set value failed:",chrome.runtime.lastError),r())})})}function GM_getResourceUrl(e){return new Promise((t,n)=>{chrome.runtime.sendMessage({name:"ApiGetResourceBlob",resourceName:e,uuid:_uuid},r=>{r?t(URL.createObjectURL(r.blob)):n("No resource named "+e)})})}function GM_notification(e,t,n,r){let o;if("object"==typeof e?(o=e,"function"==typeof t&&(o.ondone=t)):o={title:t,text:e,image:n,onclick:r},"string"!=typeof o.text)throw new Error(_("gm_notif_text_must_be_string"));"string"!=typeof o.title&&(o.title=_("extName")),"string"!=typeof o.image&&(o.image="skin/icon.svg");let i=chrome.runtime.connect({name:"UserScriptNotification"});i.onMessage.addListener(e=>{const t=e.type;"function"==typeof o[t]&&o[t]()}),i.postMessage({details:{title:o.title,text:o.text,image:o.image},name:"create",uuid:_uuid})}function GM_openInTab(e,t){let n;try{n=new URL(e,location.href)}catch(t){throw new Error(_("gm_opentab_bad_URL",e))}chrome.runtime.sendMessage({active:!1===t,name:"ApiOpenInTab",url:n.href,uuid:_uuid})}function GM_setClipboard(e){document.addEventListener("copy",function t(n){document.removeEventListener("copy",t,!0),n.stopImmediatePropagation(),n.preventDefault(),n.clipboardData.setData("text/plain",e)},!0),document.execCommand("copy")}function GM_xmlHttpRequest(e){if(!e)throw new Error(_("xhr_no_details"));if(!e.url)throw new Error(_("xhr_no_url"));let t;try{t=new URL(e.url,location.href)}catch(t){throw new Error(_("xhr_bad_url",e.url,t))}if("http:"!=t.protocol&&"https:"!=t.protocol&&"ftp:"!=t.protocol)throw new Error(_("xhr_bad_url_scheme",e.url));let n=chrome.runtime.connect({name:"UserScriptXhr"});n.onMessage.addListener(function(t){if(t.responseState.responseXML)try{t.responseState.responseXML=(new DOMParser).parseFromString(t.responseState.responseText,"application/xml")}catch(e){console.warn("GM_xhr could not parse XML:",e),t.responseState.responseXML=null}let n=("up"==t.src?e.upload:e)["on"+t.type];n&&n(t.responseState)});let r={};Object.keys(e).forEach(t=>{let n=e[t];r[t]=n,"function"==typeof n&&(r[t]=!0)}),r.upload={},e.upload&&Object.keys(e=>r.upload[e]=!0),r.url=t.href,n.postMessage({details:r,name:"open",uuid:_uuid})}\n`

  let scriptString = `<script>\n const result=function(){\n${
    GM + script
  }}()\n</script>`;

  // some external scripts
  const externalScripts = [...script.matchAll(/@require\s+([\S]*)/g)].map(
    (m) => m[1]
  );
  if (externalScripts.length > 0) {
    scriptString =
      externalScripts.reduce(
        (acc, cur) => acc + `<script src=${cur}></script>\n`,
        ""
      ) +
      "\n" +
      scriptString;
  }

  // get description
  const description = script.match(/@description\s+(.*)/)[1];

  // produce mitm script
  const out = `
\`
\`
try {
    let body = $response.body;
    if (/<\\/html>|<\\/body>/.test(body)) {
        body = body.replace('</body>', \`${scriptString}</body>\`);
        console.log("[油猴腳本] ${name} 注入成功!");
    }
    $done({body});
} catch (err) {
    console.log("[油猴腳本] ${name} 執行失敗!\\n" + err);
    $done({});
}
`;
  return out;
}

function notify(title, sub, content) {
  if (typeof $notification !== "undefined") {
    $notification.post(title, sub, content);
  } else {
    $notify(title, sub, content);
  }
}
