/**
 * Surge Script: AI Proxy Geo-Checker (Module Version v2)
 *
 * Description: Reads configuration from $argument (query string format).
 * Uses the exact same helper functions and main logic flow as v1.1.
 *
 * Script Version: 2.0 (Updated: 2025-05-03) - Argument parsing integrated into v1.1 base.
 */

// --- Argument Parsing ---
let ARGS = {};
let initialArgsError = null;

try {
    // Debug Notification (Optional: Uncomment to see raw argument)
    
		/*
    let argumentValueForNotification = $argument;
    let argumentType = typeof $argument;
    if (argumentType === 'string') { argumentValueForNotification = $argument; }
    else if (argumentType !== 'undefined') { argumentValueForNotification = `Non-string type received. Type: ${argumentType}`; }
    $notification.post("AI Proxy Checker: Argument Debug", `Received $argument type: ${argumentType}`, argumentValueForNotification);
    */

    if (typeof $argument === 'string' && $argument.length > 0) {
        ARGS = Object.fromEntries(
            $argument.split("&").map((item) => {
                const firstEqualIndex = item.indexOf('=');
                if (firstEqualIndex === -1) { return [decodeURIComponent(item), '']; }
                const key = decodeURIComponent(item.substring(0, firstEqualIndex));
                const value = decodeURIComponent(item.substring(firstEqualIndex + 1).replace(/\+/g, ' '));
                return [key, value];
            }).filter(pair => pair && pair[0])
        );
        // Basic validation during parsing
        if (!ARGS.surge_key) { throw new Error("Required argument 'surge_key' missing."); }
        if (!ARGS.group_name) { throw new Error("Required argument 'group_name' missing."); }
    } else {
         throw new Error(`Script argument invalid or missing. Type: ${typeof $argument}`);
    }
} catch (e) {
    console.error(`[Initialization Error] Failed to parse script arguments: ${e}. Arg: ${typeof $argument === 'string' ? '"' + $argument + '"' : typeof $argument}`);
    initialArgsError = e; // Store error
    // Notify about parsing error specifically
    $notification.post("AI Proxy Check Error", "Argument Parse Failed", `Check module config. Error: ${e}`);
}

// --- Configuration Variables (Populated from ARGS later) ---
// These variables will be used by the v4.1 logic below.
// They MUST be assigned inside the async IIFE *before* being used by helpers/main logic.
let SURGE_BASE_URL = "";
let SURGE_API_KEY = "";
let POLICY_GROUP_NAME = "";

// --- Static Configuration (Copied from v4.1) ---
const TEST_URLS = {
    openai: "https://api.openai.com/v1/models",
    notebooklm: "https://notebooklm.google/",
    anthropic: "https://api.anthropic.com/v1/messages"
};
const NOTEBOOKLM_UNSUPPORTED_URL = "https://notebooklm.google/?location=unsupported";
const GEO_BLOCK_KEYWORDS = [
    "location is not supported", "forbidden", "request not allowed",
    "unsupported_country", "geo-restricted", "not available in your region",
    "not available in your country", "permission denied", "not supported for the api use"
];

// --- Helper Functions (Copied EXACTLY from v4.1) ---
// These functions now implicitly rely on the global 'let' variables above
// being correctly assigned within the async IIFE before they are called.

function surgeApiRequest(path, method = 'GET', body = null) {
     return new Promise((resolve, reject) => {
        const options = {
            url: `${SURGE_BASE_URL}${path}`, // Uses global SURGE_BASE_URL
            method: method,
            headers: { 'X-Key': SURGE_API_KEY }, // Uses global SURGE_API_KEY
        };
        if (body && Object.keys(body).length > 0) {
            options.headers['Content-Type'] = 'application/json';
            options.body = (typeof body === 'object') ? JSON.stringify(body) : body;
        }
        $httpClient[method.toLowerCase()](options, (error, response, data) => {
            if (error) { console.error(`Surge API Error (${path}): ${error}`); return reject(new Error(`Surge API request failed for ${path}: ${error}`)); }
            if (response.status >= 400 && response.status < 600) { console.error(`Surge API Error (${path}): Status ${response.status}, Body: ${data}`); return reject(new Error(`Surge API request failed for ${path}: Status ${response.status}`)); }
            try { resolve(data ? JSON.parse(data) : {}); } catch (parseError) { if (data) { console.error(`Surge API Error (${path}): Failed to parse JSON response: ${data}`); reject(new Error(`Failed to parse Surge API response for ${path}`)); } else { resolve({}); } }
        });
    });
}

