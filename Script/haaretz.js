let body = $response.body

if (/<\/html>|<\/body>/.test(body)) {
  body = body.replace('</body>', `

<script>
const elecJSPack = function(){const notifications = document.querySelector('#pwSubscribePopup');
    const paywall = document.querySelector('[data-test="bottomStrip"]');
    const banner = document.querySelector('#haaretz\\\\.co\\\\.il\\\\.billboard\\\\.desktop');
    const editorsBanner = document.querySelector('#haaretz\\\\.co\\\\.il\\\\.editors\\\\.banner');
    const headlinesBanner = document.querySelector('#haaretz\\\\.co\\\\.il\\\\.headline\\\\.box\\\\.desktop');
    const topStrip = document.querySelector('[data-test="topStrip"]');
    const otherBanners = Array.from(document.querySelectorAll('[data-audtarget]'));
    removeDOMElement(paywall, notifications, banner, editorsBanner, topStrip, headlinesBanner, topStrip, otherBanners);
$done()}()</script></body>`)

  console.log('Success')
}

$done({ body })