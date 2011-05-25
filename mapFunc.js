/*======================================================*/
/* FILE: mapFunc.js                                     */
/* Copyright (c) 2011 SpokeWrench                       */
/*======================================================*/


//====== Settings =========================================================
var colourArrowWind = "#FF0000";
var colourArrowDir  = "#0000FF";
var colourPolyLineRoute = "#0000FF";
//====== END OF Settings ==================================================
    

//====== Global Variables =================================================
var map;
var route;          // Contains Google Maps lat lon coordinate sets
var routeTimes      // Contains Date objects
var windData;       // Contains WindInfo objects
var markers = new Array();  // Contains a list of markers added to the map
//====== END OF Global Variables ==========================================

function initializeMap()
{
    // Create a map and center it on Calgary, AB
    var latlng = new google.maps.LatLng(51.045,-114.057222);
    var mapOptions = {
      zoom: 10,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
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


//====== Overlay Functions ================================================
/*----------------------------------------------------------------------
 * Description: Clears all known overlays on the map
 *----------------------------------------------------------------------*/
function clearOverlays()
{
  if (markers) {
    for (i in markers) {
      markers[i].setMap(null);
    }
  }
}


/*----------------------------------------------------------------------
 * Description: This function will draw an arrow at the indicated 
 *              location, pointing in the specified direction.
 * Arguments:   loc  - LatLon object
 *              bear - bearing, in degrees
 *              mag  - size/magnitude of arrow
 *----------------------------------------------------------------------*/
function drawArrow_Wind(loc, bear, mag)
{
  var l = 0.10*mag;     // arrow length
  var w = 0.05*mag/2;   // arrow width
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
    strokeColor: colourArrowWind,
    strokeOpacity: 0.8,
    strokeWeight: 1
  });
  flightPath.setMap(map);
  markers.push(flightPath);
}

/*----------------------------------------------------------------------
 * Description: This function will draw an arrow at the indicated 
 *              location, pointing in the specified direction.
 * Arguments:   loc  - LatLon object
 *              bear - bearing, in degrees
 *----------------------------------------------------------------------*/
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
    strokeColor: colourArrowDir,
    strokeOpacity: 1,
    strokeWeight: 3
  });
  flightPath.setMap(map);
  markers.push(flightPath);
}
/*----------------------------------------------------------------------
 * Description: This function will draw a station marker at the specified
 *              location
 * Arguments:   loc  - LatLon object
 *----------------------------------------------------------------------*/
function drawStationMarker(loc)
{
  var locGM = new google.maps.LatLng(loc.lat(), loc.lon());
  var markerGM = new google.maps.Marker({
                 position: locGM,
                 map: map,
                 });
  markers.push(markerGM);
}

//====== END OF Overlay Functions =========================================


    

//====== Route Functions ======================================================
//----------------------------------------------------------------------
// Description: This will pull the specified TCX file from the server
//              and generate a route overlay
// Arguments:   file - the file name/location
//----------------------------------------------------------------------
function plotRoute(file)
{
  $.ajax({
    type:'GET',
    url: file,
    dataType : 'xml',
    success: function(xml)
      {
        // Draw the route overlay
        generateRouteOverlay(xml);

        // Get a list of the nearby stations
        weatherFindClosestStation(route[0].lat(), route[0].lon(), function(stationlist) {
            var success = false;
            var i = 0;
            do
            {
              // Try to get wind data
              putRealWindMarkers(0.2, stationlist[i].id, function(value){success=value;});
              i++;
            }
            while(!success && i<stationlist.length)
            drawStationMarker(new LatLon(stationlist[i-1].lat, stationlist[i-1].lon));
          });
      },
    error: function(xmlResp, message, error)
      {
        //alert("ERROR (plotRoute):\n" + message + "   " + error);
      }
    });
}

//----------------------------------------------------------------------
// Description: Generates a route overlay onto the map object
// Arguments:   xml - the TCX xml file that contains route data
//----------------------------------------------------------------------
function generateRouteOverlay(xml)
{
  route = new Array();                          // Initialize a new route array
  routeTimes = new Array();                     // Initialize a new routeTimes array
  var bounds = new google.maps.LatLngBounds();  // Initialize a new google maps boundry (for use later)
  
  // Parse the XML to find the route data
  $(xml).find("TrainingCenterDatabase").find("Activities").find("Activity").find("Lap").find("Track").find("Trackpoint").each(function()
    {
      var lat = $(this).find("Position").find("LatitudeDegrees").text();
      var lon = $(this).find("Position").find("LongitudeDegrees").text();
      var time = XMLTimeStampToDate($(this).find("Time").text(), false);

      // If the lat and lon are specified, add them into the route array
      if(lat != "" && lon != "" && time != "")
      {
        routeTimes.push(time);
        route.push(new LatLon(lat, lon));
      }
    });

  // Convert the LatLon object to a google maps LatLng object
  //   Note: we do this because google maps is RETARDED and keeps
  //   switching the coordinates from Ia, Ja to Ja, Ka. GAAAAA.
  var routeGM = new Array();
  for(i in route)
  {
    var pointGM = new google.maps.LatLng(route[i].lat(), route[i].lon());
    routeGM.push(pointGM);
    bounds.extend(pointGM);
  }

  // Draw the new route using a google maps polylin object
  var flightPath = new google.maps.Polyline({
    path: routeGM,
    strokeColor: colourPolyLineRoute,
    strokeOpacity: 0.8,
    strokeWeight: 3
  });
  flightPath.setMap(map);
  markers.push(flightPath);

  // And center/zoom the new route onto the map
  map.fitBounds(bounds);
}

