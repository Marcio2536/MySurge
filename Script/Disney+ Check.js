/**
 * @author Helge_0x00
 *
 * [Panel]
 * disney_check = script-name=disney_check,title=Disney+ 解鎖檢測,style=alert,content=請刷新面板,update-interval=1800
 *
 * [Script]
 * disney_check = type=generic,script-path=https://gist.githubusercontent.com/Hyseen/729fc4c3ac28c3f2e7c4a832d81780f3/raw/disney_check.js
 *
 * 支持使用腳本使用 argument 參數自定義配置，如：argument=key1=URLEncode(value1)&key2=URLEncode(value2)，具體參數如下所示，
 * title: 面板標題
 * availableContent: 解鎖時展示的的文本內容，支持以下四個個區域佔位符 #REGION_FLAG#、#REGION_CODE#、#REGION_NAME#、#REGION_NAME_EN#，用來展示地區國旗 emoji 、地區編碼、地區中文名稱、地區英文名稱
 * availableIcon: 解鎖時展示的圖標，內容為任意有效的 SF Symbol Name
 * availableIconColor:  解鎖時展示的圖標顏色，內容為顏色的 HEX 編碼
 * availableStyle: 解鎖時展示的圖標樣式，參數可選值有 good, info, alert, error
 * comingContent: 計劃上線展示的的文本內容，支持以下四個個區域佔位符 #REGION_FLAG#、#REGION_CODE#、#REGION_NAME#、#REGION_NAME_EN#，用來展示地區國旗 emoji 、地區編碼、地區中文名稱、地區英文名稱
 * comingIcon: 計劃上線展示的圖標，內容為任意有效的 SF Symbol Name
 * comingIconColor:  計劃上線展示的圖標顏色，內容為顏色的 HEX 編碼
 * comingStyle: 計劃上線展示的圖標樣式，參數可選值有 good, info, alert, error
 * notAvailableContent: 不支持解鎖時展示的文本內容
 * notAvailableIcon: 不支持解鎖時展示的圖標
 * notAvailableIconColor: 不支持解鎖時展示的圖標顏色
 * notAvailableStyle: 不支持解鎖時展示的圖標樣式
 * errorContent: 檢測異常時展示的文本內容
 * errorIcon: 檢測異常時展示的圖標
 * errorIconColor: 檢測異常時展示的圖標顏色
 * errorStyle: 檢測異常時展示的圖標樣式
 * timeout: 超時時間，毫秒，默認為 3000
 */

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.71 Safari/537.36'

// 即將登陸
const STATUS_COMING = 2
// 支持解鎖
const STATUS_AVAILABLE = 1
// 不支持解鎖
const STATUS_NOT_AVAILABLE = 0
// 檢測超時
const STATUS_TIMEOUT = -1
// 檢測異常
const STATUS_ERROR = -2

const DEFAULT_OPTIONS = {
  title: 'Disney+ Check',
  availableContent: 'Available ➟ #REGION_FLAG# #REGION_NAME_EN#',
  availableIcon: undefined,
  availableIconColor: undefined,
  availableStyle: 'good',
  comingContent: 'Coming Soon ➟ #REGION_FLAG# #REGION_NAME_EN#',
  comingIcon: undefined,
  comingIconColor: undefined,
  comingStyle: 'info',
  notAvailableContent: 'Disney+ is not available in your location.',
  notAvailableIcon: undefined,
  notAvailableIconColor: undefined,
  notAvailableStyle: 'alert',
  errorContent: 'Check fails. Please try again later.',
  errorIcon: undefined,
  errorIconColor: undefined,
  errorStyle: 'error',
  timeout: 3000,
}

let options = getOptions()
let panel = {
  title: options.title,
}

;(async () => {
  let { region, status } = await testDisneyPlus()
  console.log(`testDisneyPlus: region=${region}, status=${status}`)

  switch (status) {
    case STATUS_AVAILABLE:
      if (options.availableIcon) {
        panel['icon'] = options.availableIcon
        panel['icon-color'] = options.availableIconColor ?? undefined
      } else {
        panel['style'] = options.availableStyle
      }
      panel['content'] = replaceRegionPlaceholder(options.availableContent, region)
      return
    case STATUS_COMING:
      if (options.comingIcon) {
        panel['icon'] = options.comingIcon
        panel['icon-color'] = options.comingIconColor ?? undefined
      } else {
        panel['style'] = options.comingStyle
      }

      panel['content'] = replaceRegionPlaceholder(options.comingContent, region)
      return
    case STATUS_NOT_AVAILABLE:
      if (options.notAvailableIcon) {
        panel['icon'] = options.notAvailableIcon
        panel['icon-color'] = options.notAvailableIconColor ?? undefined
      } else {
        panel['style'] = options.notAvailableStyle
      }
      panel['content'] = options.notAvailableContent
      return
    default:
      if (options.errorIcon) {
        panel['icon'] = options.errorIcon
        panel['icon-color'] = options.errorIconColor ? options.errorIconColor : undefined
      } else {
        panel['style'] = options.errorStyle
      }
      panel['content'] = options.errorContent
  }
})().finally(() => {
  $done(panel)
})

