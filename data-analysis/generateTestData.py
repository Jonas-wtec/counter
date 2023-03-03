import urllib.request
import json
import csv
import time
from dateutil import parser

def downloadData(endpoint):
    with urllib.request.urlopen(f'http://192.168.31.80:3000/{endpoint}') as url:
        return json.loads(s=url.read())

# Download counts from all locations into variable data
dataRaw = downloadData('counts')

# Download location list into variable locations
locationsRaw = downloadData('locations')
locations = [x['location'] for x in locationsRaw]

# Request user input on which Location(s) should be inspected
idxLocation = input(f'Please select location index to be analyzed (Press enter for all locations): {locations} ')
try:
    idxLocation = int(idxLocation)
    print(f'Generating output file for location "{locations[idxLocation]}"')
    data = [x for x in dataRaw if 'location' in x and x['location'] == locations[idxLocation]]
except:
    print(f'Generating output file for all locations')
    data = [x for x in dataRaw if 'location' in x]

# Add unix timestamp to data dump
outputData = [dict(item, unix=time.mktime(parser.parse(item['time']).timetuple())) for item in data]

# Write location(s) count data to csv file
with open(f'{str(time.time()).replace(".","_")}_output.csv', "w", newline="") as f: 
    title = "unix,time,count,location,_id,__v".split(",")  
    cw = csv.DictWriter(f, title, delimiter=',', quotechar='|', quoting=csv.QUOTE_MINIMAL)
    cw.writeheader()
    cw.writerows(outputData)

""" print(data[0]['time'])
print(parser.parse(data[0]['time']))
print(time.mktime(parser.parse(data[0]['time']).timetuple())) """