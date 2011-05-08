<?php

function Generate_WeatherSelection()
{
  return;
  $xml = simplexml_load_file("http://api.wunderground.com/auto/wui/geo/GeoLookupXML/index.xml?query=Calgary");
  if(is_null($xml))
    return;
  debug($xml->getName()); 

  $station_names = array();
  $station_types = array();

  foreach($xml->children() as $child)
  {
    debug($child->getName()." : ".$child);
    if($child->getName() == "nearby_weather_stations")
    {
      foreach($child->children() as $stationtype)
      {
        foreach($stationtype->children() as $station)
        {
          // Save the station type
          array_push($station_types, $stationtype->getName());
          debug($stationtype->getName());
        
          // Save the station name
          array_push($station_names, "Name: ".$station->children())
          debug($station->children());
          debug("name: ".$station->children());
        }
      }
    }
  }
}

function debug($str)
{
  echo "<br> DEBUG: ".$str;
}

?>
