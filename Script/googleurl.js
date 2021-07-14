let body = $response.body

if (/<\/html>|<\/body>/.test(body)) {
  body = body.replace('</body>', `<script src='https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js'></script>

<script>const elecJSPack = function(elecV2){

if (window.location.href.indexOf("encrypted.google.com") > -1) {
    window.location.href = window.location.href.replace('encrypted','www');
}

var counter = 0;

function links() {
    console.log("Google Direct Links:  Removing redirects on " + document.getElementsByTagName("a").length + " URLs");
    var links = document.getElementsByTagName("a");
    for ( var i = 0; i < links.length; i++ ) {
        var link = links[i];
        if (link.hasAttribute("data-saferedirecturl")) {
            link.removeAttribute("data-saferedirecturl");
        }
        if (link.hasAttribute("onmousedown")) {
            link.removeAttribute("onmousedown");
            if (link.removeEventListener) {
                link.removeEventListener("mousedown", link.onmousedown, false);
            } else if(link.detachEvent) {
                link.detachEvent("onmousedown", link.onmousedown);
            }
        }
        if (link.href.indexOf("&sa=") > -1) {
            link.setAttribute("href", decodeURIComponent(decodeURIComponent(decodeURIComponent(link.href)).split("&sa=")[0]));
        }
        if (link.href.indexOf("aclk?sa=") > -1) {
            link.setAttribute("href", "http" + decodeURIComponent(decodeURIComponent(decodeURIComponent(link.href)).split("http").slice(-1)[0].split("&ctype=")[0]));
            link.setAttribute("target", "_blank");
        }
        if (link.href.indexOf("s_dest_url=") > -1) {
            link.setAttribute("href", "http" + decodeURIComponent(decodeURIComponent(decodeURIComponent(link.href)).split("http").slice(-1)[0]));
            link.setAttribute("target", "_blank");
        }
        if (link.href.indexOf("url=q?") > -1) {
            link.setAttribute("href", "http" + decodeURIComponent(decodeURIComponent(decodeURIComponent(link.href)).split("http").slice(-1)[0].split("&sa=")[0]));
            link.setAttribute("target", "_blank");
        }
    }
}

function images() {
    $('span:contains("Images may be")').remove();
    $('html').contents().find('a[href][data-ved]').children('img[onload][src]').each(function(){
        var url = $(this).attr('src');
        $(this).parent('a[href][data-ved]').attr('href',url).removeAttr('ping').removeAttr('data-ved');
        if ( url.indexOf("base64") < 0 ) {
            console.log("Google Direct Links:  Removing redirects on Image - " + url);
        }
    });
}

$('*').on('click', function (e) {
    if ( counter === 0 ) {
        setTimeout (function() { links(); counter = 0; }, 1000);
    }
    counter++;
});

$('input').keydown( function(e) {
    var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
    if(key == 13) {
        setTimeout (function() { links(); counter = 0; }, 1000);
    }
});

if (window.location.href.indexOf("tbm=isch") > -1) {
    images();
    $('*').on('mousemove', function (e) {
        if ( counter === 0 ) {
            setTimeout (function() { images(); counter = 0; }, 1000);
        }
        counter++;
    });
}

links();
setTimeout (function() { links(); }, 2000);
}(console)</script></body>`)

  console.log('Add googleurl.js')
}

$done({ body })
