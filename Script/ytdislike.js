let body = $response.body

if (/<\/html>|<\/body>/.test(body)) {
  body = body.replace('</body>', `
<script>
function GM_openInTab(e){return window.open(e)}function GM_addStyle(e){"use strict";let t=document.getElementsByTagName("head")[0];if(t){let s=document.createElement("style");return s.setAttribute("type","text/css"),s.textContent=e,t.appendChild(s),s}return null}const GM_log=console.log;function GM_xmlhttpRequest(e){"use strict";let t=new XMLHttpRequest;if(__setupRequestEvent(e,t,"abort"),__setupRequestEvent(e,t,"error"),__setupRequestEvent(e,t,"load"),__setupRequestEvent(e,t,"progress"),__setupRequestEvent(e,t,"readystatechange"),t.open(e.method,e.url,!e.synchronous,e.user||"",e.password||""),e.overrideMimeType&&t.overrideMimeType(e.overrideMimeType),e.headers)for(let s in e.headers)Object.prototype.hasOwnProperty.call(e.headers,s)&&t.setRequestHeader(s,e.headers[s]);let s=e.data?e.data:null;return e.binary?t.sendAsBinary(s):t.send(s)}function __setupRequestEvent(e,t,s){"use strict";e["on"+s]&&t.addEventListener(s,function(n){let r={responseText:t.responseText,responseXML:t.responseXML,readyState:t.readyState,responseHeaders:null,status:null,statusText:null,finalUrl:null};switch(s){case"progress":r.lengthComputable=n.lengthComputable,r.loaded=n.loaded,r.total=n.total;break;case"error":break;default:if(4!=t.readyState)break;r.responseHeaders=t.getAllResponseHeaders(),r.status=t.status,r.statusText=t.statusText}e["on"+s](r)})}const GM_info={script:{name:"elecV2",namespace:"https://t.me/elecV2"},uuid:"47c23801-2b5c-4dbc-88a0-636297fd6b86"},__GM_STORAGE_PREFIX=["",GM_info.script.namespace,GM_info.script.name,""].join("***");function GM_deleteValue(e){"use strict";localStorage.removeItem(__GM_STORAGE_PREFIX+e)}function GM_getValue(e,t){"use strict";let s=localStorage.getItem(__GM_STORAGE_PREFIX+e);return null===s&&void 0!==t?t:s}function GM_listValues(){"use strict";let e=__GM_STORAGE_PREFIX.length,t=[];for(let s=0;s<localStorage.length;s++){let n=localStorage.key(s);n.substr(0,e)===__GM_STORAGE_PREFIX&&t.push(n.substr(e))}return t}function GM_setValue(e,t){"use strict";localStorage.setItem(__GM_STORAGE_PREFIX+e,t)}function GM_getResourceURL(e){"use strict";return"greasemonkey-script:"+GM_info.uuid+"/"+e}
</script>
<script>const elecJSPack = function(elecV2){
// ==UserScript==
// @name         Return YouTube Dislike
// @namespace    https://www.returnyoutubedislike.com/
// @homepage     https://www.returnyoutubedislike.com/
// @version      0.6.1
// @encoding     utf-8
// @description  Return of the YouTube Dislike, Based off https://www.returnyoutubedislike.com/
// @icon         https://github.com/Anarios/return-youtube-dislike/raw/main/Icons/Return%20Youtube%20Dislike%20-%20Transparent.png
// @author       Anarios & JRWR
// @match        *://*.youtube.com/*
// @compatible   chrome
// @compatible   firefox
// @compatible   opera
// @compatible   safari
// @compatible   edge
// @downloadURL  https://github.com/Anarios/return-youtube-dislike/raw/main/Extensions/UserScript/Return%20Youtube%20Dislike.user.js
// @updateURL    https://github.com/Anarios/return-youtube-dislike/raw/main/Extensions/UserScript/Return%20Youtube%20Dislike.user.js
// @grant        GM.xmlHttpRequest
// @run-at       document-end
// ==/UserScript==
function cLog(text, subtext = '') {
  subtext = subtext.trim() === '' ? '' : \`(\${subtext})\`;
  console.log(\`[Return YouTube Dislikes] \${text} \${subtext}\`);
}

function getButtons() {
  if (document.getElementById("menu-container").offsetParent === null) {
    return document.querySelector("ytd-menu-renderer.ytd-watch-metadata > div");
  } else {
    return document
      .getElementById("menu-container")
      ?.querySelector("#top-level-buttons-computed");
  }
}

function getLikeButton() {
  return getButtons().children[0];
}

function getDislikeButton() {
  return getButtons().children[1];
}

function isVideoLiked() {
  return getLikeButton().classList.contains("style-default-active");
}

function isVideoDisliked() {
  return getDislikeButton().classList.contains("style-default-active");
}

function isVideoNotLiked() {
  return getLikeButton().classList.contains("style-text");
}

function isVideoNotDisliked() {
  return getDislikeButton().classList.contains("style-text");
}

function getState() {
  if (isVideoLiked()) {
    return "liked";
  }
  if (isVideoDisliked()) {
    return "disliked";
  }
  return "neutral";
}

function setLikes(likesCount) {
  getButtons().children[0].querySelector("#text").innerText = likesCount;
}

function setDislikes(dislikesCount) {
  getButtons().children[1].querySelector("#text").innerText = dislikesCount;
}

function createRateBar(likes, dislikes) {
  var rateBar = document.getElementById("return-youtube-dislike-bar-container");

  const widthPx =
    getButtons().children[0].clientWidth +
    getButtons().children[1].clientWidth +
    8;

  const widthPercent =
    likes + dislikes > 0 ? (likes / (likes + dislikes)) * 100 : 50;

  if (!rateBar) {
    document.getElementById("menu-container").insertAdjacentHTML(
      "beforeend",
      \`
        <div class="ryd-tooltip" style="width: \${widthPx}px">
        <div class="ryd-tooltip-bar-container">
           <div
              id="return-youtube-dislike-bar-container"
              style="width: 100%; height: 2px;"
              >
              <div
                 id="return-youtube-dislike-bar"
                 style="width: \${widthPercent}%; height: 100%"
                 ></div>
           </div>
        </div>
        <tp-yt-paper-tooltip position="top" id="ryd-dislike-tooltip" class="style-scope ytd-sentiment-bar-renderer" role="tooltip" tabindex="-1">
           <!--css-build:shady-->\${likes.toLocaleString()}&nbsp;/&nbsp;\${dislikes.toLocaleString()}
        </tp-yt-paper-tooltip>
        </div>
\`
    );
  } else {
    document.getElementById(
      "return-youtube-dislike-bar-container"
    ).style.width = widthPx + "px";
    document.getElementById("return-youtube-dislike-bar").style.width =
      widthPercent + "%";

    document.querySelector(
      "#ryd-dislike-tooltip > #tooltip"
    ).innerHTML = \`\${likes.toLocaleString()}&nbsp;/&nbsp;\${dislikes.toLocaleString()}\`;
  }
}

function setState() {
  cLog("Fetching votes...");
  let statsSet = false;

  fetch(\`https://www.youtube.com/watch?v=\${getVideoId()}\`).then((response) => {
    response.text().then((text) => {
      let result = getDislikesFromYoutubeResponse(text);
      if (result) {
        cLog("response from youtube:");
        cLog(JSON.stringify(result));
        if (result.likes && result.dislikes) {
          const formattedDislike = numberFormat(result.dislikes);
          setDislikes(formattedDislike);
          createRateBar(result.likes, result.dislikes);
          statsSet = true;
        }
      }
    });
  });

  fetch(
    \`https://returnyoutubedislikeapi.com/votes?videoId=\${getVideoId()}\`
  ).then((response) => {
    response.json().then((json) => {
      if (json && !statsSet) {
        const { dislikes, likes } = json;
        cLog(\`Received count: \${dislikes}\`);
        setDislikes(numberFormat(dislikes));
        createRateBar(likes, dislikes);
      }
    });
  });
}

function likeClicked() {
  cLog("Like clicked", getState());
  setState();
}

function dislikeClicked() {
  cLog("Dislike clicked", getState());
  setState();
}

function setInitalState() {
  setState();
}

function getVideoId() {
  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get("v");

  return videoId;
}

function isVideoLoaded() {
  const videoId = getVideoId();

  return (
    document.querySelector(\`ytd-watch-flexy[video-id='\${videoId}']\`) !== null
  );
}

function roundDown(num) {
  if (num < 1000) return num;
  const int = Math.floor(Math.log10(num) - 2);
  const decimal = int + (int % 3 ? 1 : 0);
  const value = Math.floor(num / 10 ** decimal);
  return value * 10 ** decimal;
}

function numberFormat(numberState) {
  const userLocales = navigator.language;

  const formatter = Intl.NumberFormat(userLocales, {
    notation: "compact",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return formatter.format(roundDown(numberState)).replace(/\\.0|,0/, "");
}

function getDislikesFromYoutubeResponse(htmlResponse) {
  let start =
    htmlResponse.indexOf('"videoDetails":') + '"videoDetails":'.length;
  let end =
    htmlResponse.indexOf('"isLiveContent":false}', start) +
    '"isLiveContent":false}'.length;
  if (end < start) {
    end =
      htmlResponse.indexOf('"isLiveContent":true}', start) +
      '"isLiveContent":true}'.length;
  }
  let jsonStr = htmlResponse.substring(start, end);
  let jsonResult = JSON.parse(jsonStr);
  let rating = jsonResult.averageRating;

  start = htmlResponse.indexOf('"topLevelButtons":[', end);
  start =
    htmlResponse.indexOf('"accessibilityData":', start) +
    '"accessibilityData":'.length;
  end = htmlResponse.indexOf("}", start);
  let likes = +htmlResponse.substring(start, end).replace(/\\D/g, "");
  let dislikes = (likes * (5 - rating)) / (rating - 1);
  let result = {
    likes,
    dislikes: Math.round(dislikes),
    rating,
    viewCount: +jsonResult.viewCount,
  };
  return result;
}

function setEventListeners(evt) {
  function checkForJS_Finish() {
    if (getButtons()?.offsetParent && isVideoLoaded()) {
      clearInterval(jsInitChecktimer);
      const buttons = getButtons();

      if (!window.returnDislikeButtonlistenersSet) {
        cLog("Registering button listeners...");
        buttons.children[0].addEventListener("click", likeClicked);
        buttons.children[1].addEventListener("click", dislikeClicked);
        window.returnDislikeButtonlistenersSet = true;
      }
      setInitalState();
    }
  }

  if (window.location.href.indexOf("watch?") >= 0) {
    cLog("Setting up...");
    var jsInitChecktimer = setInterval(checkForJS_Finish, 111);
  }
}

(function () {
  "use strict";
  window.addEventListener("yt-navigate-finish", setEventListeners, true);
  setEventListeners();
})();

}(console)</script></body>`)

  console.log('Success')
}

$done({ body })