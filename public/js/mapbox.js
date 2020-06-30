/* eslint-disable */
console.log('Hello from the client side!');
//how tog et value from data-locations attributes from html
//.dataset.name_of_attributes(locations)
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoiY2FodmRhbmltaXQiLCJhIjoiY2tjMWZtd3hmMDR3bzJxbWlldHg5bWdhZyJ9.k3s6tWrQmWJPbSyquG0kgA';
//becaus eelement id is map so because of that here in container this map will show the defalut map already
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/cahvdanimit/ckc1fwluf00nl1itsv86z558n',
  scrollZoom: false,
  //   center: [-118.113491, 34.111745],
  //   zoom: 7,
  //   interactive: false,
});

const bounds = new mapboxgl.LngLatBounds();
//create marker
locations.forEach((loc) => {
  const el = document.createElement('div');
  el.className = 'marker';
  //add marker
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom',
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  //adding popup about location
  new mapboxgl.Popup({
    offset: 30,
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);
  //extends the map bounds to include the current locations
  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100,
  },
});
