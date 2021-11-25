import requests, re
a = requests.get('https://anti-ad.net/surge2.txt')
a = a.text
a = re.sub("\B\.", "  - DOMAIN-SUFFIX,",a)
print(a)

