module.exports = function (context, req) {
	if (req.method === "GET") {
		// handle new subscription request
		let mode = req.query["hub.mode"];
		let challenge = req.query["hub.challenge"];
		let verify = req.query["hub.verify_token"];

		if (verify === process.env.FB_VERIFY_TOKEN) {
			// if verification matches, return challenge
			context.res.raw(challenge);
		} else {
			context.res.sendStatus(400);
		}
	}
	else if (req.method === "POST") {
		context.log('HTTP Post triggered...');
		let entries = req.body.entry;
		// Old expression that was converted to be more dynamic:  /(#hfm)($|[\s\n.,]+)/
		// Also remove the space / newline checks, as even if it is #HFMo, it should probably trigger for safety sake
		//let hfmRx = new RegExp("(#" + process.env.HASHTAG + ")($|[\\s\\n.,]+)", "igm");
		let hfmRx = new RegExp("(#" + process.env.HASHTAG + ")", "igm");

		if (entries) {
			entries.forEach(function (entry) {
				entry.changes.forEach(function (change) {
					if (change.field === "status") {
						if (change.value.match(hfmRx)) {
							context.log('HFM Hashtag match found in: ' + change.value);
							var data = {
								platform: 'facebook',
								userid: entry.id,
								mediaid: change.id,
								facebook: {
									post: change.value
								}
							};

							context.bindings.out = data;
						}
					}
				});
			});
		}
		context.res.sendStatus(200);
	};
};
