let body = $response.body

if (/<\/html>|<\/body>/.test(body)) {
  body = body.replace('</body>', `

<script>
const elecJSPack = function(){let datawall_content = document.querySelector('.datawall-content');
  if (datawall_content)
    datawall_content.classList.remove('datawall-content');
  let div_hidden = document.querySelectorAll('[data="datawall-content"]');
  for (let elem of div_hidden)
    elem.removeAttribute('style');
  let hidden_images = document.querySelectorAll('img.lazy-img:not([src])[data-srcset]');
  for (let hidden_image of hidden_images) {
    hidden_image.classList.remove('lazy-img');
    hidden_image.setAttribute('src', hidden_image.getAttribute('data-srcset').split(',')[1].split(' ')[0]);
  }
$done()}()</script></body>`)

  console.log('Success')
}

$done({ body })