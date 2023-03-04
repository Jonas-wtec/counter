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

# Download motionTicks from all locations into motionTickRaw
motionTicksRaw = downloadData('motionTicks')

# Request user input on which Location(s) should be inspected
idxLocation = input(f'Please select location index to be analyzed (Press enter for all locations): {locations} ')
try:
    idxLocation = int(idxLocation)
    print(f'Generating output file for location "{locations[idxLocation]}"')
    data = [x for x in dataRaw if 'location' in x and x['location'] == locations[idxLocation]]
    motionTicks = [x for x in motionTicksRaw if 'location' in x and x['location'] == locations[idxLocation]]
except:
    print(f'Generating output file for all locations')
    data = [x for x in dataRaw if 'location' in x]
    motionTicks = motionTicksRaw

# Add unix timestamp to data dump
outputData = [dict(item, unix=time.mktime(parser.parse(item['time']).timetuple())) for item in data]
outputMotionTicks = [dict(item, unix=time.mktime(parser.parse(item['time']).timetuple())) for item in motionTicks]

# Write location(s) count data to csv file
with open(f'output_count_{str(time.time()).replace(".","_")}.csv', "w", newline="") as f: 
    title = "unix,time,count,location,_id,__v".split(",")  
    cw = csv.DictWriter(f, title, delimiter=',', quotechar='|', quoting=csv.QUOTE_MINIMAL)
    cw.writeheader()
    cw.writerows(outputData)


# Write location(s) motionRaw data to csv file
with open(f'output_motionTicks_{str(time.time()).replace(".","_")}.csv', "w", newline="") as f: 
    title = "unix,time,serialNum,location,_id,__v".split(",")  
    cw = csv.DictWriter(f, title, delimiter=',', quotechar='|', quoting=csv.QUOTE_MINIMAL)
    cw.writeheader()
    cw.writerows(outputMotionTicks)




""" print(data[0]['time'])
print(parser.parse(data[0]['time']))
print(time.mktime(parser.parse(data[0]['time']).timetuple())) """