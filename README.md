# redis-ex-cli

Redix-ex-cli helps you to manipulate keys of Redis Database through command-line-interface.

## Install
```bash
$> npm -g install redis-ex-cli
```

## Usage
```bash
$> redis-ex-cli
(disconnect) >> server localhost

localhost >> select 1
select DB index : 1

localhost >> keys *
SESSION:1vIXgUzvFGtts3zFAAAA
SESSION:2Cy5087yyEjkgdhDAAAF
SESSION:rGPYg2paEG9YtZZFAAAA
SYSTEM:OAUTH2
logs:2014:1120:12-40-00
logs:2014:1120:23-04-38
logs:2014:1121:10-42-31
logs:2014:1121:10-42-34
logs:2014:1121:10-42-35

localhost >> keys logs:2014:1121:*
logs:2014:1121:10-42-31
logs:2014:1121:10-42-34
logs:2014:1121:10-42-35

localhost >> keys del logs:2014:1121:*
[del] logs:2014:1121:10-42-31
[del] logs:2014:1121:10-42-34
[del] logs:2014:1121:10-42-35
Do you want to delete [N]/Y

localhost >> keys copy logs:2014:1121:* test:1121:
[copy]logs:2014:1121:10-42-31 --> test:1121:10-42-31
[copy]logs:2014:1121:23-44-01 --> test:1121:23-44-01
[copy]logs:2014:1121:10-42-35 --> test:1121:10-42-35
Do you want to copy [N]/Y 


localhost >> keys rename test:1121:* key2:
[rename]test:1121:10-42-31 --> key2:10-42-31
[rename]test:1121:23-44-01 --> key2:23-44-01
[rename]test:1121:10-42-35 --> key2:10-42-35
Do you want to rename [N]/Y

localhost >> keys hset key2:* isTest true
[hset]key2:10-42-31
[hset]key2:10-42-34
[hset]key2:10-42-35
Do you want to set values [N]/Y
```

##commands
- quit
- help
- server :host        Connect a redis server.
- server :host :port  Connect a redis server.
- select :index       Select the DB with having the specified zero-based numeric index. New connections always use DB 0
- keys :regexp        List keys up with regular expression
- keys export :regexp Export particular key-data.
- keys export :regexp :filename         Export particular key-data into the file.
- keys del :regexp    Delete multiple keys
- keys copy :regexp :replace      copy multiple keys
- keys rename :regexp :replace        rename multiple keys
- keys hset :regexp :field :value           set the value for multiple keys
- keys hdel :regexp :field    delete the field from multiple keys
- keys hsearch :regexp :field :value              Find keys that contains the field and the value