async function testDisneyPlus() {
  try {
    let { region, cnbl } = await Promise.race([testHomePage(), timeout(options.timeout)])
    console.log(`homepage: region=${region}, cnbl=${cnbl}`)

    let { countryCode, inSupportedLocation, accessToken } = await Promise.race([getLocationInfo(), timeout(options.timeout)])
    console.log(`getLocationInfo: countryCode=${countryCode}, inSupportedLocation=${inSupportedLocation}`)

    region = countryCode ?? region
    // 即將登陸
    if (inSupportedLocation === false || inSupportedLocation === 'false') {
      return { region, status: STATUS_COMING }
    }

    let support = await Promise.race([testPublicGraphqlAPI(accessToken), timeout(options.timeout)])
    if (!support) {
      return { status: STATUS_NOT_AVAILABLE }
    }
    // 支持解鎖
    return { region, status: STATUS_AVAILABLE }
  } catch (error) {
    console.log(error)

    // 不支持解鎖
    if (error === 'Not Available') {
      return { status: STATUS_NOT_AVAILABLE }
    }

    // 檢測超時
    if (error === 'Timeout') {
      return { status: STATUS_TIMEOUT }
    }

    return { status: STATUS_ERROR }
  }
}

function testPublicGraphqlAPI(accessToken) {
  return new Promise((resolve, reject) => {
    let opts = {
      url: 'https://disney.api.edge.bamgrid.com/v1/public/graphql',
      headers: {
        'Accept-Language': 'en',
        Authorization: accessToken,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.71 Safari/537.36',
      },
      body: JSON.stringify({
        query:
          'query($preferredLanguages: [String!]!, $version: String) {globalization(version: $version) { uiLanguage(preferredLanguages: $preferredLanguages) }}',
        variables: { version: '1.5.0', preferredLanguages: ['en'] },
      }),
    }

    $httpClient.post(opts, function (error, response, data) {
      if (error) {
        reject('Error')
        return
      }
      resolve(response.status === 200)
    })
  })
}

function getLocationInfo() {
  return new Promise((resolve, reject) => {
    let opts = {
      url: 'https://disney.api.edge.bamgrid.com/graph/v1/device/graphql',
      headers: {
        'Accept-Language': 'en',
        Authorization: 'ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84',
        'Content-Type': 'application/json',
        'User-Agent': UA,
      },
      body: JSON.stringify({
        query: 'mutation registerDevice($input: RegisterDeviceInput!) { registerDevice(registerDevice: $input) { grant { grantType assertion } } }',
        variables: {
          input: {
            applicationRuntime: 'chrome',
            attributes: {
              browserName: 'chrome',
              browserVersion: '94.0.4606',
              manufacturer: 'apple',
              model: null,
              operatingSystem: 'macintosh',
              operatingSystemVersion: '10.15.7',
              osDeviceIds: [],
            },
            deviceFamily: 'browser',
            deviceLanguage: 'en',
            deviceProfile: 'macosx',
          },
        },
      }),
    }

    $httpClient.post(opts, function (error, response, data) {
      if (error) {
        reject('Error')
        return
      }

      if (response.status !== 200) {
        console.log('getLocationInfo: ' + data)
        reject('Not Available')
        return
      }

      data = JSON.parse(data)
      if(data?.errors){
        console.log('getLocationInfo: ' + data)
        reject('Not Available')
        return
      }

      let {
        token: { accessToken },
        session: {
          inSupportedLocation,
          location: { countryCode },
        },
      } = data?.extensions?.sdk
      resolve({ inSupportedLocation, countryCode, accessToken })
    })
  })
}

