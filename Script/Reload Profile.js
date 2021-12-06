let params = getParams($argument)

!(async () => {
/* 時間獲取 */
let traffic = (await httpAPI("/v1/traffic","GET"))
let dateNow = new Date()
let dateTime = Math.floor(traffic.startTime*1000)
let startTime = timeTransform(dateNow,dateTime)

if ($trigger == "button") await httpAPI("/v1/profiles/reload");

  $done({
      title:"Surge Pro",
      content:`Starts fоr: ${startTime}`,
		icon: params.icon,
		"icon-color":params.color
    });

})();

function timeTransform(dateNow,dateTime) {
let dateDiff = dateNow - dateTime;
let days = Math.floor(dateDiff / (24 * 3600 * 1000));//計算出相差天數
let leave1=dateDiff%(24*3600*1000)    //計算天數後剩餘的毫秒數
let hours=Math.floor(leave1/(3600*1000))//計算出小時數
//計算相差分鐘數
let leave2=leave1%(3600*1000)    //計算小時數後剩餘的毫秒數
let minutes=Math.floor(leave2/(60*1000))//計算相差分鐘數
//計算相差秒數
let leave3=leave2%(60*1000)      //計算分鐘數後剩餘的毫秒數
let seconds=Math.round(leave3/1000)

if(days==0){

	if(hours==0){
	if(minutes==0)return(`${seconds} sec`);
	return(`${minutes} min ${seconds} sec`)
	}
	return(`${hours} hrs ${minutes} min ${seconds} sec`)
	}else {
	return(`${days} days ${hours} hrs ${minutes} min`)
	}

}


function httpAPI(path = "", method = "POST", body = null) {
    return new Promise((resolve) => {
        $httpAPI(method, path, body, (result) => {
            resolve(result);
        });
    });
}

function getParams(param) {
  return Object.fromEntries(
    $argument
      .split("&")
      .map((item) => item.split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  );
}
