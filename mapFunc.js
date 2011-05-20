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

/*======================================================================
 * Description: This function will put a marker at the interval 
 *              specified by 'stepDist'. There must already be a route
 *              loaded onto the map.
 * Arguments:   stepDist - distance, specified in km
 *======================================================================*/
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
        pointArr.push(new LatLon(points[j].Ja, points[j].Ka));
      }
    }

    var ovrDist = 0;
    var markerCnt = 0;
var wind = 0;
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
/*
   var markerGM = new google.maps.Marker({
                  position: markerPosGM,
                  map: map,
                  title: markerCnt * stepDist + " km"
              });
*/
          drawArrow_Wind(markerPos, wind); /* Draw an arrow too! */
          ppDist = ppDist - (stepDist - ovrDist);
          lastPos = markerPos;
          ovrDist = 0;
wind += 10;
        } while(ppDist > stepDist)
        ovrDist = ppDist;
      }
      else
      {
        ovrDist += ppDist;
      }
    }
}

/*======================================================================
 * Description: This function will draw an arrow at the indicated 
 *              location, pointing in the specified direction.
 * Arguments:   loc  - LatLon object
 *              bear - bearing, in degrees
 *======================================================================*/
function drawArrow_Wind(loc, bear, mag)
{
  var l = 0.10*mag; // arrow length
  var w = 0.05*mag/2;     // arrow width
  var c = 0.10*mag;     // arrow center
  var tip   = loc.destinationPoint(bear      , c);
  var right = tip.destinationPoint(bear + 135, w);
  var left  = tip.destinationPoint(bear - 135, w);
  var back  = tip.destinationPoint(bear + 180, l);

  var arrow = new Array();
  arrow.push(new google.maps.LatLng(right.lat(), right.lon()));
  arrow.push(new google.maps.LatLng(tip.lat()  , tip.lon())  );
  arrow.push(new google.maps.LatLng(back.lat() , back.lon()) );
  arrow.push(new google.maps.LatLng(tip.lat()  , tip.lon())  );
  arrow.push(new google.maps.LatLng(left.lat() , left.lon()) );

  var flightPath = new google.maps.Polyline({
    path: arrow,
    strokeColor: "#FF0000",
    strokeOpacity: 0.8,
    strokeWeight: 1
  });
  flightPath.setMap(map);
}
function drawArrow_Dir(loc, bear)
{
  var l = 0.1; // arrow length
  var w = 0.1; // arrow width
  var c = 0;    // arrow center
  var tip   = loc.destinationPoint(bear      , c);
  var right = tip.destinationPoint(bear + 135, w);
  var left  = tip.destinationPoint(bear - 135, w);

  var arrow = new Array();
  arrow.push(new google.maps.LatLng(right.lat(), right.lon()));
  arrow.push(new google.maps.LatLng(tip.lat()  , tip.lon())  );
  arrow.push(new google.maps.LatLng(left.lat() , left.lon()) );

  var flightPath = new google.maps.Polyline({
    path: arrow,
    strokeColor: "#0000FF",
    strokeOpacity: 1,
    strokeWeight: 3
  });
  flightPath.setMap(map);
}



/*======================================================================
 * Description: This function will draw an arrow at the indicated 
 *              location, pointing in the specified direction.
 * Arguments:   loc  - LatLon object
 *              bear - bearing, in degrees
 *======================================================================*/
function plotRoute(file)
{
    $.ajax({
        url: file,
        type: 'HEAD',
        error: function()
            {
                alert("error");
            },
        success: function()
            {
                //alert("OK");
            }
    });

    var http = new XMLHttpRequest();
    http.open('HEAD', file, false);
    http.send();
    if(http.status!=404)
    {
        //alert("OK2");
    }
    else
    {
        alert("error2");
    }
    
    
    $.ajax({
        type:'GET',
        url: file,
        dataType : 'xml',
        success: generateRouteOverlay,
        error: function(xmlResp, message, error)
            {
                alert(message + "   " + error.message);
            }
        });
}

var route = new Array();
var routeTimes = new Array();
var windData = new Array();
function generateRouteOverlay(xml)
{
  route.length=0;
  routeTimes.length=0;
  var bounds = new google.maps.LatLngBounds();
  
  $(xml).find("TrainingCenterDatabase").find("Activities").find("Activity").find("Lap").find("Track").find("Trackpoint").each(function()
        {
                var lat = $(this).find("Position").find("LatitudeDegrees").text();
                var lon = $(this).find("Position").find("LongitudeDegrees").text();
                var time = $(this).find("Time").text();
                if(lat!="" && lon!="")
                {
                  route.push(new google.maps.LatLng(lat, lon));
                  bounds.extend(route[route.length-1]);
                  routeTimes.push(XMLTimeStampToDate(time));
                }
        });

    var flightPath = new google.maps.Polyline({
        path: route,
        strokeColor: "#0000FF",
        strokeOpacity: 0.8,
        strokeWeight: 3
    });
    flightPath.setMap(map);
    map.fitBounds(bounds);
}

