// create the map object using the element passed
// to us. use sensible map options considering the 
// panning we'll be doing (zoom out!).
function FreshMap(mapelement) {
    var element = document.getElementById(mapelement);
    this.geocoder = new google.maps.Geocoder();
    this.map = new google.maps.Map(element, {
        zoom: 3,
        center: new google.maps.LatLng(0, 0),
        mapTypeId: google.maps.MapTypeId.TERRAIN,
        disableDefaultUI: true,
        scrollwheel: false
    });
    this.marker = null;
    this.infoWindow = null;
}

// pick a location at random and return it as an address string.
FreshMap.prototype.getLocation = function() {
    // mocked up location data. 
    this.locations = [
        'Dublin, Ireland', 'Ontario, Canada', 'Washington, United States',
        'Georgia, United States', 'Wisconsin, United States',
        'Kansas, United States', 'Colorado, United States',
        'New Zealand', 'New South Wales, Australia', 'Singapore',
        'New York, United States', 'California, United States'
    ];
    return this.locations[Math.floor(Math.random() * this.locations.length)];
}

// reset marker and recenter map with the given latitude and longitude. 
// create an info window with information about the given location
FreshMap.prototype.createAndZoomToMarker = function(latlng, location) {
    if (this.marker != null) {
        this.marker.setMap(null);
    }
    this.marker = new google.maps.Marker({
        position: latlng,
        icon: 'freshlogo.png',
        map: this.map,
        title: 'Marker Title!'
    });
    if (this.infoWindow != null) 
        this.infoWindow.close();
    this.infoWindow = new google.maps.InfoWindow({
        content: '<div class="eventInfo"><p>Someone in ' + location + 
            ' tracked their time.</p></div>',
        maxWidth: 300
    });
    this.infoWindow.open(this.map, this.marker);
    this.map.panTo(latlng);
}

// start the event loop. every 5 seconds we create a new marker
// and pan to it. the location of the marker will be based on 
// the result from getLocation. 
FreshMap.prototype.loop = function() {
    var c = this;
    var location = this.getLocation();
    this.geocoder.geocode({
        'address' : location
    }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            c.createAndZoomToMarker(results[0].geometry.location, location)
        }
    });
    setTimeout(function() { 
        c.loop(); 
    }, 3000);
}