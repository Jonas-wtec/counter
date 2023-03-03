import urllib.request
import json
import csv
import time
import datetime

with urllib.request.urlopen("http://192.168.31.80:3000/counts") as url:
    data = json.loads(s=url.read())

with urllib.request.urlopen("http://192.168.31.80:3000/locations") as url:
    locations = json.loads(s=url.read())
    locations_formatted = [x['location'] for x in locations]

locationToBeAnalyzed = input(f'Please select location indices to be analyzed (Press enter for all locations): {locations_formatted} ')

print (locations[0])

try:
    intLocationToBeAnalyzed = int(locationToBeAnalyzed)
    print(f'Generating output file for location "{locations_formatted[intLocationToBeAnalyzed]}"')
    output_dict = [x for x in data if 'location' in x and x['location'] == locations_formatted[intLocationToBeAnalyzed]]
except:
    print(f'Generating output file for all locations')
    output_dict = [x for x in data if 'location' in x]

with open(f'{str(time.time()).replace(".","_")}_output.csv', "w", newline="") as f: 
    title = "time,count,location,_id,__v".split(",")  
    cw = csv.DictWriter(f, title, delimiter=',', quotechar='|', quoting=csv.QUOTE_MINIMAL)
    cw.writeheader()
    cw.writerows(output_dict)

# printing result
# print("The filtered dictionary value is : " + str(output_dict))