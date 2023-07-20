import requests
import json
import time


def look_up_fest(schwinger, fest):
    query = str(schwinger) + '/' + str(fest)
    if query not in results:
        blocked = True
        while blocked:
            response = requests.get(
                'https://zwilch.ch/api/v2/ergebnisse/schwingfest/' + query,
                timeout=3)
            print(f"query={query}, status={response.status_code}")
            blocked = (response.status_code != 200)
            if blocked:
                time.sleep(3)
        results[query] = response.json()
        # print(results[query])
    return results[query]


def look_up_feste(schwinger):
    query = str(schwinger)
    if query not in requests_cache_feste:
        blocked = True
        while blocked:
            response = requests.get('http://zwilch.ch/api/v2/schwingfeste/' + query, timeout=3)
            print(f"query={query}, status={response.status_code}")
            blocked = (response.status_code != 200)
            if blocked:
                time.sleep(3)
        requests_cache_feste[query] = response.json()
    return requests_cache_feste[query]


def walk_all():
    empty = False
    current = 1
    while(not empty):
        feste = look_up_feste(current)
        # print(f"feste = {feste}")
        for i in feste:
            look_up_fest(current, i["_id"])
        current += 1
        empty = len(feste) == 0


if __name__ == "__main__":
    try:
        with open("results.json", "r") as f:
            results = json.load(f)
    except FileNotFoundError:
        results = {}

    try:
        with open("request_cache_feste.json", "r") as f:
            requests_cache_feste = json.load(f)
    except FileNotFoundError:
        requests_cache_feste = {}

    try:
        walk_all()
    finally:
        with open("request_cache_feste.json", "w") as f:
            json.dump(requests_cache_feste, f, indent=4)
        with open("results.json", "w") as f:
            json.dump(results, f, indent=4)
