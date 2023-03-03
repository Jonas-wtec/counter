import urllib.request
import json
import csv

with urllib.request.urlopen("http://192.168.31.80:3000/counts") as url:
    data = json.loads(s=url.read())

    json_formatted_str = json.dumps(data, indent=2)

# Find dictionary matching value in list
output_dict = [
    x for x in data if 'location' in x and x['location'] == 'Marketing Raum EG']

# printing result
print("The filtered dictionary value is : " + str(output_dict))

with open("output.csv", "w", newline="") as f: 
    title = "_id,count,location,time,__v".split(",")  
    cw = csv.DictWriter(f, title, delimiter=',', quotechar='|', quoting=csv.QUOTE_MINIMAL)
    cw.writeheader()
    cw.writerows(output_dict)
