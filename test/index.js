var should = require('should');
var store = require('../lib/index');
describe('#store#',function(){
  this.timeout(5000);
  describe('data in memory',function(){
    var instance;
    before(function(){
      instance = new store();
    });
    it('set()',function(done){
      instance.set('withdraw-1',1,function(err,data){
        data.data.should.be.equal(1);
        data.ttl.should.be.equal(86400000);
        done(err);
      })
    });
    it('get()',function(done){
      instance.get('withdraw-1',function(err,data){
        should.exists(data);
        done(err);
      })
    });
    it('remove()',function(done){
      instance.remove('withdraw-1',function(err,data){
        done(err);
      })
    });
    it('get()',function(done){
      instance.get('withdraw-1',function(err,data){
        should.not.exists(data);
        done(err);
      })
    });
    it('set()',function(done){
      instance.set('withdraw-2',1,1,function(err,data){
        data.data.should.be.equal(1);
        data.ttl.should.be.equal(1000);
        done(err);
      })
    });
    it('get()',function(done){
      instance.get('withdraw-2',function(err,data){
        data.data.should.be.equal(1);
        data.ttl.should.be.equal(1000);
        should.exists(data);
        setTimeout(function(){
          done(err);
        },500);     
      })
    });
    it('update()',function(done){
      instance.update('withdraw-2',2,function(err,data){
        data.data.should.be.equal(2);
        data.expire.should.be.below(Date.now()+500);
        done(err);
      })
    });
    it('get()',function(done){
      setTimeout(function(){
        instance.get('withdraw-2',function(err,data){
            should.not.exists(data);
            done(err);
        })
      },1001);
    });
    it('update()',function(done){
      instance.update('withdraw-2',2,function(err,data){
        should.exists(err);
        done();
      })
    })
  });
  describe('data in memory sync',function(){
    var instance;
    before(function(){
      instance = new store()
    })
    it('get()',function(done){
      done(instance.get('withdraw-3'));
    });
    it('set()',function(done){
      instance.set('withdraw-3',1);
      instance.get('withdraw-3').should.be.ok();
      done();
    });
    it('remove()',function(done){
      instance.remove('withdraw-3');
      done(instance.get('withdraw-3'))
    });
  });
  describe('data in memory database',function(){
    var instance;
    var _store = {};
    before(function(){
      instance = new store({
        set:function(key,data,ttl,callback){
          _store[key] = data;
          callback(null,data);
        },
        get:function(key,callback){
          callback(null,_store[key]);
        },
        remove:function(key,callback){
          var data = _store[key]
          delete _store[key];
          callback(null,data);
        }
      })
    })
    it('get()',function(done){
      instance.get('withdraw-3',function(err,data){
        should.not.exists(data);
        done(err);
      })
    });
    it('set()',function(done){
      instance.set('withdraw-3',1,function(err,data){
        should.exists(data);
        done(err);
      })
    });
    it('get()',function(done){
      instance.get('withdraw-3',function(err,data){
        should.exists(data);
        done(err);
      })
    });
    it('remove()',function(done){
      instance.remove('withdraw-3',function(err,data){
        should.exists(data);
        done(err);
      })
    });
    it('set()',function(done){
      instance.set('withdraw-4',1,1,function(err,data){
        should.exists(data);
        done(err);
      })
    });
    it('get()',function(done){
      instance.get('withdraw-4',function(err,data){
        should.exists(data);
        setTimeout(function(){
          done(err);
        },500);
      })
    });
    it('update()',function(done){
      instance.update('withdraw-4',2,function(err,data){
        data.data.should.be.equal(2);
        data.expire.should.be.below(Date.now()+500);
        done(err);
      })
    });
    it('get()',function(done){
      setTimeout(function(){
        instance.get('withdraw-4',function(err,data){
          should.not.exists(data);
          done(err);
        })
      },1003);
    });
    it('remove()',function(done){
      instance.remove('withdraw-4',function(err,data){
        should.not.exists(data);
        done(err);
      })
    });
    it('update()',function(done){
      instance.update('withdraw-4',2,function(err,data){
        should.exists(err);
        done();
      });
    });
  });
  describe('data in redis',function(){
    var instance;
    var redis = require("redis"),
      client = redis.createClient(6379,'localhost');
    before(function(){
      instance = new store({
        set:function(key,data,ttl,callback){
          client.PSETEX(key,ttl,data,function(err,reply){
              callback(err,reply);
          });
        },
        get:function(key,callback){
          client.GET(key,function(err,reply){
            callback(err,reply);
          });
        },
        remove:function(key,callback){
          client.DEL(key,function(err,data){
            callback(err,data);
          });
        }
      })
    })
    it('get()',function(done){
      instance.get('withdraw-5',function(err,data){
        should.not.exists(data);
        done(err);
      })
    });
    it('set()',function(done){
      instance.set('withdraw-5',1,function(err,data){
        should.exists(data);
        done(err);
      })
    });
    it('get()',function(done){
      instance.get('withdraw-5',function(err,data){
        should.exists(data);
        done(err);
      })
    });
    it('remove()',function(done){
      instance.remove('withdraw-5',function(err,data){
        should.exists(data);
        done(err);
      })
    });
    it('set()',function(done){
      instance.set('withdraw-6',1,1,function(err,data){
        should.exists(data);
        done(err);
      })
    });
    it('get()',function(done){
      instance.get('withdraw-6',function(err,data){
        should.exists(data);
        setTimeout(function(){
          done(err);
        },500);
      })
    });
    it('update()',function(done){
      instance.update('withdraw-6',2,function(err,data){
        data.data.should.be.equal(2);
        data.expire.should.be.below(Date.now()+500);
        done(err);
      })
    });
    it('get()',function(done){
      setTimeout(function(){
        instance.get('withdraw-6',function(err,data){
          should.not.exists(data);
          done(err);
        })
      },1003);
    });
    it('remove()',function(done){
      instance.remove('withdraw-6',function(err,data){
        data.should.be.equal(0);
        done(err);
      })
    });
    it('update()',function(done){
      instance.update('withdraw-6',2,function(err,data){
        should.exists(err);
        done();
      });
    });
    after(function(){
      instance.remove('withdraw-5',function(err){

      });
      instance.remove('withdraw-6',function(err){

      });
    })
  });
  describe('auto clean timeout data',function(){
    var instance;
    var _store = {};
    before(function(){
      instance = new store({
        autoClean:true,
        cleanTimeoutSecond:1
      })
    })
    it('set()',function(done){
      instance.set('withdraw-8',1,3,function(err,data){
        data.data.should.be.equal(1);
        data.ttl.should.be.equal(3000);
        done(err);
      })
    });
    it('get()',function(done){
      instance.get('withdraw-8',function(err,data){
        should.exists(data);
        done(err);
      })
    });
    it('timeout() data not clean',function(done){
      setTimeout(function() {
        should.exists(instance._store['store-ttl-withdraw-8']);
        done(null);
      }, 1000);
    });
    it('timeout() data haved clean',function(done){
      setTimeout(function() {
        should.not.exists(instance._store['store-ttl-withdraw-8']);
        done(null);
      }, 2500);
    });
  })
})