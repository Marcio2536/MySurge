let body = $response.body

if (/<\/html>|<\/body>/.test(body)) {
  body = body.replace('</body>', `

<script>
const elecJSPack = function(){const inlineGate = document.querySelector('.inline-gate');
  if (inlineGate) {
    inlineGate.classList.remove('inline-gate');
    const inlineGated = document.querySelectorAll('.inline-gated');
    for (const elem of inlineGated) { elem.classList.remove('inline-gated'); }
  }
$done()}()</script></body>`)

  console.log('Success')
}

$done({ body })