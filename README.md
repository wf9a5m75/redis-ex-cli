# redis-ex-cli

Redix-ex-cli is a utility command which manipulates multiple keys of Redis Database through command-line-interface.

You can pick up the keys with regular expression, rename / copy / delete them, or export the keys.
Also set / delete one hash value for multiple keys at one time.


## Install
```bash
$> npm -g install redis-ex-cli
```

## How to use this?

At the first, you need to connect to your redis server.

```bash
$> redis-ex-cli

(disconnect)>> server localhost

localhost >>
```

Then select database index if you need.
```bash
localhost >> select 1
```

After that, list up the keys that you want.
```bash
localhost >> keys *
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

localhost >> keys del logs:2014:1121:*
[del]logs:2014:1121:10-42-31
[del]logs:2014:1121:10-42-34
[del]logs:2014:1121:10-42-35

Do you want to delete [N]/Y
```

## Commands
- [quit](#quit)
- [server :host](#server-host)
- [server :host :port](#server-host-port)
- [select :index](#select-index)
- [keys :regexp](#keys-regex)
- [keys export :regexp](#keys-export-regexp)
- [keys export :regexp :filename](#keys-export-regexp-filename)
- [keys del :regexp](#keys-del-regexp)
- [keys copy :regexp :newkey](#keys-copy-regexp-replace)
- [keys rename :regexp :replace](#keys-rename-regexp-replace)
- [keys hset :regexp :field :value](#keys-hset-regexp-field-value)
- [keys hdel :regexp :field](#keys-hdel-regexp-field)
- [keys hsearch :regexp :field :value](#keys-hsearch-regexp-field-value)

### quit
Quit from redis-ex-cli

### server :host
Connect to the `:host` server with port 6379

```bash
(disconnect) >> server localhost
localhost >>
```

### server :host :port
Connect to the `:host` server with the specified `:port`

```bash
(disconnect) >> server myhost.com 123456
myhost.com >>
```

### select :index
Select the DB with having the specified zero-based numeric index. New connections always use DB 0

```bash
localhost >> select 1
select DB index : 1
```

### keys :regexp
`keys` lists up the keys matched with `:regexp`.

```bash
localhost >> keys logs:2015:0404:1[7-8].*
logs:2015:0404:17-40-42
logs:2015:0404:17-41-55
logs:2015:0404:17-56-05
logs:2015:0404:18-01-36
logs:2015:0404:18-06-26
logs:2015:0404:18-11-17
logs:2015:0404:18-12-25
logs:2015:0404:18-13-17
logs:2015:0404:18-15-07
```

### keys export :regexp
`keys export` generates the command sets that reproduce the keys matched with `:regexp`.

```bash
localhost >> keys export logs:2015:0404:1[7-8].*
```

### keys export :regexp :filename
You may want to save paticular key-value pairs to a file.
You need to specify `:filename` as absolute path.

```bash
localhost >> keys export logs:2015:0404:1[7-8].* /Users/me/Desktop/20150404-from17to18.log
```

### keys del :regexp
`keys del` deletes the keys that matched with `:regexp`.

```bash
localhost >> keys del logs:2015:0404:1[7-8].*


[del]logs:2015:0404:17-40-42
[del]logs:2015:0404:17-41-55
[del]logs:2015:0404:17-56-05
[del]logs:2015:0404:18-01-36
[del]logs:2015:0404:18-06-26
[del]logs:2015:0404:18-11-17
[del]logs:2015:0404:18-12-25
[del]logs:2015:0404:18-13-17
[del]logs:2015:0404:18-15-07

Do you want to delete [N]/Y
```

### keys copy :regexp :newkey
`keys copy` copies the keys that matched with `:regexp` to `:newkey`
You can use regular expression to the `:newkey` value with grouping.

```bash
localhost >> keys copy logs:2015:04* logs:test:

[copy]logs:2015:0401:06-59-46 --> logs:test:01:06-59-46
[copy]logs:2015:0406:07-09-22 --> logs:test:06:07-09-22
[copy]logs:2015:0401:07-11-43 --> logs:test:01:07-11-43
[copy]logs:2015:0401:07-12-36 --> logs:test:01:07-12-36

Do you want to copy [N]/Y
```

### keys rename :regexp :replace
`keys rename` renames the keys that matched with `:regexp` to `:replace`
You can use regular expression to the `:replace` value with grouping.

```bash
localhost >> keys rename logs:2014:04(.*) logs:2015:05$1:test

[rename]logs:2014:0401:06-59-46 --> logs:2015:0501:06-59-46:test
[rename]logs:2014:0401:07-11-43 --> logs:2015:0501:07-11-43:test
[rename]logs:2014:0401:07-12-36 --> logs:2015:0501:07-12-36:test

Do you want to rename [N]/Y 
```

### keys hset :regexp :field :value
`keys hset` sets the `:value` to the `:field` that matched with `:regexp`

```bash
localhost >>keys hset logs:2015:04* isTest true

[hset]logs:2015:0401:06-59-46
[hset]logs:2015:0401:07-01-02
[hset]logs:2015:0401:07-11-43
[hset]logs:2015:0401:07-12-36

Do you want to set values [N]/Y 
```

### keys hdel :regexp :field
`keys hdel` deletes the `:field` from the keys that matched with `:regexp`.

```bash
localhost >>keys hdel logs:* isTest

[hdel]logs:2015:0401:06-59-46
[hdel]logs:2015:0401:07-01-02
[hdel]logs:2015:0401:07-11-43
[hdel]logs:2015:0401:07-12-36

Do you want to delete [N]/Y 
```

### keys hsearch :regexp :field :value
`keys hsearch` find the keys that have the `:field` contains `:value`.
You can specify the `:value` with regular expression.

For example, if you want to find the keys that the phone number stated with **310-**:

```bash
localhost >>keys hsearch logs:2015:04* sendto ^310\-.*

logs:2015:0401:13-45-17
logs:2015:0401:15-02-59
logs:2015:0402:14-09-03
logs:2015:0404:15-20-56
logs:2015:0404:17-41-55
logs:2015:0404:17-56-05
logs:2015:0405:11-32-43
logs:2015:0405:14-50-55
logs:2015:0405:14-54-07
```
