var events = require('events');
var util = require('util');
var _util = require('./util');
function STORE_TTL(config){
  if(!_util.isObject(config)){
    console.error('config must be object.');
    return;
  }
  this._store = {};
  this.config = config;
  this.config.namespace = config.namespace || 'store-ttl';
  this.config.expireListPrefix = config.namespace + '-expire';
  this.config.ttl = (config.ttl || 86400)*1000;//one day
}
util.inherits(STORE_TTL, events.EventEmitter);

STORE_TTL.prototype.set = function(key,data,ttl,callback){
  var config = this.config;
  var that = this;
  if(_util.isFunction(ttl)){
    callback = ttl;
    ttl = config.ttl;
  }
  key = this.getNameSpace() + key;
  var saveData = {
    data:data,
    expire:_util.getTime + ttl
  }
  var setHandler = this.config.set || function(key,data,callback){
    that._store[key] = data;
    callback(null,saveData);
  }
  setHandler(key,JSON.stringify(saveData),function(err,data){
    that.emit('save',key,saveData);
    callback(err,data);
  })
} 
STORE_TTL.prototype.get = function(key,callback){
  var config = this.config;
  var that = this;
  key = this.getNameSpace() + key;
  var getHandler =  this.config.get || function(key,callback){
    callback(null,that._store[key]);
  }
  getHandler(key,function(err,data){
    if(!err && data){
      data = JSON.parse(data);
      if(parseInt(data.expire) < _util.getTime()){
        that.emit('remove',key);
        callback(null,null);
      }else{
        callback(null,data.data);
      }
    }else{
      callback(err,null);
    }
  });
} 
STORE_TTL.prototype.remove = function(key,callback){
  var config = this.config;
  var that = this;
  key = this.getNameSpace() + key;
  if(!_util.isFunction(callback)){
    callback = noop;
  }
  var removeHandler =  this.config.remove || function(key,callback){
    var data = that._store[key];
    delete that._store[key];
    callback(null,data);
  }
  removeHandler(key,function(err,data){
    that.emit('clear',key);
    callback(err,data);
  });
}
STORE_TTL.prototype.getNameSpace = function(){
  return this.config.namespace;
} 
STORE_TTL.prototype.getExpireListPrefix = function(){
  return this.config.expireListPrefix;
}
STORE_TTL.prototype._clearTimeout = function(){

}
STORE_TTL.prototype._eventHandler = function(){
  var that = this;
  var config = this.config;
  this.on('save',function(key,saveData){
    if(_util.isFunction(config.set)){
      //todo
      var expireKey = that.getExpireListPrefix();
      config.get(expireKey,function(err,data){
        if(!err){
          if(data){
            data = JSON.parse(data);
            
          }else{
            data = {};
          }
          data[key] = saveData.expire;
          config.set(expireKey,JSON.stringify(data),noop);
        }
      })
    }
  });
  this.on('remove',function(key){
    that.remove(key,noop);
  })
  this.on('clear',function(key){
    if(_util.isFunction(config.remove)){
      //todo
      var expireKey = that.getExpireListPrefix();
      config.get(expireKey,function(err,data){
        if(!err && data){
          data = JSON.parse(data);
          delete data[key];
          config.set(expireKey,JSON.stringify(data),noop);
        }
      })
    }
  });
}
module.exports = STORE_TTL;