//----------------------------------------------------------------------
// Description: Converts an XML time stamp into a Date object
//                XML Timestamp Example: 2011-05-17T13:18:50Z
// Arguments:   xmlDate - the timestamp to convert
//----------------------------------------------------------------------
function XMLTimeStampToDate(xmlDate, isUTC)
{
  var dt = new Date();

  // Get the TIME component
  var dtS = xmlDate.slice(xmlDate.indexOf('T')+1, xmlDate.indexOf('.'));
  var TimeArray = dtS.split(/:|-/);
  if(isUTC)
    dt.setUTCHours(TimeArray[0],TimeArray[1],TimeArray[2]); // HH MM SS
  else
    dt.setHours(TimeArray[0],TimeArray[1],TimeArray[2]); // HH MM SS

  // Get the DATE component
  dtS = xmlDate.slice(0, xmlDate.indexOf('T'));
  TimeArray = dtS.split("-");
  if(isUTC)
    dt.setUTCFullYear(TimeArray[0],TimeArray[1]-1,TimeArray[2]); // YYYY MM DD
  else
    dt.setFullYear(TimeArray[0],TimeArray[1]-1,TimeArray[2]); // YYYY MM DD

  return dt;
}

//----------------------------------------------------------------------
// Description: Converts an CSV time stamp into a Date object
// Arguments:   csvDate - the timestamp to convert
//----------------------------------------------------------------------
function CSVTimeStampToDate(csvDate)
{
  return new Date(Date.parse(csvDate));
}
//====== END OF Route Functions ================================================

function putMarkerEveryKmRoute(stepDist, isWind)
{
    var i,j;
    var pointArrIa = new Array();
    var pointArrJa = new Array();

    var ovrDist = 0;
    var markerCnt = 0;
var wind = 0;
    for(i = 1; i < route.length; i++)
    {
      var ppDist = parseFloat(route[i].distanceTo(route[i-1]));
      var ppBearing = route[i].bearingTo(route[i-1]);
      if(ovrDist + ppDist >= stepDist)
      {
        var lastPos = route[i-1];
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

function putRealWindMarkers(stepDist, stationid, callback)
{
  // First, add the direction marker
  putMarkerEveryKmRoute(2.0, false);

  windData = new Array();
  // Then, download the WIND data
  $.ajax({
      type:'POST',
      url: './PHP/WeatherFunctions.php',
      data: { func: 'GetWeatherData', ID: stationid, day: routeTimes[0].getDate(), month: routeTimes[0].getMonth()+1, year: routeTimes[0].getYear()-100+2000 },
      async: false,
      cache: false,
      timeout: 500,
      dataType : 'json',
      success: function(data)
      {
        // Check for errors
        if(data.error)
        {
          alert(data.errormsg);
          return;
        }

        var colTime=0;
        var colWindDir=5;
        var colWindMag=6;
        for(var i=0; i<data.wudata.length; i++)
        {
          windData.push(new Array(CSVTimeStampToDate(data.wudata[i][colTime]), parseInt(data.wudata[i][colWindDir]), parseInt(data.wudata[i][colWindMag])));
        }

        putWindMarkerEveryKmRoute(0.2);

        callback.call(this, true);
      },
      error: function(data){ alert("Error"); }
  });
}

function putWindMarkerEveryKmRoute(stepDist)
{
    var i,j;
    var pointArrIa = new Array();
    var pointArrJa = new Array();

    var ovrDist = 0;
    var markerCnt = 0;
    for(i = 1; i < route.length; i++)
    {
      var ppDist = parseFloat(route[i].distanceTo(route[i-1]));
      var ppBearing = route[i].bearingTo(route[i-1]);
      if(ovrDist + ppDist >= stepDist)
      {
        var lastPos = route[i-1];
        do
        {
          var markerPos = lastPos.destinationPoint(ppBearing, -Math.abs(stepDist-ovrDist));
          var markerPosGM = new google.maps.LatLng(markerPos.lat(), markerPos.lon());
          markerCnt++;

          // Find the nearest weather timestamp, and get the direction (in degrees)
          var windIndex = findNearestTime(routeTimes[i].getTime(), windData);
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
