// Webhook:  Facebook
// ------------------
// The GET portion handles the registration of the webhook subscription, returning back to Facebook the challenge sent.
// The POST portion is triggered whenever the a registered Facebook user updates a field tracked in the subscription.
// If the status field is updated, a queue message is created containing the post.

module.exports = function (context, req) {
	if (req.method === "GET") {
		context.log('Verifying subscription registration...');

		// handle new subscription request
		let mode = req.query["hub.mode"];
		let challenge = req.query["hub.challenge"];
		let verify = req.query["hub.verify_token"];

		if (verify === process.env.FB_VERIFY_TOKEN) {
			context.log('Returning challenge...');
			// if verification matches, return challenge
			context.res.raw(challenge);
		} else {
			context.log.warn('Facebook token not verified.');
			context.res.sendStatus(400);
		}
	}
	else if (req.method === "POST") {
		context.log('Subscription triggered...');

		let entries = req.body.entry;
		// Old expression that was converted to be more dynamic:  /(#hfm)($|[\s\n.,]+)/
		// Also remove the space / newline checks, as even if it is #HFMo, it should probably trigger for safety sake
		//let hfmRx = new RegExp("(#" + process.env.HASHTAG + ")($|[\\s\\n.,]+)", "igm");
		let hfmRx = new RegExp("(#" + process.env.HASHTAG + ")", "igm");

		if (entries) {
			context.log('Request has entries...');

			entries.forEach(function (entry) {
				context.log('Looping through changes in each entry...');

				entry.changes.forEach(function (change) {
					context.log('Checking change field: ' + change.field);

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

							context.log({'Data sent to queue': data});
							context.bindings.out = data;
						}
					}
				});
			});
		}

		context.res.sendStatus(200);
	};
};
