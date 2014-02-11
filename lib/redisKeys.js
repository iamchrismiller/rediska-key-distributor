/**
 * Redis Keys
 * @type {{shardable: string[], unshardable: string[]}}
 */
module.exports = {

  shardable : [
    "append", "bitcount", "blpop", "brpop", "debug object", "decr", "decrby", "del", "dump", "exists", "expire", "expireat",
    "get", "getbit", "getrange", "getset", "hdel", "hexists", "hget", "hgetall", "hincrby", "hincrbyfloat", "hkeys", "hlen",
    "hmget", "hmset", "hset", "hsetnx", "hvals", "incr", "incrby", "incrbyfloat", "lindex", "linsert", "llen", "lpop", "lpush",
    "lpushx", "lrange", "lrem", "lset", "ltrim", "mget", "move", "persist", "pexpire", "pexpireat", "psetex", "pttl", "rename",
    "renamenx", "restore", "rpop", "rpush", "rpushx", "sadd", "scard", "sdiff", "set", "setbit", "setex", "setnx", "setrange",
    "sinter", "sismember", "smembers", "sort", "spop", "srandmember", "srem", "strlen", "sunion", "ttl", "type", "watch",
    "zadd", "zcard", "zcount", "zincrby", "zrange", "zrangebyscore", "zrank", "zrem", "zremrangebyrank", "zremrangebyscore",
    "zrevrange", "zrevrangebyscore", "zrevrank", "zscore"
  ],

  unshardable : [
    "auth", "bgrewriteaof", "bgsave", "bitop", "brpoplpush", "client kill", "client list", "client getname", "client setname",
    "config get", "config set", "config resetstat", "dbsize", "debug segfault", "discard", "echo", "eval", "evalsha", "exec",
    "flushall", "flushdb", "info", "keys", "lastsave", "migrate", "monitor", "mset", "msetnx", "multi", "object", "ping",
    "psubscribe", "publish", "punsubscribe", "quit", "randomkey", "rpoplpush", "save", "script exists", "script flush",
    "script kill", "script load", "sdiffstore", "select",  "shutdown", "sinterstore", "slaveof", "slowlog", "smove", "subscribe",
    "sunionstore", "sync", "time", "unsubscribe", "unwatch", "zinterstore", "zunionstore"
  ]

};