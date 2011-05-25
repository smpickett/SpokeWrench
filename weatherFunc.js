/*======================================================*/
/* FILE: weatherFunc.js                                 */
/* Copyright (c) 2011 SpokeWrench                       */
/*======================================================*/

//====== Settings =========================================================
var stringUrlWU = "http://api.wunderground.com/auto/wui/geo/GeoLookupXML/index.xml?query="
//====== END OF Settings ==================================================

//====== Global Variables =================================================
var stationList = [];          // Contains a list of stations in the area
var closestStationIndex;
var closestStation;
//====== END OF Global Variables ==========================================

//====== Objects ==========================================================
function WeatherStation(id, lat, lon, dist) {
  if (lat == undefined)  lat = 0;
  if (lon == undefined)  lon = 0;
  if (dist == undefined) dist = 999999;
  this.id = id;
  this.lat = lat;
  this.lon = lon;
  this.distance = dist;
}
WeatherStation.prototype.distanceTo = function(station) {
  var stationA = new LatLon(this.lat, this.lon);
  var stationB = new LatLon(station.lat, station.lon);
  return stationA.distanceTo(stationB);
}
WeatherStation.prototype.distanceTo = function(lat, lon) {
  var stationA = new LatLon(this.lat, this.lon);
  var stationB = new LatLon(lat, lon);
  return stationA.distanceTo(stationB);
}
//====== END OF Objects ===================================================

/*----------------------------------------------------------------------
 * Description: Provided a closest station has already been found,
 *              give the resulting coordinates.
 * Returns:     (LatLon object)
 *----------------------------------------------------------------------*/
function weatherGetClosestStationCoord(callback)
{
  // If the closest station was not identified, just quit
  if(closestStationIndex == undefined || closestStationIndex > stationList.length)
    return;

  weatherGetStationCoordinates(stationList[closestStationIndex].id, function(stationcoord) {
      closestStation = new WeatherStation(stationList[closestStationIndex].id, stationcoord.lat(), stationcoord.lon(), stationList[closestStationIndex].distance);
      callback.call(this, stationcoord);
    });
}

/*----------------------------------------------------------------------
 * Description: Based on the provided coordinates, finds the closest
 *              weather station, and returns the ID.
 * Arguments:   lat - latitude of the point to search
 *              lon - longitude of the point to serach
 *----------------------------------------------------------------------*/
function weatherFindClosestStation(lat, lon, callback)
{
  var xmlstring = stringUrlWU+lat+','+lon;

  $.ajax({
    type: 'POST',
    url:  './PHP/WeatherFunctions.php',
    data: { func: 'GetWeatherStations', xml: xmlstring },
    dataType:'json',
    /*
    async: false,
    cache: false,
    timeout: 5000,
    */
    success: function(data)
      {
        // Check for errors
        if(data.error)
        {
          alert(data.errormsg);
          return;
        }
        if(data.idarray.length != data.distarray.length)
        {
          alert("[ERROR] id and distance array lengths do not match");
          return;
        }
        if(data.idarray.length == 0)
        {
          alert("[ERROR] id and distance array lengths are zero");
          return;
        }
     

        // Create a new base and recalculate all the station distances
        var base = new LatLon(lat, lon);
        for(i in stationList)
        {
          stationList[i].distance = parseFloat(base.distanceTo(new LatLon(stationList[i].lat, stationList[i].lon)));
        }
        // Add new stations
        for(i in data.idarray)
        {
          // First, check to see if the list already contains the station
          var loaded = false;
          for(j in stationList)
          {
            if(stationList[j].id == data.idarray[i])
              loaded = true;
          }
          
          // And if it doesn't, we must lookup the station coordinates
          if(!loaded)
          {
            var coord;
            weatherGetStationCoordinates(data.idarray[i], function(stationcoord) {
                coord = stationcoord;
                });
            // Add the station to the list
            stationList.push(new WeatherStation(data.idarray[i], coord.lat(), coord.lon(), parseFloat(base.distanceTo(coord))));
          }
        }

        /* Now search through the stations and return the ID of the closest one */
        /*
        var smallestdist = 9999999;
        var beststationID;
        closestStationIndex = 0;
        for(i in stationList)
        {
          if(stationList[i].distance < smallestdist)
          {
            smallestdist = stationList[i].distance;
            beststationID = stationList[i].id;
            closestStationIndex = parseInt(i);
          }
        }
        */
        stationListTemp = new Array();
        stationListTemp.push(stationList[0]);
        /* Sort the list based on the distance, with '0' the closest station */
        for(var i=1; i<stationList.length; i++)
        {
          var j=0;
          while(j<stationListTemp.length && stationListTemp[j].distance<stationList[i].distance)
            j++;
          stationListTemp.splice(j,0,stationList[i]);
        }
        stationList = stationListTemp;

        callback.call(this, stationList);
      },
    error: function(xmlResp, message, error)
      {
        alert('weatherFindClosestStation - error\n'+error+'\n'+message+'\n'+xmlResp.responseText);
      }
  });
}

/*----------------------------------------------------------------------
 * Description: Obtains the coordinates of the provided weather station
 * Arguments:   id - the ID of the weather station
 * Returns:     (LatLon object)
 *----------------------------------------------------------------------*/
function weatherGetStationCoordinates(id, callback)
{
  $.ajax({
    type: 'POST',
    url:  './PHP/WeatherFunctions.php',
    data: { func: 'GetWeatherStationLatLon', id: id },
    async: false,
    cache: false,
    timeout: 500,
    dataType:'json',
    success: function(data)
      {
        // Check for errors
        if(data.error)
        {
          alert(data.errormsg);
          return;
        }
        if(data.lat == undefined || data.lon == undefined)
        {
          alert("[ERROR] There was an issue obtaining the coordinates of station "+id);
          return;
        }
        callback.call(this, new LatLon(parseFloat(data.lat), parseFloat(data.lon)));
      },
    error: function(xmlResp, message, error)
      {
        alert('weatherFindClosestStation - error\n'+error+'\n'+message+'\n'+xmlResp.responseText);
      }
  });
}


