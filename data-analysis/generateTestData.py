import urllib.request
import json
import csv

with urllib.request.urlopen("http://192.168.31.80:3000/counts") as url:
    data = json.loads(s=url.read())

with urllib.request.urlopen("http://192.168.31.80:3000/locations") as url:
    locations = json.loads(s=url.read())
    locations_formatted = [x['location'] for x in locations]

locationToBeAnalyzed = int(input(f'Please select Location indices to be analyzed: {locations_formatted} '))
output_dict = [x for x in data if 'location' in x and x['location'] == locations_formatted[locationToBeAnalyzed]]

with open("output.csv", "w", newline="") as f: 
    title = "time,count,location,_id,__v".split(",")  
    cw = csv.DictWriter(f, title, delimiter=',', quotechar='|', quoting=csv.QUOTE_MINIMAL)
    cw.writeheader()
    cw.writerows(output_dict)

# printing result
# print("The filtered dictionary value is : " + str(output_dict))