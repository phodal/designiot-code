import urllib2,json
results = urllib2.urlopen('http://192.168.168.84/api.json').read()
json.loads(results)['led']