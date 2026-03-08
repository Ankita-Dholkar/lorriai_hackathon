from geopy.distance import geodesic

def verify_gps(delivery_lat, delivery_lon, carrier_lat, carrier_lon):

    delivery_location = (delivery_lat, delivery_lon)
    carrier_location = (carrier_lat, carrier_lon)

    distance = geodesic(delivery_location, carrier_location).meters

    if distance < 200:
        return {
            "gps_verification": "SUCCESS",
            "distance_meters": distance
        }
    else:
        return {
            "gps_verification": "FAILED",
            "distance_meters": distance
        }