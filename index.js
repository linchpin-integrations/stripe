var schemas = require('./commands');
var pjson = require('./package.json');
var _ = require('underscore');
var async = require('async');

var service = {
    "name": "stripe"
    , "label": "Stripe"
    , "description": "Get Stripe events"
    , "version": pjson.version
    , "private": true
    , "form_options": null
    , "is_oauth": false
    , "logo": "//linchpin-web-assets.s3.amazonaws.com/v1/integrations/stripe/stripe-logo.png"
    , "server_integration": true
    , "frontend_integration": true
    , "supports_webhook": true
};

module.exports = function(options) {
    var lpis = this;

    options = lpis.util.deepextend({
    },options);

    lpis.add({lpi:'stripe',cmd:'about'},about);
    lpis.add({lpi:'stripe',cmd:'list'},list);
    lpis.add({lpi:'stripe',cmd:'getEvents'},getEvents);

    return {
        name:'stripe'
    };

    function about (args, done ){
        return done(null,service);
    }

    function list (args, done){
        return done(null, schemas);
    }

    function getEvents(args,done){
        var api_key = args.config.stripe.api_key;
        var stripe = require('stripe')(api_key);

        var list = [];
        var has_more = true;
        var last_id = null;
        var diff = Math.floor((args.env.nextExecTime - args.env.execTime) /1000 );
        var execTime = Math.floor(args.env.execTime/1000);
        var prevTime = execTime - diff;


        async.whilst(
            function(){ return has_more },
            function(callback){
                // get last period
                var opts= {limit: 100, created: {gte: ""+prevTime, lt: ""+execTime}};
                if(last_id != null){
                    opts.starting_after = last_id;
                }

                console.log("getting events");

                stripe.events.list(opts, function(err, response){
                    if(err){
                        return callback(err);
                    }

                    console.log("got something");

                    list.push.apply(list,response.data);
                    if(response.has_more == true) {
                        has_more = true;
                        last_id = _.last(list).id;
                    } else {
                        has_more = false;
                    }
                    callback();
                })
            }, function(err){
                if(err){
                    return done(err);
                }

                return done(null, list);
            }
        );
    }
};