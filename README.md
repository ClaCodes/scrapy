# scrapy
Zwilch scraping

## Source data structure

* Schwinger = String
* Gegner = String
* Resultat = +/-/0
* Schwingfest = String
* Jahr = Int

## Data sources

* https://zwilch.ch/api/v2/schwingfeste/{schwinger_id}
* https://zwilch.ch/api/v2/ergebnisse/schwingfest/{schwinger_id}/{schwingfest_id}
* https://zwilch.ch/api/v2/schwinger/{schwinger_name}
* https://zwilch.ch/api/v2/paarungen/{schwinger_id_1}/{schwinger_id_2}

## Target data structure


## Open tasks:

* [ ] Script for diffing the stored data with the current data (from the API)
* [ ] Pipeline for automatic updates based on the diff executed by a cronjob as Github Action
* [ ] Simple UI for querying the data
* [ ] Extract and update scripts for Schwingfest (either reuse existing extract script in python or migrate to JS)
* [ ] Script to calculate and store elo scores for each Schwinger
* [ ] UI which allows to plot the elo scores over time and compare them to other Schwinger
