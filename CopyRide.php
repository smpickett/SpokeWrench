<?php
/*==============================================================*/
/* File: CopyRide.php                                           */
/* Copyright (c) 2011, Stephen Pickett                          */
/*==============================================================*/

CopyRide();



function CopyRide()
{
  require('SQLinfo.php');

  
  /* Connect to the MySQL DB */
	$db = mysql_connect($mysql_host, $mysql_user, $mysql_pass);
	if(!$db)
	{
	  die('<br>Could not connect to MySQL db. Error:' . mysql_error());
	}
	mysql_select_db($mysql_db, $db);

  /* Now copy the data to the main table, with the linked ID for the data */
  $sql_insert_main = "INSERT INTO `WebDB_TEST`.`biketimes` (date, time, type, route, dataID_Speedometer, dataID_Heartmonitor) (SELECT date, time, type, route, dataID_Speedometer, dataID_Heartmonitor FROM `WebDB_TEST`.`biketimes` WHERE rideID=".$_POST["id"].")";
  if(!mysql_query($sql_insert_main, $db))
  {
    die('<br>Could not connect to MySQL db. Error:' . mysql_error());
  }

  $return['error'] = false;
  $return['row'] = $_POST['row'];
  $return['dataID'] = mysql_insert_id();

  mysql_close($db);
 

echo json_encode($return);
return;
}
?>
