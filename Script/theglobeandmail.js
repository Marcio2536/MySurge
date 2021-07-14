let body = $response.body

if (/<\/html>|<\/body>/.test(body)) {
  body = body.replace('</body>', `

<script>
const elecJSPack = function(){let article_body_subscribed = document.querySelector('.c-article-body--subscribed');
  if (article_body_subscribed) {
    article_body_subscribed.removeAttribute('class');
    csDone = true;
  }
  function tgam_main() {
    document.addEventListener('bpc_event', function (e) {
      if (window.tgam)
        window.tgam.keytar.subscriberPaywallEnabled = false;
    })
  }
  insert_script(tgam_main);
  document.dispatchEvent(new CustomEvent('bpc_event', {}));
$done()}()</script></body>`)

  console.log('Success')
}

$done({ body })
