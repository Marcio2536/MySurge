let body = $response.body

if (/<\/html>|<\/body>/.test(body)) {
  body = body.replace('</body>', `

<script>
const elecJSPack = function(){let modal = document.querySelectorAll('div#NewsletterModal, div.modal-backdrop');
removeDOMElement(...modal);
$done()}()</script></body>`)

  console.log('Success')
}

$done({ body })