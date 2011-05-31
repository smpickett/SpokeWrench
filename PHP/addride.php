<?php

AddRide();

function AddRide()
{
  require('SQLinfo.php');

  /* Connect to the MySQL DB */
	$db = mysql_connect($mysql_host, $mysql_user, $mysql_pass);
	if(!$db)
	{
	  die('<br>Could not connect to MySQL db. Error:' . mysql_error());
	}
	mysql_select_db($mysql_db, $db);

  /* Find an existing ID */
  $sql_findID_Speedometer = "SELECT ".$mysql_tbl_id." FROM `".$mysql_db."`.`".$mysql_tbl_speedometer."`".
                        " WHERE time='".$_POST["DataSpeedometer_time"]."'".
                          " AND dist='".$_POST["DataSpeedometer_dist"]."'".
                          " AND cadence='".$_POST["DataSpeedometer_cadence"]."'";
  $result = mysql_query($sql_findID_Speedometer);
  $row = mysql_fetch_array($result);

  /* If ID was not found, add data */
  if(is_null($row['dataId']))
  {
    $sql_insert = "INSERT INTO `".$mysql_db."`.`".$mysql_tbl_speedometer."` (time, dist, cadence)
                   VALUES ('".$_POST["DataSpeedometer_time"]."','".$_POST["DataSpeedometer_dist"]."','".$_POST["DataSpeedometer_cadence"]."')";
    if(!mysql_query($sql_insert, $db))
    {
	    die('<br>Could not connect to MySQL db. Error:' . mysql_error());
    }
    $dataId_Speedometer = mysql_insert_id();
  }
  else
  {
    $dataId_Speedometer = $row['dataId'];
  }

  /* HR Monitor */
  /* Find an existing ID */
  $sql_findID_Heartmonitor = "SELECT ".$mysql_tbl_id." FROM `".$mysql_db."`.`".$mysql_tbl_heartmonitor."`".
                        " WHERE avehr='".$_POST["DataHrMonitor_avehr"]."'".
                          " AND maxhr='".$_POST["DataHrMonitor_maxhr"]."'".
                          " AND time='".$_POST["DataHrMonitor_time"]."'".
                          " AND calories='".$_POST["DataHrMonitor_calories"]."'";
  $result = mysql_query($sql_findID_Heartmonitor);
  $row = mysql_fetch_array($result);

  /* If ID was not found, add data */
  if(is_null($row['dataId']))
  {
    $sql_insert = "INSERT INTO `".$mysql_db."`.`".$mysql_tbl_heartmonitor."` (avehr, maxhr, time, calories)
                   VALUES ('".$_POST["DataHrMonitor_avehr"]."','".$_POST["DataHrMonitor_maxhr"]."','".$_POST["DataHrMonitor_time"]."','".$_POST["DataHrMonitor_calories"]."')";
    if(!mysql_query($sql_insert, $db))
    {
	    die('<br>Could not connect to MySQL db. Error:' . mysql_error());
    }
    $dataId_Heartmonitor = mysql_insert_id();
  }
  else
  {
    $dataId_Heartmonitor = $row['dataId'];
  }



  /* Now add the data to the main table, with the linked ID for the data */
  $sql_insert_main = "INSERT INTO `".$mysql_db."`.`".$mysql_tbl."` (date, time, route, fileID_route, type, dataID_Speedometer, dataID_Heartmonitor)
                      VALUES ('".$_POST["date"]."','".$_POST["time"]."','".$_POST["route"]."','".$_POST["route_file"]."','".$_POST["category"]."','".$dataId_Speedometer."','".$dataId_Heartmonitor."')";
  if(!mysql_query($sql_insert_main, $db))
  {
    die('<br>Could not connect to MySQL db. Error:' . mysql_error());
  }

  mysql_free_result($result);
  mysql_close($db);

$return['error'] = false;
$return['msg'] = 'HRMid:'.$dataId_Heartmonitor.'  SPDid:'.$dataId_Speedometer;

echo json_encode($return);

}
?>
