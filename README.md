# redis-ex-cli

Redix-ex-cli is a utility command which manipulates multiple keys of Redis Database through command-line-interface.

You can pick up the keys with regular expression, rename / copy / delete them, or export the keys.
Also set / delete one hash value for multiple keys at one time.


## Install
```bash
$> npm -g install redis-ex-cli
```

## Quick Example
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
- server :host
- server :host :port
- select :index
- keys :regexp
- keys export :regexp
- keys export :regexp :filename
- keys del :regexp
- keys copy :regexp :replace
- keys rename :regexp :replace
- keys hset :regexp :field :value
- keys hdel :regexp :field
- keys hsearch :regexp :field :value


### Regular Expression example

```bash
localhost >> keys rename logs:2014:(.*?)_(.*) logs:$1:$2

[rename]logs:2014:1120_12-40-00 --> logs:2014:1120:12-40-00
[rename]logs:2014:1120_23-04-38 --> logs:2014:1120:23-04-38 
[rename]logs:2014:1121_10-42-31 --> logs:2014:1121:10-42-31
[rename]logs:2014:1121_10-42-34 --> logs:2014:1121:10-42-34
[rename]logs:2014:1121_10-42-35 --> logs:2014:1121:10-42-35

Do you want to rename [N]/Y 
```
