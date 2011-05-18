<?php

Generate_WeatherSelection();

function Generate_WeatherSelection()
{
  $xml = simplexml_load_file("http://api.wunderground.com/auto/wui/geo/GeoLookupXML/index.xml?query=Calgary");
  if(is_null($xml))
    return;

  $station_names = array();
  $station_types = array();
  $station_ids   = array();

  foreach($xml->children() as $child)
  {
    if($child->getName() == "nearby_weather_stations")
    {
      foreach($child->children() as $stationtype)
      {
        foreach($stationtype->children() as $station)
        {
          if($stationtype->getName() == "airport")
          {
            // Save the station type
            array_push($station_types, $stationtype->getName());
            debug("Type: ".$stationtype->getName());

            foreach($station->children() as $stationElement)
            {
              if($stationElement->getName() == "city")
              {
                // Save the station name
                array_push($station_names, $stationElement);
                debug("name: ".$stationElement);
              }
              if($stationElement->getName() == "icao")
              {
                // Save the station id
                array_push($station_ids, $stationElement);
                debug("  id: ".$stationElement);
              }
            }
          }

          if($stationtype->getName() == "pws")
          {
            // Save the station type
            array_push($station_types, $stationtype->getName());
            debug("Type: ".$stationtype->getName());

            foreach($station->children() as $stationElement)
            {
              if($stationElement->getName() == "neighborhood")
              {
                // Save the station name
                array_push($station_names, $stationElement);
                debug("name: ".$stationElement);
              }
              if($stationElement->getName() == "id")
              {
                // Save the station id
                array_push($station_ids, $stationElement);
                debug("  id: ".$stationElement);
              }
            }
          }
        }
      }
    }
  }

  // Now that we have the list, generate the selection
  echo '<select>'."\n";
  for($i = 1; $i < count($station_ids); $i++)
  {
    if($station_names[$i] != "")
      echo '  <option value="'.$station_ids[$i].'">'.$station_types[$i].': '.$station_names[$i].'</option>'."\n";
  }
  echo '</select>'."\n";
}

function debug($str)
{
//  echo "<br> DEBUG: ".$str;
}

?>
