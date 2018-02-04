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
	  context.log('Expression:' + "/(#" + process.env.HASHTAG + ")($|[\s\n.,]+)/");
	let entries = req.body.entry;
	// Old expression that was converted to be more dynamic:  /(#hfm)($|[\s\n.,]+)/
    let hfmRx = new RegExp("/(#" + process.env.HASHTAG + ")($|[\\s\\n.,]+)/", "igm");

    if (entries) {
      entries.forEach(function (entry) {
        entry.changes.forEach(function (change) {
			context.log('Change Field: ' + change.field);
			context.log('Change Value: ' + change.value);
          if (change.field === "status") {
            if (change.value.match(hfmRx)) {
				context.log('HFM Hashtag match found...');
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

function escapeRegex(value) {
    return value.replace( /[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&" );
}