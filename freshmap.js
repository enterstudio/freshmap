// create the map object using the element passed
// to us. use sensible map options considering the 
// panning we'll be doing (zoom out!).
function FreshMap(mapelement) {
    var element = document.getElementById(mapelement);
    this.map = new google.maps.Map(element, {
        zoom : 4,
        center : this.getLocation(),
        mapTypeId: google.maps.MapTypeId.TERRAIN,
        disableDefaultUI: true
    });
    this.marker = null;
    this.infoWindow = null;
}

// pick a location at random and return it as a 2-element array
// one element being latitude and one being longitude. 
FreshMap.prototype.getLocation = function() {
    // mocked up location data. all in north america 
    // and europe to ensure smooth panning
    this.locations = [
        [43.67, -79.46], [53.46, -113.57], [49.29, -123.06], 
        [41.54, -83.60], [39.81, -105.13], [32.80, -96.69], 
        [30.33, -81.66], [53.35, -6.25],   [53.93, -1.68],  
        [51.47, -0.1],   [41.93, 12.46]
    ];
    var index  = Math.floor(Math.random() * this.locations.length);
    var coords = this.locations[index];
    return new google.maps.LatLng(coords[0], coords[1]);
}

// start the event loop. every 5 seconds we create a new marker
// and pan to it. the location of the marker will be based on 
// the result from getLocation. 
FreshMap.prototype.loop = function() {
    var location = this.getLocation();
    if (this.marker != null) {
        this.marker.setMap(null);
    }
    if (this.infoWindow != null) {
        this.infoWindow.close();
    }
    this.marker = new google.maps.Marker({
        position: location,
        icon: 'freshlogo.png',
        map: this.map,
        title: 'Marker! Woo!'
    });
    this.infoWindow = new google.maps.InfoWindow({
       content: '<div class="eventInfo"><p>Someone in Western ' +
        'Australia, Australia tracked their time.</p></div>',
       maxWidth: 300
    });
    this.infoWindow.open(this.map, this.marker);
    this.map.panTo(location);
    var c = this;
    setTimeout(function() { 
        c.loop(); 
    }, 5000);
}