# Rediska Key Distributor

  Port of PHP Rediska Key Distributor to Javascript

## Description

  Using Rediska's Default Hashing Algorithm has restricted our use to PHP only.
  We need to be able to Connect to the right instance of Redis Via Node using the same algorithm.

## Usage

Used With Node Redis Cluster

```
 npm install rediska-key-distributor

 this.keyDistributor = new KeyDistributor({
  servers : [
    host : '127.0.0.1',
    port : 6379
    ]
 });
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using grunt.

## Release History

- 1.0.0 Initial public release

## License

Licensed under the MIT license.

## Author

Chris Miller

CRC Adopted from http://www.webtoolkit.info/
KSort Adopted from https://github.com/kvz/phpjs