function checkSimpleUrlAccessibility(url, proxyName, serviceName = 'Service') {
    // Identical to v4.1
     return new Promise((resolve) => {
        const options = { url: url, policy: proxyName, timeout: 15, headers: { 'User-Agent': `Surge/1.0 (Geo-Check Module/${serviceName})` } };
        $httpClient.get(options, (error, response, data) => {
            if (error) { console.log(`   - ${serviceName} Test Failed (Network Error) via ${proxyName}: ${error}`); resolve(false); return; }
            const responseBody = data ? data.toLowerCase() : ""; const isBlocked = GEO_BLOCK_KEYWORDS.some(keyword => responseBody.includes(keyword.toLowerCase()));
            if (isBlocked) { console.log(`   - ${serviceName} Test Failed (Geo-Blocked) via ${proxyName}: Found keyword.`); resolve(false); } else { if (response && response.status >= 400) { console.log(`   - ${serviceName} Test Passed (HTTP Error Ignored) via ${proxyName}: Status ${response.status}`); } else { console.log(`   - ${serviceName} Test Passed (OK) via ${proxyName}: Status ${response ? response.status : 'N/A'}`); } resolve(true); }
        });
    });
}

function getHeaderValue(headers, headerName) {
    if (!headers) { return null; }
    const targetName = headerName.toLowerCase();
    for (const key in headers) {
        if (Object.prototype.hasOwnProperty.call(headers, key) && key.toLowerCase() === targetName) {
            return headers[key];
        }
    }
    return null;
}

