module.exports = function (context, req) {
    if (req.method === "GET") {
		context.log('Verifying subscription registration...');

        // handle new subscription request
        let mode = req.query["hub.mode"];
        let challenge = req.query["hub.challenge"];
        let verify = req.query["hub.verify_token"];

        if (verify === process.env.IG_VERIFY_TOKEN) {
			context.log('Returning challenge...');
            // if verification matches, return challenge
            context.res.raw(challenge);
        } else {
			context.log.warn('Instagram token not verified.');
            context.res.sendStatus(400);
        }
    } else {
		context.log('Subscription triggered...');

        // map all updates to array of user_id & media_id messages, send to queue
        var data = req.body.map(item => JSON.stringify(
            {
                platform: 'instagram',
                userid: item.object_id,
                mediaid: item.data.media_id
            }));

		context.log({'Data sent to queue': data});
        context.bindings.out = data;
        context.res.sendStatus(200);
    }
};