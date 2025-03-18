import requests
import string
import json


def store_names(n_list):
    for j in n_list:
        s_name = j["value"]
        s_id = j["data"]["_id"]
        if (s_names[s_id] is None):
            print(f"s_name={s_name}, s_id={s_id}")
            s_names[s_id] = s_name
        else:
            if(s_names[s_id] != s_name):
                raise("name mismatch")


def look_up(query):
    query = query.lower()
    if query not in requests_cache:
        blocked = True
        while blocked:
            response = requests.get('http://zwilch.ch/api/v2/schwinger/' + query)
            print(f"query={query}, status={response.status_code}")
            blocked = (response.status_code != 200)
        requests_cache[query] = response.json()
    return requests_cache[query]


def depth_first(query):
    for c in string.ascii_lowercase:
        n_list = look_up(query + c)["suggestions"]
        store_names(n_list)
        if len(n_list) >= 15:
            depth_first(query + c)
            depth_first(query + ' ')


def breadth_first(query, max_depth):
    query_queue = [c for c in string.ascii_lowercase]
    try:
        while True:
            next_query = query_queue.pop(0)
            n_list = look_up(next_query)["suggestions"]
            print(f"next_query={next_query}, len(query_queue)={len(query_queue)}")
            store_names(n_list)
            if len(n_list) >= 15 and len(next_query) < max_depth:
                for c in string.ascii_lowercase:
                    query_queue.append(next_query + c)
                query_queue.append(next_query + " ")
    except IndexError:
        return


max = 14090
# TODO why?
max *= 2


try:
    with open("names.json", "r") as f:
        s_names = json.load(f)
except FileNotFoundError:
    s_names = [None for _ in range(0, max)]

try:
    with open("request_cache.json", "r") as f:
        requests_cache = json.load(f)
except FileNotFoundError:
    requests_cache = {}

try:
    # depth_first("")
    breadth_first("", 3)
finally:
    with open("request_cache.json", "w") as f:
        json.dump(requests_cache, f, indent=4)
    with open("names.json", "w") as f:
        json.dump(s_names, f, indent=4)
