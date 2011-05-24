<?php
/*==============================================================*/
/* File: DrawAddRideTable.php                                   */
/* Copyright (c) 2011, Stephen Pickett                          */
/*==============================================================*/

DrawAddRideTable();

/*==============================================================*/
/* FUNCTION:  DrawAddRideTable()                                */
/* PURPOSE:   Draws the HTML table to add rides                 */
/*==============================================================*/
function DrawAddRideTable()
{
  /* Get a list of available routes */
  $tcxRoutes = glob("./Routes/*.*");

  echo "<form onSubmit='return Submit_AddRide()'>";
  /* -------------------------------- */
  /* Draw the Add Ride table entry    */
  /* -------------------------------- */
  echo "<table class='addeditride'>";
  echo "  <tr><th colspan='2' id='AddEditRideTitle'>Add Ride</th></tr>";
  /* --- Basic Data ----------------- */
  echo "  <tr><td colspan='2' class='dataHeader'>Basic Data</td></tr>";
  echo "  <tr><td>Date:</td><td class='dataEntry'><input type='text' id='date' size='18'/></td></tr>";
  echo "  <tr><td>Time:</td><td class='dataEntry'><input type='text' id='time' size='8'/></td></tr>";
  echo "  <tr><td>Route Name:</td><td class='dataEntry'><input type='text' id='route' size='35'/></td></tr>";
  echo "  <tr><td>Route File:</td><td class='dataEntry'><select id='route_file'>";
    echo "    <option value='NONE'></option>";
  foreach($tcxRoutes as $file)
  {
    /*
    $info = pathinfo($file);
    echo "    <option value=".basename($file,'.'.$info['extension']).">".basename($file,'.'.$info['extension'])."</option>";
    */
    echo "    <option value=".basename(str_replace(" ","_",$file)).">".basename($file)."</option>";
  }
  echo "  </select></td></tr>";
  echo "  <tr>
            <td>Type:</td>
            <td class='dataEntry'>
              <select id='type'>
              <option value='Commute'>Commute</option>
              <option value='Training'>Training</option>
              <option value='Race'>Race</option>
              <option value='Leisure'>Leisure</option>
            </td>
          </tr>";
  /* --- Devices -------------------- */
  echo "  <tr><td colspan='2' class='dataHeader'><input type='checkbox' id='SPD' checked/>Speedometer Data</td></tr>";
  echo "  <tr><td>Ride time:</td><td class='dataEntry'><input type='text' id='SPD_time' size='8'/></td></tr>";
  echo "  <tr><td>Distance:</td><td class='dataEntry'><input type='text' id='SPD_dist' size='4'/></td></tr>";
  echo "  <tr><td>Ave cadence:</td><td class='dataEntry'><input type='text' id='SPD_avecad' size='3'/></td></tr>";
  /* --- Devices -------------------- */
  echo "  <tr><td colspan='2' class='dataHeader'><input type='checkbox' id='HRM' checked/>Heartrate Monitor Data</td></tr>";
  echo "  <tr><td>Total time:</td><td class='dataEntry'><input type='text' id='HRM_time' size='8'/></td></tr>";
  echo "  <tr><td>Calories:</td><td class='dataEntry'><input type='text' id='HRM_cals' size='4'/></td></tr>";
  echo "  <tr><td>Ave HR:</td><td class='dataEntry'><input type='text' id='HRM_avehr' size='3'/></td></tr>";
  echo "  <tr><td>Max HR:</td><td class='dataEntry'><input type='text' id='HRM_maxhr' size='3'/></td></tr>";
  /* --- Entry ---------------------- */
  echo "  <tr><td colspan='2' class='dataheader'>
    <input type='button' value='Add' id='AddEditRideButton' onClick='Submit_AddRide();'/>
    <input type='reset' value='Cancel' id='AddEditCancelButton' onClick='AddEditCancel();'/>
    </td></tr>";

  echo "</table>";
  echo "</form>";
}


?>
