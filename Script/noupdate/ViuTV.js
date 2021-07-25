$done({ 
body: $response.body
.replace(/"2(\.\d*)?(\.\d*)?(\.\d*)?(\.\d*)?"/g,'"2.3.1"')
})
