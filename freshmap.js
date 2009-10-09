// shamelessly copy pasta'd from freshbooks.com
Date.prototype.setISO8601 = function(dString){
    var regexp = /(\d\d\d\d)(-)?(\d\d)(-)?(\d\d)(T)?(\d\d)(:)?(\d\d)(:)?(\d\d)(\.\d+)?(Z|([+-])(\d\d)(:)?(\d\d))/;
    var d = dString.match(regexp);
    var offset = 0;

    this.setUTCDate(1);
    this.setUTCFullYear(parseInt(d[1],10));
    this.setUTCMonth(parseInt(d[3],10) - 1);
    this.setUTCDate(parseInt(d[5],10));
    this.setUTCHours(parseInt(d[7],10));
    this.setUTCMinutes(parseInt(d[9],10));
    this.setUTCSeconds(parseInt(d[11],10));

    if (d[12])
        this.setUTCMilliseconds(parseFloat(d[12]) * 1000); 
    else
        this.setUTCMilliseconds(0);
    if (d[13] != 'Z') {
        offset = (d[15] * 60) + parseInt(d[17],10);
        offset *= ((d[14] == '-') ? -1 : 1);
        this.setTime(this.getTime() - offset * 60 * 1000);
    }
    return this;
};


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
    this.events = [];
    this.fetchEvents();
};

// Try to extract the location string from the event description
FreshMap.prototype.getLocationFromDescription = function(description) {
    var start = "someone in ".length; 
    var tokens = [
        'tracked', 'sent a', 'created a', 'logged', 'got'
    ];
    for (var i = 0; i < tokens.length; i++) {
        var tokenIndex = description.indexOf(tokens[i]);
        if (tokenIndex > -1) {
            return description.substring(start, tokenIndex);
        }
    }
    /* unknown event description, log it. */
    console.log("WARN: Unknown event: " + description);
    return null;
};

// Given an event object, build a string representation in the form 
// 'x second(s) ago, someone did something'
FreshMap.prototype.formatTimestampedEvent = function(event) {
    var now = new Date();
    var eventTimestamp = new Date();
    eventTimestamp.setISO8601(event['timestamp']);

    var seconds = Math.ceil(
        (now.getTime() - eventTimestamp.getTime()) / 1000
    );

    if (seconds < 1) {
        // Someone's clock is out of synch -- fudge it.
        return "A few seconds ago, " + event['description'];
    } else if (seconds == 1) {
    	return "1 second ago, " + event['description'];
    } else if (seconds < 60) {
    	return seconds + " seconds ago, " + event['description'];
    } else {
    	return ""; // stale event.
    }
};

// Refresh the events queue.
FreshMap.prototype.fetchEvents = function() {
    var c = this;
    $.getJSON('/recent-events', function(data) {
        c.events = data;
    });
};

// Get the next event from the queue, refreshing if needed.
FreshMap.prototype.nextEvent = function() {
    if (this.events.length < 2) {
        this.fetchEvents();
    }
    if (this.events.length > 0) 
        return this.events.shift();
    return null;
};

// pull the next event out of the event queue and cut it up 
// into a location (i.e. Toronto, Ontario) and a description
// (i.e. 32 Seconds ago someone in Toronto, Ontario did 
// something). 
FreshMap.prototype.getEvent = function() {
    var event = this.nextEvent();
    if (event == null) {
        return null;
    }
    var description = this.formatTimestampedEvent(event);
    var location = this.getLocationFromDescription(event['description']);
    return {
        'location'    : location,
        'description' : description
    }
};

// reset marker and recenter map with the given latitude and 
// longitude. create an info window with the event description.
FreshMap.prototype.createMarker = function(latlng, description) {
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
        content: '<div class="eventInfo"><p>' + description + '</p></div>',
        maxWidth: 300
    });
    this.infoWindow.open(this.map, this.marker);
    this.map.panTo(latlng);
};

// start the event loop. every 5 seconds we create a new marker
// and pan to it. the location of the marker will be determined
// by feeding the location string to google's geocoding API. 
FreshMap.prototype.loop = function() {
    var c = this;
    var event = this.getEvent();
    if (event != null) {
        this.geocoder.geocode({
            'address' : event.location
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                c.createMarker(results[0].geometry.location, event.description)
            }
        });
    }
    setTimeout(function() { 
        c.loop(); 
    }, 3000);
};
