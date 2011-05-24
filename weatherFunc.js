/*======================================================*/
/* FILE: weatherFunc.js                                 */
/* Copyright (c) 2011 SpokeWrench                       */
/*======================================================*/

//====== Settings =========================================================
var stringUrlWU = "http://api.wunderground.com/auto/wui/geo/GeoLookupXML/index.xml?query="
//====== END OF Settings ==================================================

//====== Global Variables =================================================
var stationList = [];          // Contains a list of stations in the area
//====== END OF Global Variables ==========================================

//====== Objects ==========================================================
function WeatherStation(id, lat, lon, dist) {
  if (lat == undefined)  lat = 0;
  if (lon == undefined)  lon = 0;
  if (dist == undefined) dist = 9999;
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
 * Description: Based on the provided coordinates, finds the closest
 *              weather station, and returns the ID
 * Arguments:   lat - latitude of the point to search
 *              lon - longitude of the point to serach
 *----------------------------------------------------------------------*/
function weatherFindClosestStation(lat, lon)
{
  var xmlstring = stringUrlWU+lat+','+lon;

  $.ajax({
    type:'GET',
    url:xmlstring,
    dataType:'xml',
    success: function(xml)
      {
        /* I'm not yet sure how to query history from airport data */
        /*
        $(xml).find('nearby_weather_stations').find('airport').find('station').each(function(){
          var stationlat = $(this).find('lat');
          var stationlon = $(this).find('lon');
          var stationid  = $(this).find('icao');
          stationList.push(new WeatherStation(stationid, stationlat, stationlon));
        });
        */

        /* Grab a list of weather stations near the specified coordinates */
        $(xml).find('nearby_weather_stations').find('pws').find('station').each(function(){
          var stationid   = $(this).find('id');
          var stationdist = $(this).find('distance_km');
          stationList.push(new WeatherStation(stationid, lat, lon, stationdist));
        });

        /* Now search through the stations and return the ID of the closest one */
        var dist = 9999;
        var beststation;
        for(i in stationList)
        {
          if(stationList[i].dist < dist)
          {
            dist = stationList[i].dist;
            beststation = stationList[i].id;
          }
        }
        return beststation;
      },
    error: function(xmlResp, message, error)
      {
        alert('weatherFindClosestStation - error\n'+error+'\n'+message);
      }
  });
}