function testHomePage() {
  return new Promise((resolve, reject) => {
    let opts = {
      url: 'https://www.disneyplus.com/',
      headers: {
        'Accept-Language': 'en',
        'User-Agent': UA,
      },
    }

    $httpClient.get(opts, function (error, response, data) {
      if (error) {
        reject('Error')
        return
      }
      if (response.status !== 200 || data.indexOf('Sorry, Disney+ is not available in your region.') !== -1) {
        reject('Not Available')
        return
      }

      let match = data.match(/Region: ([A-Za-z]{2})[\s\S]*?CNBL: ([12])/)
      if (!match) {
        resolve({ region: '', cnbl: '' })
        return
      }

      let region = match[1]
      let cnbl = match[2]
      resolve({ region, cnbl })
    })
  })
}

function timeout(delay = 5000) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject('Timeout')
    }, delay)
  })
}

function getOptions() {
  let options = Object.assign({}, DEFAULT_OPTIONS)
  if (typeof $argument != 'undefined') {
    try {
      let params = Object.fromEntries(
        $argument
          .split('&')
          .map(item => item.split('='))
          .map(([k, v]) => [k, decodeURIComponent(v)])
      )
      Object.assign(options, params)
    } catch (error) {
      console.error(`$argument parse error，$argument: + ${argument}`)
    }
  }

  return options
}

function replaceRegionPlaceholder(content, region) {
  let result = content

  if (result.indexOf('#REGION_CODE#') !== -1) {
    result = result.replaceAll('#REGION_CODE#', region.toUpperCase())
  }
  if (result.indexOf('#REGION_FLAG#') !== -1) {
    result = result.replaceAll('#REGION_FLAG#', getCountryFlagEmoji(region.toUpperCase()))
  }

  if (result.indexOf('#REGION_NAME#') !== -1) {
    result = result.replaceAll('#REGION_NAME#', RESION_NAMES?.[region.toUpperCase()]?.chinese ?? '')
  }

  if (result.indexOf('#REGION_NAME_EN#') !== -1) {
    result = result.replaceAll('#REGION_NAME_EN#', RESION_NAMES?.[region.toUpperCase()]?.english ?? '')
  }

  return result
}

function getCountryFlagEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt())
  return String.fromCodePoint(...codePoints)
}