function XMLTimeStampToDate(xmlDate)
{
    var dt = new Date();
    var dtS = xmlDate.slice(xmlDate.indexOf('T')+1, xmlDate.indexOf('.'))
    var TimeArray = dtS.split(":");
    dt.setUTCHours(TimeArray[0],TimeArray[1],TimeArray[2]);
    dtS = xmlDate.slice(0, xmlDate.indexOf('T'))
    TimeArray = dtS.split("-");
    dt.setUTCFullYear(TimeArray[0],TimeArray[1],TimeArray[2]);
    return dt;
}

function CSVTimeStampToDate(csvDate)
{
  return new Date(Date.parse(csvDate));
}

function putMarkerEveryKmRoute(stepDist, isWind)
{
    var i,j;
    var pointArrIa = new Array();
    var pointArrJa = new Array();
    var pointArr = new Array();

    for(i = 0; i < route.length; i++)
    {
        pointArr.push(new LatLon(route[i].Ja, route[i].Ka));
    }

    var ovrDist = 0;
    var markerCnt = 0;
var wind = 0;
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
          if(isWind)
          {
            drawArrow_Wind(markerPos, wind); /* Draw an arrow too! */
          }
          else
          {
            drawArrow_Dir(markerPos, lastPos.bearingTo(markerPos));
          }
          ppDist = ppDist - (stepDist - ovrDist);
          lastPos = markerPos;
          ovrDist = 0;
wind += 1;
        } while(ppDist > stepDist)
        ovrDist = ppDist;
      }
      else
      {
        ovrDist += ppDist;
      }
    }
}


/*=============================================*/

function putRealWindMarkers(stepDist)
{
  // First, add the direction marker
  putMarkerEveryKmRoute(2.0, false);

  windData.length = 0;
  // Then, download the WIND data
  $.ajax({
      type:'POST',
      url: 'WeatherFunctions_Test.php',
      data: { ID: "IABCALGA14", day: routeTimes[0].getDate(), month: routeTimes[0].getMonth()+1, year: routeTimes[0].getYear()-100+2000 },
      dataType : 'json',
      success: function(data)
      {
        var colTime=0;
        var colWindDir=5;
        var colWindMag=6;
        for(var i=0; i<data.wudata.length; i++)
        {
          windData.push(new Array(CSVTimeStampToDate(data.wudata[i][colTime]), parseInt(data.wudata[i][colWindDir]), parseInt(data.wudata[i][colWindMag])));
        }

        putWindMarkerEveryKmRoute(0.2);
      },
      error: function(data){ alert("Error"); },
      complete: function(jqXHR, textStatus)
        {
          //alert("Complete:"+textStatus);
        }
  });
}

function putWindMarkerEveryKmRoute(stepDist)
{
    var i,j;
    var pointArrIa = new Array();
    var pointArrJa = new Array();
    var pointArr = new Array();

    for(i = 0; i < route.length; i++)
    {
        pointArr.push(new LatLon(route[i].Ja, route[i].Ka));
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

          // Find the nearest weather timestamp, and get the direction (in degrees)
          var windIndex = findNearestTime(routeTimes[i].getTime()/*-2678390837*//*-4560000*/, windData);
          var windDir = windData[windIndex][1];
          var windMag = windData[windIndex][2];

          // Draw a wind arrow with coordinates of 'markerPos' and
          // wind direction of 'windDir'
          drawArrow_Wind(markerPos, windDir, windMag);

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

function findNearestTime(value, array)
{
  var nearest = -1;
  var bestDistanceFoundYet = 99999999999999999;
  // We iterate on the array...
  for (var i = 0; i < array.length; i++)
  {
    // if we found the desired number, we return it.
    if (array[i][0].getTime() == value)
    {
      return i;
    }
    else 
    {
      // else, we consider the difference between the desired number and the current number in the array.
      var d = Math.abs(value - array[i][0].getTime());
      if (d < bestDistanceFoundYet)
      {
        // For the moment, this value is the nearest to the desired number...
        nearest = i;
        bestDistanceFoundYet = d;
      }
    }
  }
  return nearest;
}













// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
function CSVToArray( strData, strDelimiter ){
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");

    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
            (
                    // Delimiters.
                    "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                    // Quoted fields.
                    "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                    // Standard fields.
                    "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
            "gi"
            );


    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [[]];

    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;


    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec( strData )){

            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[ 1 ];

            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (
                    strMatchedDelimiter.length &&
                    (strMatchedDelimiter != strDelimiter)
                    ){

                    // Since we have reached a new row of data,
                    // add an empty row to our data array.
                    arrData.push( [] );

            }


            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (arrMatches[ 2 ]){

                    // We found a quoted value. When we capture
                    // this value, unescape any double quotes.
                    var strMatchedValue = arrMatches[ 2 ].replace(
                            new RegExp( "\"\"", "g" ),
                            "\""
                            );

            } else {

                    // We found a non-quoted value.
                    var strMatchedValue = arrMatches[ 3 ];

            }


            // Now that we have our value string, let's add
            // it to the data array.
            arrData[ arrData.length - 1 ].push( strMatchedValue );
    }

    // Return the parsed data.
    return( arrData );
}
