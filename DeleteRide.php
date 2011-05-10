<?php

DeleteRide();

function DeleteRide()
{
  require('SQLinfo.php');

  /* Connect to the MySQL DB */
	$db = mysql_connect($mysql_host, $mysql_user, $mysql_pass);
	if(!$db)
	{
	  die('<br>Could not connect to MySQL db. Error:' . mysql_error());
	}
	mysql_select_db($mysql_db, $db);

  /* Delete the selected rides */
  mysql_select_db("WebDB_TEST", $db);
  mysql_query("DELETE FROM biketimes WHERE rideID='".$_POST["id"]."'");
  mysql_close($db);
 
  /*header('Location:http://localhost/v2.0/index.html');*/

}
?>

