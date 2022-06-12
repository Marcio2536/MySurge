/* Crack Photoshop App on iPad
Photoshop = type=http-response,pattern=https:\/\/lcs-mobile-cops\.adobe\.io\/mobile_profile\/nul\/v2,requires-body=1,max-size=-1,control-api=1,script-path=https://raw.githubusercontent.com/Marcio2536/rules/master/Photoshop.js,script-update-interval=0  
*/
let body = JSON.parse($response.body)
let pro = body["mobileProfile"];
pro["profileStatus"] = "PROFILE_AVAILABLE";
pro["legacyProfile"] = "{}";
pro["relationshipProfile"] = "[]";
$done({
  body: JSON.stringify(body)
});
