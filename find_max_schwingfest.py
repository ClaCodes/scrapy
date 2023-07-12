import requests

def get_max_schwingfest():
    current_max = 100_000
    current_min = 1
    current = current_max

    while current_min != current_max:
        response = requests.get(f"http://zwilch.ch/api/v2/schwingfeste/{current}")

        if response.status_code != 200:
            raise Exception(f"Error: Received status code {response.status_code}")

        is_empty = response.content == b"[]"

        if is_empty:
            current_max = current - 1
            current = (current_max + current_min) // 2
        else:
            current_min = current + 1
            current = (current_max + current_min) // 2

    return current

if __name__ == "__main__":
    print(get_max_schwingfest())
