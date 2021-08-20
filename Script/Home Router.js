const ssid1 = "ssid1";
const ssid2 = "ssid2";
const name = "router.com";
let home = ($network.wifi.ssid === ssid1) || ($network.wifi.ssid === ssid2);
const getModuleStatus = new Promise((resolve) => {
  $httpAPI("GET", "v1/modules", null, (data) =>
	  resolve(data.enabled.includes(name))
  );
});

getModuleStatus.then((enabled) => {
  if (home && !enabled) {
	enableModule(true);
  } else if (!home && enabled) {
	enableModule(false);
  } else {
	$done();
  }
});

function enableModule(status) {
  $httpAPI("POST", "v1/modules", { [name]: status }, () => $done());
}