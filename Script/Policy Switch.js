const $ = new nobyda();
const url = $request.url;
const body = JSON.parse($request.body || '{}');

(async function SwitchPoliy() {
	let res = {};
	if (/\/getGroup$/.test(url))
		res.group = await $.getGroup();
	if (/\/getPolicy$/.test(url))
		res.policy = await $.getPolicy(body.group);
	if (/\/setPolicy$/.test(url))
		res.success = await $.setPolicy(body.group, body.policy);
	$.done(res);
})()

function nobyda() {
	const isLoon = typeof($loon) !== "undefined" && $loon > 289;
	const isQuanX = typeof($configuration) !== 'undefined';
	const isSurge = typeof($httpAPI) !== 'undefined';
	const m = `⚠️ App version is not supported, please update to the newest version ⚠️`;
	this.getGroup = () => {
		if (isSurge) {
			return new Promise((resolve) => {
				$httpAPI("GET", "v1/policies", {}, (b) => resolve(b['policy-groups']))
			})
		}
		if (isLoon) {
			const getName = JSON.parse($config.getConfig());
			return getName['all_policy_groups'];
		}
		if (isQuanX) {
			return new Promise((resolve) => {
				$configuration.sendMessage({
					action: "get_customized_policy"
				}).then(b => {
					if (b.ret) {
						resolve(Object.keys(b.ret).filter(s => b.ret[s].type == "static"));
					} else resolve();
				}, () => resolve());
			})
		}
		return m;
	}
	this.getPolicy = (groupName) => {
		if (isSurge) {
			return new Promise((resolve) => {
				$httpAPI("GET", "v1/policy_groups", {}, (b) => {
					resolve(b[groupName].map(g => g.name))
				})
			})
		}
		if (isLoon) {
			const get = JSON.parse($config.getSubPolicys(groupName));
			return get.map(n => n[0].name);
		}
		if (isQuanX) {
			return new Promise((resolve) => {
				$configuration.sendMessage({
					action: "get_customized_policy",
					content: groupName
				}).then(b => {
					if (b.ret && b.ret[groupName]) {
						resolve(b.ret[groupName].candidates);
					} else resolve();
				}, () => resolve());
			})
		}
		return m;
	}
	this.setPolicy = (group, policy) => {
		if (isSurge) {
			return new Promise((resolve) => {
				$httpAPI("POST", "v1/policy_groups/select", {
					group_name: group,
					policy: policy
				}, (b) => resolve(!b.error))
			})
		}
		if (isLoon) {
			const set = $config.setSelectPolicy(group, policy);
			return set;
		}
		if (isQuanX) {
			return new Promise((resolve) => {
				$configuration.sendMessage({
					action: "set_policy_state",
					content: {
						[group]: policy
					}
				}).then((b) => resolve(!b.error), () => resolve());
			})
		}
		return m;
	}
	this.done = (body) => {
		const e = {
			response: {
				body: JSON.stringify(body)
			}
		};
		$done(typeof($task) != "undefined" ? e.response : e);
	}
}