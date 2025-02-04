// Import the global data files
import globalOutbound from '../globalOutbound.json';
import globalReturn from '../globalReturn.json';

/**
 * Returns an object containing outbound departures in the same structure as outbound.json.
 */
export function getOutboundDepartures() {
  if (!globalOutbound?.status === 'ok' || !Array.isArray(globalOutbound?.data)) {
    console.error('Invalid data structure in globalOutbound.json');
    return { outboundServices: [] };
  }

  const outboundServices = globalOutbound.data.map(service => ({
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
    pats: service.pats || [],
    flags: (service.flags || []).filter(flag => flag.flag_name || flag.flag_url)
  }));

  return { outboundServices };
}

/**
 * Returns an object containing return departures in the same structure as return.json.
 */
export function getReturnDepartures() {
  if (!globalReturn?.status === 'ok' || !Array.isArray(globalReturn?.data)) {
    console.error('Invalid data structure in globalReturn.json');
    return { returnServices: [] };
  }

  const returnServices = globalReturn.data.map(service => ({
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
    pats: service.pats || [],
    flags: (service.flags || []).filter(flag => flag.flag_name || flag.flag_url)
  }));

  return { returnServices };
}

/**
 * Returns options for a service from either outbound or return data based on the event type
 */
export function getOptionsForService(serviceId, isReturn = false) {
  const data = isReturn ? globalReturn : globalOutbound;

  if (!data?.status === 'ok' || !Array.isArray(data?.data)) {
    console.error('Invalid data structure in global data');
    return null;
  }

  const service = data.data.find(s => s.service_id === serviceId);
  if (!service) {
    console.error(`No service found with service_id: ${serviceId}`);
    return null;
  }

  return {
    pageData: {
      ...service.options,
      parent_product: service.resource_name
    }
  };
}