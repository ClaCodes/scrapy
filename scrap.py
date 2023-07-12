import requests


for i in range(1, 100000):
    response = requests.get('http://zwilch.ch/api/v2/schwingfeste/' + str(i))

    print(response.status_code)
    print(response.content)
