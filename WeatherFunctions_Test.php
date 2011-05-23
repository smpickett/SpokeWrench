<?php

GetWeatherData();

function GetWeatherData()
{
$debug = false;

//settings ----------------------------- */
// Special Temporary Setting.  In week, month or year modes, Wundergrund is sending Average Wind in mph instead of km/h.  Only affects metric users.
// I'll get the word out if they fix it and you can turn it off.
$WunderWrong = true;
//
$WUID       = "IABCALGA14";                         // Your stations Wunderground ID
$units      = "B";                                  // Default units which are changeable at runtime.  "M" for Metric, "E" for English or "B" for Both
$gwidth     = "500";                                // Width of the graph - normally 500
$gtemp      = true;                                 // =true if you want the temperature graph =false if no
$gpress     = true;                                 // =true if baro graph =false if no
$gwind      = true;                                 // =true if wind velocity graph =false if no
$gwindir    = true;                                 // =true if wind direction graph =false if no
$grain      = true;                                 // =true if rain graph =false if no
$gsolar     = true;                                 // =true if solar graph =false if no
$guv        = true;                                 // =true if UV graph =false if no
$pwidth     = "100%";                               // The width of the summary and graph portion of the page (% or px). Normally 100%
// Optional header info
$header     = true;                                 // true if you wish to use it
$Langtitle  = "Station Historical Data";            // The Bold text at the top
$LcurDay    = "Return to Current Day";              // The link back to the current day if off in one of the other modes.  "" to disable it.
// Optional footer bar
$footer     = true;                                 // true if you wish to have the colored footer bar at the bottom
$LangFtext  = "Juneau County Weather";              // Anything you wish or "" for a plain bar
// Optional content to be placed to the right of the Summary/Graph portion of the page
$inboxfile  = "./top.htm";                          // A file of html to be placed in the right outlined box.  Make it "" if not using, or just don't have a file available.
$outboxfile = "./bottom.htm";                       // Same but for the area below the right blue box.  Paths to the files must be relative to the calling page.
// Optional "Return to Top" link on the right side
$toTop      = false;                                // Most will want this, but some folks have alternative methods. 
$LtopPg     = "Return to Top";
// Optional selector for other PWS data
$selOthers  = false;                                // true if you wish to show other stations, false if not 
$otherIds   = array('KWIMAUST1', 'ISILKEBO2', 'IVLAAMSG7', 'IBOUCHES4');  // Only works for PWS - Not Airports!
$otherLocat = array('Mauston, WI', 'Silkeborg, DK', 'Kampenhout, BE', 'Cassis, FR'); 
// Option to not show sky conditions in the daily tabular listing
$skipSolar  = false;                                 // true to skip solar data, false to include them
$skipSky    = false;                                 // true to skip sky conditions, false to include them
// Option to not show the tabular data
$skipTab    = false;                                // true if you wish to suppress the tabular data
//
// Language changes follow.  If unsure about any of them, try it and see what happens.
$mnthname     = array('Nil', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December');
              // Next are for the Summary Table
$Langtabs     = array('Daily', 'Weekly', 'Monthly', 'Yearly', 'Custom');  // Tabs above the Summary Table
$LangSumHeads = array("Temperature", "Dew Point", "Humidity", "Wind Speed", "Wind Gust", "Wind", "Pressure", "Precipitation", "Solar");
              // Headings for the Summary Table
$LangSumCols  = array("Current", "High", "Low", "Average");
$LSumfor   = "Summary for";
$Lunits    = "Units";
$Lboth     = "Both";
$Lenglish  = "English";
$Lmetric   = "Metric";
$Lnext     = "Next";
$Lprev     = "Previous";
$Ltarget   = array("Day", "Week", "Month", "Year");
$Lview     = "View";
$Ltab1     = "Tabular Data for";  // Next 5 for Blue bar above the Tabular listing
$Ltab2     = "Weeks Tabular Data";
$Ltab3     = "Months Tabular Data";
$Ltab4     = "Years Tabular Data";
$Ltab5     = "Custom Date Range Tabular Data";
          // Next are for the Tabular Table
$Lheadings = array('Time', 'Temperature', 'Dew Point', 'Pressure', 'Wind', 'Wind Speed', 'Wind Gust', 'Humidity', 'Rainfall Rate (Hourly)', 'solar', 'Conditions');
          // Headings when in weekly, monthly etc modes
$Lhdngs2   = array("Temp", "Dew Point", "Humidity", "Sea Level Pressure", "Wind", "Gust Speed", "Precip");
$Lcols2    = array("high", "ave", "low", "sum"); 
$Lcommafile= "Comma Delimited File";
$Lthanks   = "Compliments of";
//
// end of settings
//------------------------------------------------
// overrides from Settings.php if available
global $SITE;
if (isset($SITE['WUID']))		{$WUID = $SITE['WUID'];}
if (isset($SITE['uomTemp']))	{
  $units = preg_match('|C|i',$SITE['uomTemp']) ? 'M':'E';
}
if (isset($SITE['WUunits']))	{$units = $SITE['WUunits'];}
if (isset($SITE['WUstationname'])) {$LangFtext = $SITE['WUstationname'];}
if (isset($SITE['UV']))		{$guv = $SITE['UV'];}
if (isset($SITE['SOLAR']))	{$gsolar = $SITE['SOLAR'];}
if (isset($SITE['timeFormat'])) {$timeFormat = $SITE['timeFormat'];}
// end of overrides from Settings.php if available


// Set some dates
$mo = 1;//date("m");
$da = 1;//date("d");
$yr = 2011;//date("Y");
$LAST_YEAR = $yr;

// Defaults if called without parameters
$PHP_SELF = $_SERVER['PHP_SELF'];
if ( empty($_REQUEST['ID']) ) 
        $_REQUEST['ID']=$WUID;
if ( empty($_REQUEST['day']) ) 
        $_REQUEST['day']=$da;
if ( empty($_REQUEST['dayend']) ) 
        $_REQUEST['dayend']=$da;
if ( empty($_REQUEST['month']) ) 
        $_REQUEST['month']=$mo;
if ( empty($_REQUEST['monthend']) ) 
        $_REQUEST['monthend']=$mo;
if ( empty($_REQUEST['year']) ) 
        $_REQUEST['year']=$yr;
if ( empty($_REQUEST['yearend']) ) 
        $_REQUEST['yearend']=$yr;		
if ( empty($_REQUEST['units']) ) 
        $_REQUEST['units']=$units;
if ( empty($_REQUEST['mode']) ) 
        $_REQUEST['mode']=1;

//Pass into PHP variables
//------------------------------------------------
$WUID = $_REQUEST['ID'];
$da = $_REQUEST['day'];
$mo = $_REQUEST['month'];
$yr = $_REQUEST['year'];
$da2 = $_REQUEST['dayend'];
$mo2 = $_REQUEST['monthend'];
$yr2 = $_REQUEST['yearend'];
$units = $_REQUEST['units'];
$mode = $_REQUEST['mode'];

// Gather the csv data
$WUgraphstr = "http://www.wunderground.com/cgi-bin/wxStationGraphAll";          
$WUdatastr = "http://www.wunderground.com/weatherstation/WXDailyHistory.asp";   
if ($mode == 1) {
	$wunderstring = $WUdatastr . "?ID=" . $WUID . "&month=" . $mo . "&day=" . $da . "&year=" . $yr . "&format=1&graphspan=day";    // Day
} elseif ($mode == 2) {
	$wunderstring = $WUdatastr . "?ID=" . $WUID . "&month=" . $mo . "&day=" . $da . "&year=" . $yr . "&format=1&graphspan=week";   // Week
} elseif ($mode == 3) {
	$wunderstring = $WUdatastr . "?ID=" . $WUID . "&month=" . $mo . "&day=" . $da . "&year=" . $yr . "&format=1&graphspan=month";  // Month
} elseif ($mode == 4) {
	$wunderstring = $WUdatastr . "?ID=" . $WUID . "&month=" . $mo . "&day=" . $da . "&year=" . $yr . "&format=1&graphspan=year";   // Year
} elseif ($mode == 5) {
	$wunderstring = $WUdatastr . "?ID=" . $WUID . "&month=" . $mo . "&day=" . $da . "&year=" . $yr . "&monthend=" . $mo2 . "&dayend=" . $da2 . "&yearend=" . $yr2 . "&format=1&graphspan=custom";  // Custom
}
$csvraw=getcsvWithoutHanging($wunderstring); 
$csvdata = array_pure($csvraw);             //$csvdata has headings in row 0.  Saving a copy for no good reason
$csvarray = $csvdata;
if ($mode == 1){
	array_shift($csvarray);     // Now $csvarray has nothing but 2D data.  The other modes don't need this treatment
	if ($csvarray[0][3] > 50) {                 // Use Baro  to determine whether raw data is metric or not
		$rawunits = "metric";                   // Depends on how the user's wunderground cookie is set
	} else {
		$rawunits = "english";
	}
	if ($debug)	echo $rawunits . " - " . $csvarray[0][3];		
} else {
	if ($csvarray[0][10] > 50) {                // Baro is in a different position in the other modes
		$rawunits = "metric";                   
	} else {
		$rawunits = "english";
	}
	if ($debug)	echo $rawunits . " - " . $csvarray[0][10];		
}

$wunderCSVstring = str_replace("&","&amp;",$wunderstring);	// So the link to the csv output will validate

if ($debug)	
{
    echo '<br>';
    echo '<br>';
  for($i=0;$i<count($csvarray); $i++)
  {
    for($j=0;$j<count($csvarray[$i]); $j++)
    {
      echo $csvarray[$i][$j].' ';
    }
    echo '   |<br>';
  }
}

$return['error'] = false;
$return['wudata'] = $csvarray;
echo json_encode($return);


}


function getcsvWithoutHanging($url)   {
	$numberOfSeconds=4;    
	error_reporting(0);
	$url = str_replace("http://","",$url);
	$urlComponents = explode("/",$url);
	$domain = $urlComponents[0];
	$resourcePath = str_replace($domain,"",$url);
	$socketConnection = fsockopen($domain, 80, $errno, $errstr, $numberOfSeconds);
		$cols = '';
		fputs($socketConnection, "GET $resourcePath HTTP/1.0\r\nHost: $domain\r\nUser-agent: $UA\r\nConnection: close\r\n\r\n");
		$rows = 0;
		while (!feof($socketConnection)) {
			$line = ereg_replace("<br>", "", fgets($socketConnection, 4096));  //One of these gets left in there somehow
			$cols[] = explode(",", $line);
		}   
	fclose ($socketConnection);
	for ($i = 0; $i<=11;$i++) {  // Remove the header info that came with download
		array_shift($cols);
	}	
	return($cols);
} 

function array_pure ($input) {  // Bad hack to pick out the lines w/o "\r\n" by picking known content
	$i = 0;
	while($i < count($input)) {
		if(  $input[$i][0][0] == "2" || $input[$i][0][0] == "T") {
			$return[] = $input[$i];
		}
	$i++;
	}
return $return;
} 


?>
