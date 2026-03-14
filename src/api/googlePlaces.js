// NOTE: this file now uses free OpenStreetMap / Overpass data,
// no API key or paid plan needed.

const MUMBAI_COORDS = {
  lat: 19.076,
  lng: 72.8777,
};

const haversineDistanceKm = (lat1, lng1, lat2, lng2) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const getEffectiveLocation = async () => {
  if (typeof window === 'undefined' || !('geolocation' in navigator)) {
    return { ...MUMBAI_COORDS, isFallback: true };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          isFallback: false,
        });
      },
      () => {
        resolve({ ...MUMBAI_COORDS, isFallback: true });
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000,
      },
    );
  });
};

const buildOverpassQuery = ({ lat, lng, radiusMeters, sport }) => {
  const radius = radiusMeters || 5000;

  const sportsTags =
    sport && sport !== 'all'
      ? `["sport"="${sport}"]`
      : '["leisure"="pitch"]';

  return `
    [out:json][timeout:25];
    (
      node${sportsTags}(around:${radius},${lat},${lng});
      way${sportsTags}(around:${radius},${lat},${lng});
      relation${sportsTags}(around:${radius},${lat},${lng});
    );
    out center 50;
  `;
};

export const fetchNearbySportsGrounds = async ({
  lat,
  lng,
  sport = 'all',
  radiusMeters = 5000,
} = {}) => {
  const location = lat != null && lng != null ? { lat, lng } : MUMBAI_COORDS;

  const body = new URLSearchParams({
    data: buildOverpassQuery({
      lat: location.lat,
      lng: location.lng,
      radiusMeters,
      sport,
    }),
  });

  const resp = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: body.toString(),
  });

  if (!resp.ok) {
    throw new Error('Failed to fetch from Overpass (OpenStreetMap)');
  }

  const data = await resp.json();
  const elements = Array.isArray(data.elements) ? data.elements : [];

  const results = elements
    .map((el, index) => {
      const coords = el.type === 'node'
        ? { lat: el.lat, lng: el.lon }
        : el.center
          ? { lat: el.center.lat, lng: el.center.lon }
          : null;

      if (!coords) return null;

      const distanceKm = haversineDistanceKm(
        location.lat,
        location.lng,
        coords.lat,
        coords.lng,
      );

      const tags = el.tags || {};
      const name = tags.name || 'Unnamed ground';
      const sportTag = tags.sport || sport || 'other';
      const address =
        tags['addr:full'] ||
        [tags['addr:street'], tags['addr:city']]
          .filter(Boolean)
          .join(', ');

      return {
        id: el.id?.toString() || `osm-${index}`,
        name,
        address: address || tags.description || null,
        rating: 0,
        user_ratings_total: 0,
        location: coords,
        sport_type: sportTag,
        distance_km: distanceKm,
        price_per_hour: 0,
        raw_place: el,
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0));

  return results;
};


