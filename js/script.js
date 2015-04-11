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
	  	title: "SF Giants",
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
	  	title: "San Francisco Legion of Honor",
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
			draggable: true,	
			map: map
		});


		this.toggleBounce = function() {
			if (self.marker.getAnimation() != null) {
				self.marker.setAnimation(null);
			} else {
			    self.marker.setAnimation(google.maps.Animation.BOUNCE);
			};
		}

		google.maps.event.addListener(this.marker, 'click', this.toggleBounce);

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
					draggable: true,	
					map: map
				});
				google.maps.event.addListener(this.marker, 'click', this.toggleBounce);
				return true;
			};
		}

		//Sets the marker when keyword searched
		this.setMarker = function() {
			self.marker.setMap(null);
			if(self.onOff() === true) {

				self.marker = new google.maps.Marker({
					position: {lat: this.lat, lng:this.long},
					title: this.title,
					draggable: true,	
					map: map				
				});
				google.maps.event.addListener(this.marker, 'click', this.toggleBounce);
				return true;
			}
			else {
				return false;
			};
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
			self.wikiLink();
		};

		//Run the keyword search
		this.keywordSearch = function() {
			//Loop through points array
			for (var i=0; i<self.points().length; i++) {
				var temp = false;
				//Loop through keywords within points array
				for (var k=0; k<self.points()[i].keywords.length; k++) {
					if (self.keyword() === self.points()[i].keywords[k]) {
						//If there is a match, set temp to true
						temp = true;
					}
				}
				//Set onOff attribute to result and set the markers on and off accordingly
				self.points()[i].onOff(temp);
				self.points()[i].setMarker();
			}
		};

		//Streetview API call function
		this.imgSrc = ko.computed(function() {
			var temp = 'https://maps.googleapis.com/maps/api/streetview?size=400x400&location=' + this.currentPoint().lat + ',' + this.currentPoint().long + '&key=AIzaSyCjbTADLd-qfPiQ4j2BFWikuX4mA-O0L_4'; 
			return temp;
		}, this);

		//Wikiurl observable
		this.wikiurl = ko.observable('');

		//Wiki api call function
		this.wikiLink = function() {

			//Set up api call format
			var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + this.currentPoint().title + '&format=json&callback=wikiCallback';

			//Initiate wiki error timeout
		  var wikiRequestTimeout = setTimeout(function(){
		        $wikiElem.text("failed to get wikipedia resources");
		    },8000);

		  //Ajax to get wiki api call
		  $.ajax({
		    url: wikiUrl,
		    dataType: "jsonp",
		    //jsonp: "callback",
		    success: function ( response ) {
		    		//Parse data for first link
		        var articleList = response[1];
		        articleStr = articleList[0];
		        var url = 'http://en.wikipedia.org/wiki/' + articleStr;

		        //Set wikiurl observable to link format
		        self.wikiurl(url);
	    	}
		  });
		  //Clear the timeout if it gets here
      clearTimeout(wikiRequestTimeout); 

	  }

	  //Runs wikiLink() the upon initialization
		this.wikiLink();

	};

	//Apply bindings to ViewModel
	ko.applyBindings(new ViewModel());
}

//Wait for window to load before running initialize
google.maps.event.addDomListener(window, 'load', initialize);
