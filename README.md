## Rediska Key Distributor

  Port of PHP Rediska Key Distributor to Javascript

# Description



Using Rediska's Default Hashing Algorithm has restricted our use to PHP only.
We need to be able to Connect to the right instance of Redis Via Node using the same algorithm.


# Usage

Used With Node Redis Cluster

```
 this.keyDistributor = new KeyDistributor({
  servers : [
    host : '127.0.0.1',
    port : 6379
    ]
 });
```



# Install Instructions
`npm install`

#Running Tests

`grunt test`

#Using Library

`npm install node-rediska-hash`