import json

import requests

def get_schwingfeste(base_url, delay_time, start=1):
    i = start
    data = []
    while i - start <= 100:
        response = requests.get(f"{base_url}/{i}")
        if response.status_code == 429:  # Rate limit reached
            print(f"Rate limit reached. Waiting for {delay_time} seconds.")
            # time.sleep(delay_time)
            continue
        elif response.status_code != 200:  # Any other error code
            print(f"Error: Received status code {response.status_code}")
            break
        schwingfeste = response.json()
        if not schwingfeste:  # Stop when an empty list is returned
            break
        data.append(schwingfeste)
        i += 1
        # time.sleep(0.5)
        print(f"Received data for {i} schwingfeste.")
    return data


def save_to_json(data, filename):
    with open(filename, 'w') as f:
        json.dump(data, f)


if __name__ == "__main__":
    base_url = "http://zwilch.ch/api/v2/schwingfeste"
    delay_time = 10
    data = get_schwingfeste(base_url, delay_time)
    save_to_json(data, "./data/schwingfeste.json")

    for i in range(1, 2):
        data = get_schwingfeste(base_url, delay_time, i)
        save_to_json(data, f"./data/schwingfeste_{i}.json")