// prettier-ignore
const RESION_NAMES={AF:{chinese:'阿富汗',english:'Afghanistan'},AL:{chinese:'阿爾巴尼亞',english:'Albania'},DZ:{chinese:'阿爾及利亞',english:'Algeria'},AO:{chinese:'安哥拉',english:'Angola'},AR:{chinese:'阿根廷',english:'Argentina'},AM:{chinese:'亞美尼亞',english:'Armenia'},AU:{chinese:'澳大利亞',english:'Australia'},AT:{chinese:'奧地利',english:'Austria'},AZ:{chinese:'阿塞拜疆',english:'Azerbaijan'},BH:{chinese:'巴林',english:'Bahrain'},BD:{chinese:'孟加拉國',english:'Bangladesh'},BY:{chinese:'白俄羅斯',english:'Belarus'},BE:{chinese:'比利時',english:'Belgium'},BZ:{chinese:'伯利茲',english:'Belize'},BJ:{chinese:'貝寧',english:'Benin'},BT:{chinese:'不丹',english:'Bhutan'},BO:{chinese:'玻利維亞',english:'Bolivia'},BA:{chinese:'波黑',english:'Bosnia and Herzegovina'},BW:{chinese:'博茨瓦納',english:'Botswana'},BR:{chinese:'巴西',english:'Brazil'},VG:{chinese:'英屬維京群島',english:'British Virgin Islands'},BN:{chinese:'文萊',english:'Brunei'},BG:{chinese:'保加利亞',english:'Bulgaria'},BF:{chinese:'布基納法索',english:'Burkina-faso'},BI:{chinese:'布隆迪',english:'Burundi'},KH:{chinese:'柬埔寨',english:'Cambodia'},CM:{chinese:'喀麥隆',english:'Cameroon'},CA:{chinese:'加拿大',english:'Canada'},CV:{chinese:'佛得角',english:'Cape Verde'},KY:{chinese:'開曼群島',english:'Cayman Islands'},CF:{chinese:'中非',english:'Central African Republic'},TD:{chinese:'乍得',english:'Chad'},CL:{chinese:'智利',english:'Chile'},CN:{chinese:'中國',english:'China'},CO:{chinese:'哥倫比亞',english:'Colombia'},KM:{chinese:'科摩羅',english:'Comoros'},CG:{chinese:'剛果(布)',english:'Congo - Brazzaville'},CD:{chinese:'剛果(金)',english:'Congo - Kinshasa'},CR:{chinese:'哥斯達黎加',english:'Costa Rica'},HR:{chinese:'克羅地亞',english:'Croatia'},CY:{chinese:'塞浦路斯',english:'Cyprus'},CZ:{chinese:'捷克',english:'Czech Republic'},DK:{chinese:'丹麥',english:'Denmark'},DJ:{chinese:'吉布提',english:'Djibouti'},DO:{chinese:'多米尼加',english:'Dominican Republic'},EC:{chinese:'厄瓜多爾',english:'Ecuador'},EG:{chinese:'埃及',english:'Egypt'},SV:{chinese:'薩爾瓦多',english:'EI Salvador'},GQ:{chinese:'赤道幾內亞',english:'Equatorial Guinea'},ER:{chinese:'厄立特里亞',english:'Eritrea'},EE:{chinese:'愛沙尼亞',english:'Estonia'},ET:{chinese:'埃塞俄比亞',english:'Ethiopia'},FJ:{chinese:'斐濟',english:'Fiji'},FI:{chinese:'芬蘭',english:'Finland'},FR:{chinese:'法國',english:'France'},GA:{chinese:'加蓬',english:'Gabon'},GM:{chinese:'岡比亞',english:'Gambia'},GE:{chinese:'格魯吉亞',english:'Georgia'},DE:{chinese:'德國',english:'Germany'},GH:{chinese:'加納',english:'Ghana'},GR:{chinese:'希臘',english:'Greece'},GL:{chinese:'格陵蘭',english:'Greenland'},GT:{chinese:'危地馬拉',english:'Guatemala'},GN:{chinese:'幾內亞',english:'Guinea'},GY:{chinese:'圭亞那',english:'Guyana'},HT:{chinese:'海地',english:'Haiti'},HN:{chinese:'洪都拉斯',english:'Honduras'},HK:{chinese:'香港',english:'Hong Kong'},HU:{chinese:'匈牙利',english:'Hungary'},IS:{chinese:'冰島',english:'Iceland'},IN:{chinese:'印度',english:'India'},ID:{chinese:'印度尼西亞',english:'Indonesia'},IR:{chinese:'伊朗',english:'Iran'},IQ:{chinese:'伊拉克',english:'Iraq'},IE:{chinese:'愛爾蘭',english:'Ireland'},IM:{chinese:'馬恩島',english:'Isle of Man'},IL:{chinese:'以色列',english:'Israel'},IT:{chinese:'意大利',english:'Italy'},CI:{chinese:'科特迪瓦',english:'Ivory Coast'},JM:{chinese:'牙買加',english:'Jamaica'},JP:{chinese:'日本',english:'Japan'},JO:{chinese:'約旦',english:'Jordan'},KZ:{chinese:'哈薩克斯坦',english:'Kazakstan'},KE:{chinese:'肯尼亞',english:'Kenya'},KR:{chinese:'韓國',english:'Korea'},KW:{chinese:'科威特',english:'Kuwait'},KG:{chinese:'吉爾吉斯斯坦',english:'Kyrgyzstan'},LA:{chinese:'老撾',english:'Laos'},LV:{chinese:'拉脫維亞',english:'Latvia'},LB:{chinese:'黎巴嫩',english:'Lebanon'},LS:{chinese:'萊索托',english:'Lesotho'},LR:{chinese:'利比里亞',english:'Liberia'},LY:{chinese:'利比亞',english:'Libya'},LT:{chinese:'立陶宛',english:'Lithuania'},LU:{chinese:'盧森堡',english:'Luxembourg'},MO:{chinese:'澳門',english:'Macao'},MK:{chinese:'馬其頓',english:'Macedonia'},MG:{chinese:'馬達加斯加',english:'Madagascar'},MW:{chinese:'馬拉維',english:'Malawi'},MY:{chinese:'馬來西亞',english:'Malaysia'},MV:{chinese:'馬爾代夫',english:'Maldives'},ML:{chinese:'馬里',english:'Mali'},MT:{chinese:'馬耳他',english:'Malta'},MR:{chinese:'毛利塔尼亞',english:'Mauritania'},MU:{chinese:'毛里求斯',english:'Mauritius'},MX:{chinese:'墨西哥',english:'Mexico'},MD:{chinese:'摩爾多瓦',english:'Moldova'},MC:{chinese:'摩納哥',english:'Monaco'},MN:{chinese:'蒙古',english:'Mongolia'},ME:{chinese:'黑山',english:'Montenegro'},MA:{chinese:'摩洛哥',english:'Morocco'},MZ:{chinese:'莫桑比克',english:'Mozambique'},MM:{chinese:'緬甸',english:'Myanmar'},NA:{chinese:'納米比亞',english:'Namibia'},NP:{chinese:'尼泊爾',english:'Nepal'},NL:{chinese:'荷蘭',english:'Netherlands'},NZ:{chinese:'新西蘭',english:'New Zealand'},NI:{chinese:'尼加拉瓜',english:'Nicaragua'},NE:{chinese:'尼日爾',english:'Niger'},NG:{chinese:'尼日利亞',english:'Nigeria'},KP:{chinese:'朝鮮',english:'North Korea'},NO:{chinese:'挪威',english:'Norway'},OM:{chinese:'阿曼',english:'Oman'},PK:{chinese:'巴基斯坦',english:'Pakistan'},PA:{chinese:'巴拿馬',english:'Panama'},PY:{chinese:'巴拉圭',english:'Paraguay'},PE:{chinese:'秘魯',english:'Peru'},PH:{chinese:'菲律賓',english:'Philippines'},PL:{chinese:'波蘭',english:'Poland'},PT:{chinese:'葡萄牙',english:'Portugal'},PR:{chinese:'波多黎各',english:'Puerto Rico'},QA:{chinese:'卡塔爾',english:'Qatar'},RE:{chinese:'留尼旺',english:'Reunion'},RO:{chinese:'羅馬尼亞',english:'Romania'},RU:{chinese:'俄羅斯',english:'Russia'},RW:{chinese:'盧旺達',english:'Rwanda'},SM:{chinese:'聖馬力諾',english:'San Marino'},SA:{chinese:'沙特阿拉伯',english:'Saudi Arabia'},SN:{chinese:'塞內加爾',english:'Senegal'},RS:{chinese:'塞爾維亞',english:'Serbia'},SL:{chinese:'塞拉利昂',english:'Sierra Leone'},SG:{chinese:'新加坡',english:'Singapore'},SK:{chinese:'斯洛伐克',english:'Slovakia'},SI:{chinese:'斯洛文尼亞',english:'Slovenia'},SO:{chinese:'索馬里',english:'Somalia'},ZA:{chinese:'南非',english:'South Africa'},ES:{chinese:'西班牙',english:'Spain'},LK:{chinese:'斯里蘭卡',english:'Sri Lanka'},SD:{chinese:'蘇丹',english:'Sudan'},SR:{chinese:'蘇里南',english:'Suriname'},SZ:{chinese:'斯威士蘭',english:'Swaziland'},SE:{chinese:'瑞典',english:'Sweden'},CH:{chinese:'瑞士',english:'Switzerland'},SY:{chinese:'敘利亞',english:'Syria'},TW:{chinese:'台灣',english:'Taiwan'},TJ:{chinese:'塔吉克斯坦',english:'Tajikstan'},TZ:{chinese:'坦桑尼亞',english:'Tanzania'},TH:{chinese:'泰國',english:'Thailand'},TG:{chinese:'多哥',english:'Togo'},TO:{chinese:'湯加',english:'Tonga'},TT:{chinese:'特立尼達和多巴哥',english:'Trinidad and Tobago'},TN:{chinese:'突尼斯',english:'Tunisia'},TR:{chinese:'土耳其',english:'Turkey'},TM:{chinese:'土庫曼斯坦',english:'Turkmenistan'},VI:{chinese:'美屬維爾京群島',english:'U.S. Virgin Islands'},UG:{chinese:'烏乾達',english:'Uganda'},UA:{chinese:'烏克蘭',english:'Ukraine'},AE:{chinese:'阿聯酋',english:'United Arab Emirates'},GB:{chinese:'英國',english:'United Kiongdom'},US:{chinese:'美國',english:'USA'},UY:{chinese:'烏拉圭',english:'Uruguay'},UZ:{chinese:'烏茲別克斯坦',english:'Uzbekistan'},VA:{chinese:'梵蒂岡',english:'Vatican City'},VE:{chinese:'委內瑞拉',english:'Venezuela'},VN:{chinese:'越南',english:'Vietnam'},YE:{chinese:'也門',english:'Yemen'},YU:{chinese:'南斯拉夫',english:'Yugoslavia'},ZR:{chinese:'扎伊爾',english:'Zaire'},ZM:{chinese:'贊比亞',english:'Zambia'},ZW:{chinese:'津巴布韋',english:'Zimbabwe'}}