function resolveRedirectUrl(location, currentUrl) {
    if (!location) { return null; }
    try {
        return new URL(location, currentUrl).toString();
    } catch (error) {
        if (/^https?:\/\//i.test(location)) { return location; }
        if (location.charAt(0) === '/') {
            const match = currentUrl.match(/^(https?:\/\/[^/]+)/i);
            return match ? `${match[1]}${location}` : location;
        }
        const base = currentUrl.replace(/[#?].*$/, '').replace(/\/[^/]*$/, '/');
        return `${base}${location}`;
    }
}

function checkNotebookLmRedirect(proxyName) {
    return new Promise((resolve) => {
        const maxRedirects = 8;
        let currentUrl = TEST_URLS.notebooklm;
        let redirectCount = 0;

        function requestCurrentUrl() {
            const options = {
                url: currentUrl,
                method: 'GET',
                policy: proxyName,
                timeout: 20,
                "auto-redirect": false,
                headers: { 'User-Agent': 'Surge/1.0 (Geo-Check Module/NotebookLM)' }
            };

            $httpClient.get(options, (error, response) => {
                if (error) { console.log(`   - NotebookLM Test Failed (Network Error) via ${proxyName}: ${error}`); resolve(false); return; }

                const status = response ? response.status : 0;
                const location = response ? getHeaderValue(response.headers, 'Location') : null;
                if (status >= 300 && status < 400 && location) {
                    const nextUrl = resolveRedirectUrl(location, currentUrl);
                    if (!nextUrl) { console.log(`   - NotebookLM Test Failed (Invalid Redirect) via ${proxyName}: ${location}`); resolve(false); return; }
                    currentUrl = nextUrl;
                    redirectCount += 1;
                    if (redirectCount > maxRedirects) { console.log(`   - NotebookLM Test Failed (Too Many Redirects) via ${proxyName}: Final URL ${currentUrl}`); resolve(false); return; }
                    requestCurrentUrl();
                    return;
                }

                if (currentUrl === NOTEBOOKLM_UNSUPPORTED_URL) {
                    console.log(`   - NotebookLM Test Failed (Unsupported Location) via ${proxyName}: Final URL ${currentUrl}`);
                    resolve(false);
                } else {
                    console.log(`   - NotebookLM Test Passed (Redirect Result) via ${proxyName}: Final URL ${currentUrl}, Status ${status || 'N/A'}`);
                    resolve(true);
                }
            });
        }

        requestCurrentUrl();
    });
}

async function testProxy(proxyName) {
    console.log(`Testing proxy: ${proxyName}...`);
    try {
        const checks = []; checks.push(checkSimpleUrlAccessibility(TEST_URLS.openai, proxyName, 'OpenAI'));
        checks.push(checkNotebookLmRedirect(proxyName));
        checks.push(checkSimpleUrlAccessibility(TEST_URLS.anthropic, proxyName, 'Anthropic'));
        const results = await Promise.all(checks); const isWorking = results.every(result => result === true);
        if (isWorking) { console.log(`Proxy ${proxyName} PASSED all active checks.`); } else { console.log(`Proxy ${proxyName} FAILED one or more active checks.`); } return isWorking;
    } catch (error) { console.error(`Error during testing logic for proxy ${proxyName}: ${error}`); return false; }
}

async function switchPolicy(groupName, policyName) {
    // Identical to v4.1 - uses global POLICY_GROUP_NAME implicitly via surgeApiRequest
    // Note: v4.1's switchPolicy took groupName as an argument, let's keep that signature
    // It will use the POLICY_GROUP_NAME passed to it here, which comes from the main logic block.
    console.log(`Switching group '${groupName}' to policy '${policyName}'...`);
    try { const requestBody = { group_name: groupName, policy: policyName };
        // Uses global surgeApiRequest function
        await surgeApiRequest('/v1/policy_groups/select', 'POST', requestBody);
        console.log(`Successfully switched group '${groupName}' to policy '${policyName}'.`);
        $notification.post("AI Proxy Switched", `Group: ${groupName}`, `Switched to working proxy: ${policyName}`);
    } catch (error) { console.error(`Failed to switch policy group '${groupName}' to '${policyName}': ${error}`); $notification.post("AI Proxy Switch Failed", `Group: ${groupName}`, `Error switching to ${policyName}: ${error.message}`); }
}

// --- Main Script Logic (IIFE - Modified Start based on v4.1) ---

(async () => {
    // --- Check for Argument Parsing Errors FIRST ---
    if (initialArgsError) {
        console.error("Aborting main logic due to argument parsing error during initialization.");
        // Notification about parsing error was already sent in the sync catch block
        $done(); // Terminate script
        return;
    }

    // --- Assign Parsed Arguments to Global Variables ---
    // This makes them accessible to the globally defined helper functions
    SURGE_BASE_URL = ARGS.surge_url; 
    SURGE_API_KEY = ARGS.surge_key;
    POLICY_GROUP_NAME = ARGS.group_name; // Already validated as present during parsing

    const startTime = new Date();
    console.log(`Starting AI Proxy Geo-Checker script (Module v6) at ${startTime.toLocaleString()}...`);

    // --- Initial Checks (Similar to v4.1 but using assigned variables) ---
    // Check if essential assigned variables are actually usable
    if (!SURGE_API_KEY) {
        // This case should technically be caught by parsing validation, but double-check
        console.error("Surge API Key is empty after assignment.");
        $notification.post("AI Proxy Check Error", "Config Error", "Surge API Key is required.");
        $done(); return;
    }
    // POLICY_GROUP_NAME is also checked during parsing

    console.log(`Using Config: SurgeURL=${SURGE_BASE_URL}, Group='${POLICY_GROUP_NAME}'`);

    // --- V4.1 Core Logic Starts Here ---
    let groupPolicies = [];
    let currentPolicy = null;

    // 1. Get Policy Group Details (Uses global surgeApiRequest, POLICY_GROUP_NAME)
    try {
        console.log(`Workspaceing policy groups for '${POLICY_GROUP_NAME}'...`);
        const allGroups = await surgeApiRequest('/v1/policy_groups');

        if (typeof allGroups !== 'object' || allGroups === null) { throw new Error(`Invalid response from /v1/policy_groups.`); }
        if (!allGroups.hasOwnProperty(POLICY_GROUP_NAME)) {
            const trimmedGroupName = typeof POLICY_GROUP_NAME === 'string' ? POLICY_GROUP_NAME.trim() : POLICY_GROUP_NAME;
            let hint = "";
            if (trimmedGroupName !== POLICY_GROUP_NAME && allGroups.hasOwnProperty(trimmedGroupName)) { hint = ` Did you mean '${trimmedGroupName}'?`; }
            throw new Error(`Policy group "${POLICY_GROUP_NAME}" not found.${hint}`);
        }

        groupPolicies = allGroups[POLICY_GROUP_NAME].map(p => p.name);
        if (groupPolicies.length === 0) { throw new Error(`Policy group "${POLICY_GROUP_NAME}" is empty.`); }

        const selection = await surgeApiRequest(`/v1/policy_groups/select?group_name=${encodeURIComponent(POLICY_GROUP_NAME)}`, 'GET');
        currentPolicy = selection.policy;
        if (!currentPolicy || !groupPolicies.includes(currentPolicy)) { console.warn(`Current policy invalid/undetected for ${POLICY_GROUP_NAME}. Starting test from first.`); currentPolicy = groupPolicies[0]; }
        console.log(`Found group '${POLICY_GROUP_NAME}': [${groupPolicies.join(', ')}]. Current: ${currentPolicy}`);

    } catch (error) { console.error(`Error getting policy group details: ${error}`); $notification.post("AI Proxy Check Error", "Failed to get group info", `${error}`); $done(); return; }

    // 2. Find current policy index and iterate/test (Uses global testProxy)
    const currentIndex = groupPolicies.indexOf(currentPolicy); let foundWorkingProxy = false;
    for (let i = 0; i < groupPolicies.length; i++) {
        const policyIndex = (currentIndex + i) % groupPolicies.length; const policyToTest = groupPolicies[policyIndex];
        const isWorking = await testProxy(policyToTest); // testProxy calls other global helpers
        if (isWorking) {
            foundWorkingProxy = true;
            if (policyToTest !== currentPolicy) {
                // Call v4.1 switchPolicy signature, passing the global POLICY_GROUP_NAME
                await switchPolicy(POLICY_GROUP_NAME, policyToTest);
            } else {
                console.log(`Current policy '${policyToTest}' is working.`);
            }
            break;
        }
    }

    // 3. Finalize (Identical to v4.1)
    if (!foundWorkingProxy) { console.warn(`No working proxy found in group '${POLICY_GROUP_NAME}'.`); $notification.post("AI Proxy Check Failed", `Group: ${POLICY_GROUP_NAME}`, "All proxies failed checks."); }
    console.log("AI Proxy Geo-Checker script finished.");
    $done();

})().catch(error => {
    console.error(`Script execution failed with unhandled error: ${error.stack || error}`);
    $notification.post("AI Proxy Script Error", "Execution Failed Unexpectedly", `${error}`);
    $done();
});
