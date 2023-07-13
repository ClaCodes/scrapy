import requests
import datetime
import json

# found using search_max.py
max = 14078

start = datetime.datetime.now()

responses = {}
for i in range(1, max + 1):
    blocked = True
    while(blocked):
        response = requests.get('http://zwilch.ch/api/v2/schwingfeste/' + str(i))
        now = datetime.datetime.now()
        elapsed = now - start
        percentage = i / max
        eta = (elapsed / percentage) - elapsed
        print(f"iteration={i:6}/{max:6}, ETA={eta}, status={response.status_code:3}, time={now}")
        blocked = (response.status_code != 200)

    responses[i] = response.json()

with open("dump", "w") as f:
    json.dump(responses, f)

