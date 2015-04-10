//Create model with data for map location and marker locations
var model = {
	map:
		{
	    center: {lat: 37.788, lng: -122.440},
	    zoom: 13
  	},

	markerLocations: [
		{
			position: {lat: 37.779087, lng: -122.390364},
	  	title: "AT&T Park",
	  	keywords: ['at&t', 'park', 'sports', 'baseball']
		},

		{
			position: {lat: 37.808666, lng:  -122.409192},
	  	title: "Pier 39",
	  	keywords: ['park', 'food', 'tourism', 'water']
		},

		{
			position: {lat: 37.770418, lng: -122.485887},
	  	title: "Golden Gate Park",
	  	keywords: ['golden', 'gate', 'park', 'views', 'green']
	  },
	  {
	  	position: {lat: 37.793288, lng: -122.417711},
	  	title: "Nob Hill",
	  	keywords: ['nob', 'hill', 'steep']
	  },
	  {
	  	position: {lat: 37.784436, lng: -122.502897},
	  	title: "Legion of Honor",
	  	keywords: ['legion', 'honor','green']
	  }
	]
};


//Create new map with mapOptions for location and zoom
function initialize() {
	//Create map according to model's location
  var map = new google.maps.Map(document.getElementById('map-canvas'), model.map);

  //Create marker class
	var Marker = function(data) {
		//For help in nested functions
		var self = this;

		//Sets data to current marker
		this.title = data.title;
		this.lat = data.position.lat;
		this.long = data.position.lng;
		this.keywords = data.keywords;
		this.onOff = ko.observable(true);

		//Place marker on google map
		this.marker = new google.maps.Marker({
			position: {lat: this.lat, lng:this.long},
			title: this.title,
			map: map
		});

		//Toggles marker when keyword searched
		this.toggleMarker = function() {
			if(self.onOff()) {
			self.marker.setMap(null);
			return true;
			}
			else {
				self.marker = new google.maps.Marker({
					position: {lat: this.lat, lng:this.long},
					title: this.title,
					map: map
				})
				return true;
			}
		}

		//Sets the marker when keyword searched
		this.setMarker = function() {
			self.marker.setMap(null);
			if(self.onOff() === true) {

				self.marker = new google.maps.Marker({
					position: {lat: this.lat, lng:this.long},
					title: this.title,
					map: map				
				})
				return true;
			}
			else {
				
				return false;
			}
		}
	}

	var ViewModel = function() {
		//Help inside nested functions
		var self = this;

		//Create the observable array of markers
		this.points = ko.observableArray([])

		//Place each marker into the array
		model.markerLocations.forEach(function(markerItem){
			self.points.push( new Marker(markerItem));
		});

		//Set initial current point
		this.currentPoint = ko.observable(this.points()[0]);

		//Set initial keyword
		this.keyword = ko.observable('');

		//Change the marker selected
		this.changePoint = function(title) {
			self.currentPoint(title);
		};

		//Run the keyword search
		this.keywordSearch = function() {

			for (var i=0; i<self.points().length; i++) {
				var temp = false;

				for (var k=0; k<self.points()[i].keywords.length; k++) {
					if (self.keyword() === self.points()[i].keywords[k]) {
						temp = true;
					}
					else {
						
					}
				}
				self.points()[i].onOff(temp);
				self.points()[i].setMarker();
			}
		};

		//External API for streetview
		this.imgSrc = ko.computed(function() {
			var temp = 'https://maps.googleapis.com/maps/api/streetview?size=400x400&location=' + this.currentPoint().lat + ',' + this.currentPoint().long + '&key=AIzaSyCjbTADLd-qfPiQ4j2BFWikuX4mA-O0L_4'; 
			return temp;
		}, this);

	};

	ko.applyBindings(new ViewModel());

}

google.maps.event.addDomListener(window, 'load', initialize);
