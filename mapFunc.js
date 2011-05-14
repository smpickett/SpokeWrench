/*======================================================*/
/* FILE: mapFunc.js                                     */
/* Copyright (c) 2011 SpokeWrench                       */
/*======================================================*/


var map;
var directionsDisplay;
var directionsService;
var markerArray = [];
    
function initialize()
{
    // Instantiate a new directions service
    directionsService = new google.maps.DirectionsService();

    // Create a map and center it on Spring Bank airport
    var latlng = new google.maps.LatLng(51.110204,-114.411621);
    var mapOptions = {
      zoom: 12,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

    // Create a renderer for directions and bind it to the map
    var rendererOptions = {
        map: map
    };
    directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);

    // Instantiate an info whos
}

function calcRoute()
{
  // First, clear out all existing markerArrays
  for (i = 0; i < markerArray.length; i++) {
    markerArray[i].setMap(null);
  }

  // Retrieve the start and end locations and create
  // a DirectionsRequest using BIKING directions
  var start = "Springbank Airport";
  var end = "Glenbow Lake";
  var request = {
      origin: start,
      destination: end,
      travelMode: google.maps.TravelMode.DRIVING
  };

  // Route the directions
  directionsService.route(request, function(response, status)
    {
      if (status == google.maps.DirectionsStatus.OK)
      {
        directionsDisplay.setDirections(response);
      }
      else
      {
        alert("bad");
      }
    });
}



function WindInfo()
{
    this.direction = new Array();
    this.time = new Array();
    this.strength = new Array();
}
WindInfo.prototype.add = function(dir, tim, str)
{
    this.direction.push(dir);
    this.time.push(tim);
    this.strength.push(str);
};
WindInfo.prototype.getInfo = function()
{
    return "no info yet";
};


function OverlayWind()
{
    var wind = new WindInfo();
    wind.add(1, 2, 3);
    alert(wind.getInfo());
}
    
function testMarkers()
{
    var steps = directionsDisplay.directions.routes[0].legs[0].steps;
    var i,j;
    var colour = false;
    for(j = 0; j < steps.length; j++)
    {
        var points = steps[j].lat_lngs;
        for(i = 0; i < points.length; i++)
        {
            if(colour)
                colortext = "blue";
            else
                colortext = "red";
            colour = !colour;

            var latlng = new google.maps.LatLng(points[i].Ia, points[i].Ja);
            var marker = new google.maps.Marker({
                    position: latlng,
                    map: map,
                    title: "Point " + i,
                    color: "blue"
                });
        }
    }
}

function putMarkerEveryKm(stepDist)
{
    var steps = directionsDisplay.directions.routes[0].legs[0].steps;
    var i,j;
    var pointArrIa = new Array();
    var pointArrJa = new Array();
    var pointArr = new Array();

    for(i = 0; i < steps.length; i++)
    {
      var points = steps[i].lat_lngs;
      for(j = 0; j < points.length; j++)
      {
        pointArr.push(new LatLon(points[j].Ia, points[j].Ja));
      }
    }

    var ovrDist = 0;
    var markerCnt = 0;
    for(i = 1; i < pointArr.length; i++)
    {
      var ppDist = parseFloat(pointArr[i].distanceTo(pointArr[i-1]));
      var ppBearing = pointArr[i].bearingTo(pointArr[i-1]);
      if(ovrDist + ppDist >= stepDist)
      {
        var lastPos = pointArr[i-1];
        do
        {
          var markerPos = lastPos.destinationPoint(ppBearing, -Math.abs(stepDist-ovrDist));
          var markerPosGM = new google.maps.LatLng(markerPos.lat(), markerPos.lon());
          markerCnt++;
          var markerGM = new google.maps.Marker({
                  position: markerPosGM,
                  map: map,
                  title: markerCnt * stepDist + " km"
              });
          ppDist = ppDist - (stepDist - ovrDist);
          lastPos = markerPos;
          ovrDist = 0;
        } while(ppDist > stepDist)
        ovrDist = ppDist;
      }
      else
      {
        ovrDist += ppDist;
      }
    }
}

