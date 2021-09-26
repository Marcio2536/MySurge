const BASE_URL = 'https://www.netflix.com/title/'

const AREA_TEST_FILM_ID = 80018499
const ORIGINAL_FILM_ID = 80197526
const NOT_ORIGINAL_FILM_ID = 70143836

;(async () => {
  await test(NOT_ORIGINAL_FILM_ID)
    .then((code) => {
      if (code != 'Not Available') {
        $done({
          title: ‘Netflix 解鎖檢測’,
          style: ‘good’,
          content: ‘您的出口 IP 完整解鎖 Netflix’,
        })
        return new Promise(() => {})
      }
      return test(ORIGINAL_FILM_ID)
    })
    .then((code) => {
      if (code != ‘Not Available’) {
        $done({
          title: ‘Netflix 解鎖檢測’,
          style: ‘info’,
          content: ‘您的出口 IP 僅支持解鎖自制劇’,
        })
        return new Promise(() => {})
      }
      return test(AREA_TEST_FILM_ID)
    })
    .then((code) => {
      if (code != ‘Not Available’) {
        $done({
          title: ‘Netflix 解鎖檢測’,
          style: ‘alert’,
          content: ‘您的出口 IP 不支持解鎖強版權的自制劇’,
        })
      } else {
        $done({
          title: ‘Netflix 解鎖檢測’,
          style: ‘error’,
          content: ‘Netflix 不為您的出口 IP 提供服務’,
        })
      }
    })
    .catch((error) => {
      $done({
        title: ‘Netflix 解鎖檢測’,
        style: ‘error’,
        content: ‘檢測失敗，請重試’,
      })
    })
})()

function test(filmId) {
  return new Promise((resolve, reject) => {
    let option = {
      url: BASE_URL + filmId,
      headers: {
        ‘User-Agent’:
          ‘Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36’,
      },
    }
    $httpClient.get(option, function (error, response, data) {
      if (error != null) {
        reject(‘Error’)
        return
      }

      if (response.status !== 200) {
        resolve(‘Not Available’)
        return
      }

      let url = response.headers[‘x-originating-url’]
      let local = url.split(‘/‘)[3]
      if (local == ‘title’) {
        local = ‘us’
      } else {
        local = local.split('-')[0]
      }
      resolve(local)
    })
  })
}
