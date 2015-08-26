var assert = require("chai").assert; // node.js core module
var getenv = require('getenv');

describe('stripe',function(){

    var seneca = require('seneca')();
    seneca.use('..');

    describe('getEvents',function(){
        it('should get stripe events',function(done){
            this.timeout(3000);
            var api_key = getenv("STRIPE_API_KEY");
            var req =  {lpi:'stripe', cmd:'getEvents', config:{stripe:{name:"test",api_key:api_key}}, env:{"nextExecTime":1443657599000,"execTime":1440597273000,"executionCount":1}};

            seneca.act(req, function(err,result){
                console.log( '%j', result );
                assert.isArray(result,'result is an Array');
                done();
            });
        })
    });

    describe('about',function(){
        it('should return integration properties',function(done){
            seneca.act( {lpi:'stripe', cmd:'about'}, function(err,result){
                console.log( '%j', result );
                assert.isObject(result,'result is an object');
                assert.equal(result.name,'stripe','name is stripe');
                done();
            });
        })
    });


    describe('list',function(){
        it('should return a command\'s json schema',function(done){
            seneca.act({lpi:'stripe',cmd:'list'}, function(err,list){
                console.log('%j',list);
                assert.isObject(list,'list is object');
                done();
            });
        });
    });
});
