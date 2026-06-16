/**
 * Approximate city-centre coordinates for every Indian city in the app.
 * Used as a fallback when a trip was saved without fromCoords/toCoords.
 */
const CITY_COORDS = {
  mumbai:         [19.0760, 72.8777],
  pune:           [18.5204, 73.8567],
  nagpur:         [21.1458, 79.0882],
  thane:          [19.2183, 72.9781],
  delhi:          [28.6139, 77.2090],
  noida:          [28.5355, 77.3910],
  gurgaon:        [28.4595, 77.0266],
  gurugram:       [28.4595, 77.0266],
  bangalore:      [12.9716, 77.5946],
  bengaluru:      [12.9716, 77.5946],
  chennai:        [13.0827, 80.2707],
  hyderabad:      [17.3850, 78.4867],
  kolkata:        [22.5726, 88.3639],
  ahmedabad:      [23.0225, 72.5714],
  jaipur:         [26.9124, 75.7873],
  lucknow:        [26.8467, 80.9462],
  kanpur:         [26.4499, 80.3319],
  meerut:         [28.9845, 77.7064],
  agra:           [27.1767, 78.0081],
  kochi:          [9.9312,  76.2673],
  visakhapatnam:  [17.6868, 83.2185],
  vizag:          [17.6868, 83.2185],
  chandigarh:     [30.7333, 76.7794],
  ludhiana:       [30.9010, 75.8573],
  bhubaneswar:    [20.2961, 85.8245],
  coimbatore:     [11.0168, 76.9558],
  indore:         [22.7196, 75.8577],
  vadodara:       [22.3072, 73.1812],
  baroda:         [22.3072, 73.1812],
  trivandrum:     [8.5241,  76.9366],
  thiruvananthapuram: [8.5241, 76.9366],
  surat:          [21.1702, 72.8311],
  rajkot:         [22.3039, 70.8022],
}

/**
 * Given a location string like "Andheri, Mumbai" or "Mumbai, Maharashtra"
 * return [lat, lng] if we recognise any city name in the string, else null.
 */
export function coordsFromCityString(locationStr) {
  if (!locationStr) return null
  const lower = locationStr.toLowerCase()

  // Try each known city name against the full string
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (lower.includes(city)) return coords
  }
  return null
}
