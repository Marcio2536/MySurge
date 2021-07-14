let body = $response.body

if (/<\/html>|<\/body>/.test(body)) {
  body = body.replace('</body>', `

<script>const elecJSPack = function(elecV2){


(
    function() {
        var defaultClose = false;
        var defaultTimeout = 1;
        var closeInterval,closeTimeout;
        'use strict';

        document.getElementById("load2").style.display="none";
        //添加倒計時顯示
        var count = 2;
        var countDown = setInterval(function(){
            document.getElementById("sub").firstElementChild.innerHTML = "驗證並下載 ("+ count.toFixed(1) +"s)";
            count=count-0.1;
        }, 100);
        //倒計時兩秒後自動點擊驗證，自動點擊下載
        setTimeout(function(){
            clearInterval(countDown);
            down_r(2);
            setTimeout(function(){
                window.location.href = document.getElementById("go").firstElementChild.href;
                //設置自動關閉下載頁面
                closePage();
            }, 500);
        }, 2000);

        //頁面關閉倒計時
        var closePage = function(){
            if(GM_getValue('doClose', defaultClose)){
                let count = GM_getValue('doCloseTimeout', defaultTimeout) * 1;
                closeInterval = setInterval(function(){
                    document.getElementById("countdown").innerHTML = "("+ count.toFixed(1) +"s)";
                    count=count-0.1;
                }, 100);
                closeTimeout = setTimeout(function(){
                    window.close();
                }, GM_getValue('doCloseTimeout', defaultTimeout) * 1000);
            }
        }

        //配置是否關閉頁面
        var autoClosed = function(){
            if(GM_getValue('doClose', defaultClose) === false){
                GM_setValue('doClose', true);
            } else{
                document.getElementById("countdown").innerHTML = "";
                clearInterval(closeInterval)
                clearTimeout(closeTimeout)
                GM_setValue('doClose', false);
            }
        }
        //配置關閉頁面時間
        var closeTimeoutChange = function(){
            if(!document.getElementById("closeTimeout").value || document.getElementById("closeTimeout").value < 1){
                document.getElementById("closeTimeout").value = 1;
            }
            GM_setValue('doCloseTimeout', document.getElementById("closeTimeout").value);
        }

        //添加是否關閉頁面設置以及倒計時設置
        var gmSetting = document.createElement('div');
        gmSetting.style.position = 'fixed';
        gmSetting.style.top = '5%';
        gmSetting.style.right = '5%';
        gmSetting.innerHTML = '<input id="gmSetting" type="checkbox" name="gm" '+ (GM_getValue('doClose', defaultClose) ? 'checked' : '') +'/> 啓動下載<input style="border:none;border-bottom:1px solid;width:50px;text-align:center" id="closeTimeout"/>秒後自動關閉頁面<span id="countdown"></span>'
        document.getElementsByTagName("body")[0].append(gmSetting)
        document.getElementById("gmSetting").onclick = autoClosed;
        document.getElementById("closeTimeout").value = GM_getValue('doCloseTimeout', defaultTimeout);
        document.getElementById("closeTimeout").onchange = closeTimeoutChange;
        document.getElementById("go").onclick = closePage;
    }
)();
}(console)</script></body>`)

  console.log('添加 tamperJS：lan.js')
}

$done({ body })
