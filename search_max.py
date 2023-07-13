import requests
import datetime

currentMin = 0
currentMax = 100000
current = currentMax

while(currentMin != currentMax - 1):
    response = requests.get('http://zwilch.ch/api/v2/schwingfeste/' + str(current))
    empty = (response.content == b'[]')

    status = f"current={current:6}, "\
        f"currentMin={currentMin:6}, ",\
        f"currentMax={currentMax:6}, ",\
        f"status={response.status_code:3}, ",\
        f"empty={empty:7}, "\
        f"time={datetime.datetime.now()}"

    print(status)

    if(empty):
        currentMax = current
    else:
        currentMin = current

    current = int((currentMax + currentMin) / 2)


response = requests.get('http://zwilch.ch/api/v2/schwingfeste/' + str(current))
empty = (response.content == b'[]')
print(f"current={current:6}, status={response.status_code:3}, ",
      f"empty={empty:7}, time={datetime.datetime.now()}")

response = requests.get('http://zwilch.ch/api/v2/schwingfeste/' + str(currentMax))
empty = (response.content == b'[]')
print(f"currentMax={currentMax:6}, status={response.status_code:3}, ",
      f"empty={empty:7}, time={datetime.datetime.now()}")

response = requests.get('http://zwilch.ch/api/v2/schwingfeste/' + str(currentMin))
empty = (response.content == b'[]')
print(f"currentMin={currentMin:6}, status={response.status_code:3}, ",
      f"empty={empty:7}, time={datetime.datetime.now()}")
