Currently this app reads data from outbound.json and return.json and passes it to the departureselection component

Similarly it read data from testdata.json and passes it to the options component

However, in globalOutbound.json and globalReturn.json I have created a new data structure which embeds both of these data elements, such that the addons optuons will be contingent upon the departure selected. You can extract the data that's needed by the departureselection and options components by using the following code which you should save into dataservice.js:

/\*\*

- dataService.js
-
- This module provides two functions for extracting data from the globaldata.json file:
-
- 1. getOutboundDepartures()
-      - Returns an object in the same format as outbound.json, i.e.:
-          {
-             outboundServices: [ ... ]
-          }
-        Each service in the array contains:
-          - service_id
-          - can_accept
-          - resource_name
-          - route_name
-          - departing_from
-          - travelling_to
-          - departure_time
-          - arrival_time
-          - departure_date
-          - total_cost
-          - pats  (an empty array if not provided)
-          - flags (as provided in the global data)
-
- 2. getOptionsForService(serviceId)
-      - Given a service id (matching one of the outbound departures), returns an object in the same format as options.json, i.e.:
-          {
-             pageData: {
-                parent_product: ...,
-                variations: [ ... ]
-             }
-          }
-        The options are taken from the matching service's "options" property.
-
- USAGE:
-
- // Import the functions where needed:
- import { getOutboundDepartures, getOptionsForService } from './dataService';
-
- // To get the list of outbound departures:
- const outbound = getOutboundDepartures();
- // outbound.outboundServices is an array of outbound services.
-
- // To get the options for a specific outbound service (say with service_id = 1):
- const options = getOptionsForService(1);
- // options.pageData contains the options data (parent_product and variations).
-
- NOTE:
- - This file assumes that globaldata.json is located in the root directory.
- - Depending on your Vite configuration you may import JSON files directly.
- - If your JSON file is not imported correctly, you might need to move it to the "public" folder and use fetch.
    \*/

// Import the global data. Adjust the path as needed.
// (If globaldata.json is in the root, the leading slash should work with Vite.)
import globalData from '/globaldata.json';

/\*\*

- Returns an object containing outbound departures in the same structure as outbound.json.
-
- @returns {object} An object with a property "outboundServices" which is an array of outbound departure objects.
  \*/
  export function getOutboundDepartures() {
  // Check if the data exists and has the expected structure
  if (!globalData?.status === 'ok' || !Array.isArray(globalData?.data)) {
  console.error('Invalid data structure in globaldata.json');
  return { outboundServices: [] };
  }

// Map each service in globalData.data into the expected outbound format.
const outboundServices = globalData.data.map(service => ({
service_id: service.service_id,
can_accept: service.can_accept ? "yes" : "no",
resource_name: service.resource_name,
route_name: service.route_name,
departing_from: service.departing_from,
travelling_to: service.travelling_to,
departure_time: service.departure_time,
arrival_time: service.arrival_time,
departure_date: service.departure_date,
total_cost: service.total_cost,
// The original outbound.json includes a "pats" array; if it is not in globalData, default to an empty array.
pats: service.pats || [],
// Filter out any flags that have null values for both name and url
flags: (service.flags || []).filter(flag => flag.flag_name || flag.flag_url)
}));

return { outboundServices };
}

/\*\*

- Returns an object containing options for the outbound service with the given id,
- in the same structure as options.json.
-
- @param {number} serviceId - The service id for which to retrieve the options.
- @returns {object|null} An object with a property "pageData" (the options) if found,
-                        or null if no service with that id exists.
  \*/
  export function getOptionsForService(serviceId) {
  // Check if the data exists and has the expected structure
  if (!globalData?.status === 'ok' || !Array.isArray(globalData?.data)) {
  console.error('Invalid data structure in globaldata.json');
  return null;
  }

// Find the service in globalData.data that matches the provided serviceId.
const service = globalData.data.find(s => s.service_id === serviceId);
if (!service) {
console.error(`No service found with service_id: ${serviceId}`);
return null;
}

// Create a new options object with parent_product set to the service's resource_name
const options = {
...service.options,
parent_product: service.resource_name
};

return { pageData: options };
}

What to do:

Extract departure data from the outbound and return files

Contingent upon the departure selected, extract the options data when loading the options page and pass that data

Make sure that each time either component is loaded on screen it is loading with the relevant data for the user's current selections, and not cached data from earlier in the session
