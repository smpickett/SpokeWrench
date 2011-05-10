<?php
/*==============================================================*/
/* File: DrawTable.php                                          */
/* Copyright (c) 2011, Stephen Pickett                          */
/*==============================================================*/

DrawTable();

/*==============================================================*/
/* FUNCTION:  DrawTable()                                       */
/* PURPOSE:   Draws the HTML table                              */
/* ARGUMENTS: boolean useTestDB - if TRUE, then uses the test   */
/*            database                                          */
/*==============================================================*/
function DrawTable()
{
  require('SQLinfo.php');

	/* Connect to the MySQL DB */
	$db = mysql_connect($mysql_host, $mysql_user, $mysql_pass);
	if(!$db)
	{
	  die('Could not connect to MySQL db. Error:' . mysql_error());
	}
	mysql_select_db($mysql_db, $db);
	$data_route = mysql_query("SELECT * FROM ".$mysql_tbl);

  /* Draw Table with SQL data */
  echo '<table id="tableDataMain" class="tabledata">';
  echo '<thead>';
  echo '<tr id="rowHeader">';
    echo '<th class="hidden"></th>';    /* Ride ID */
    echo '<th class="hidden"></th>';           /* Icon column */
    echo '<th class="devices" colspan="4">Ride Data</th>';
    echo '<th class="devices" colspan="3">Speedometer Data</th>';
    echo '<th class="devices" colspan="4">Heart Rate Monitor Data</th>';
  echo '</tr>';

  echo '<tr id="rowHeader">';
    echo '<th class="hidden"></th>';    /* Ride ID */
    echo '<th class="hidden"></th>';           /* Icon column */
    echo '<th>Date</th>';
    echo '<th>Time</th>';
    echo '<th>Route</th>';
    echo '<th>Type</th>';
    echo '<th class="dataSeperationHeader">Ride Time</th>';
    echo '<th>Distance</th>';
    echo '<th>Ave Cadence</th>';
    echo '<th class="dataSeperationHeader">Total Time</th>';
    echo '<th>Calories</th>';
    echo '<th>Ave HR</th>';
    echo '<th>Max HR</th>';
  echo '</tr>';
  echo '</thead>';

    echo '<tbody class="scrollable">';
	while($dataarray = mysql_fetch_array($data_route))
	{
    echo '<tr>';
 
    /* Output the ride ID (hidden) */
    echo '<td class="hidden">'.$dataarray['rideID'].'</td>';

    /* Generate the icon actions */
    echo '<td class="hidden">';
    echo ' (icon)';
    echo '</td>';

	  /* Output the data from the main ride table */
    echo '<td>'.$dataarray['date'].'</td>';
	  echo '<td>'.$dataarray['time'].'</td>';
	  echo '<td>'.$dataarray['route'].'</td>';
	  echo '<td>'.$dataarray['type'].'</td>';

    /* Get data from the speedometer and output */
    $sqlstr = "SELECT * FROM `".$mysql_db."`.`".$mysql_tbl_speedometer."` WHERE dataId=".$dataarray['dataID_Speedometer'];
    $result = mysql_query($sqlstr);
    $dataarray_data = mysql_fetch_array($result);
	  echo '<td class="dataSeperation">'.$dataarray_data['time'].'</td>';
	  echo '<td>'.$dataarray_data['dist'].'</td>';
	  echo '<td>'.$dataarray_data['cadence'].'</td>';
    mysql_free_result($result);

    /* Get data from the heartratemonitor and output */
    $sqlstr = "SELECT * FROM `".$mysql_db."`.`".$mysql_tbl_heartmonitor."` WHERE dataId=".$dataarray['dataID_Heartmonitor'];
    $result = mysql_query($sqlstr);
    $dataarray_data = mysql_fetch_array($result);
	  echo '<td class="dataSeperation">'.$dataarray_data['time'].'</td>';
	  echo '<td>'.$dataarray_data['calories'].'</td>';
	  echo '<td>'.$dataarray_data['avehr'].'</td>';
	  echo '<td>'.$dataarray_data['maxhr'].'</td>';
    mysql_free_result($result);

    echo '</tr>';
  }
  echo '</tbody>';

  echo '</table>';

	mysql_free_result($data_route);
  mysql_close($db);
}
?>
