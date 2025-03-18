import requests
import string
import json

max = 14090
# TODO why?
max *= 2

s_names = [None for _ in range(0, max)]

req = {}


def look_up(query):
    if query.lower() in req:
        return req[query.lower()]
    blocked = True
    while blocked:
        response = requests.get('http://zwilch.ch/api/v2/schwinger/' + query)
        print(f"query={query}, status={response.status_code}")
        blocked = (response.status_code != 200)

    n_list = response.json()["suggestions"]

    for j in n_list:
        s_name = j["value"]
        s_id = j["data"]["_id"]
        if (s_names[s_id] is None):
            print(f"s_name={s_name}, s_id={s_id}")
            s_names[s_id] = s_name
        else:
            if(s_names[s_id] != s_name):
                raise("name mismatch")

    req[query.lower()] = len(n_list)
    return len(n_list)


chars = [' ']
for s in string.ascii_lowercase:
    chars.append(s)


def find_next(i):
    previous = s_names[i - 1]
    if previous is None:
        return
    print(f"finding next at {i} for {previous}")
    j = 1
    while True:
        next_query = previous[:-j]
        if next_query == "":
            break
        n = look_up(previous[:-j])
        if s_names[i] is not None:
            return
        if n >= 15:
            for c in reversed(chars):
                n = look_up(previous[:-j] + c)
                if s_names[i] is not None:
                    return
        j += 1


look_up("a")
for i in range(1, max):
    if s_names[i] is None:
        print(f"find at {i}")
        find_next(i)
    else:
        print(f"already know at {i} {s_names[i]}")


with open("s_names", "w") as f:
    json.dump(s_names, f)
