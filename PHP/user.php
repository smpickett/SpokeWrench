<?php
/*==========================================================================*/
/* FILE: User.php                                                           */
/* Copyright (c) 2011 Stephen Pickett                                       */
/*==========================================================================*/


/*---- Settings ------------------------------------------------------------*/
require('SqlInfo.php');
date_default_timezone_set('UTC');
/*---- END OF Settings -----------------------------------------------------*/


/*---- Request Handler------------------------------------------------------*/
// Check and make sure a function was requested
if(!isset($_POST['func']))
{
  harderror("Missing function specification in POST [".__FILE__.":".__LINE__."][".__FUNCTION__."]");
  return;
}

// Call the appropriate function, or return an error
switch($_POST['func'])
{
  case 'Login':
    Login();
    break;
  case 'Signup':
    Signup();
    break;
  case 'CheckUsername':
    CheckUsername();
    break;
  case 'Challenge':
    Challenge();
    break;
  default:
    harderror("Invalid function specification in POST [".__FILE__.":".__LINE__."][".__FUNCTION__."]");
    break;
}
/*---- END OF Request Handler-----------------------------------------------*/

// 'Soft' errors
function harderror($msg)
{
  errorlog($msg);
  $return['error'] = true;
  $return['errormsguser'] = "[SERVER ERROR] ".$msg;
  echo json_encode($return);
}

function errorlog($msg)
{
}

function Login()
{
  harderror("Login not implemented yet");
}

function CheckUsername()
{
  // SANITIZE!
  $username = $_POST['user'];

  // Create a new user
  $user = new User($username, "", "");

  // Check if user exists
  $return['error'] = false;
  $return['exists'] = $user->exists();
  echo json_encode($return);
  return;
}

function Challenge()
{
  $return['error'] = false;
  $return['challenge'] = mt_rand()."".mt_rand();
  echo json_encode($return);
}

class User
{
  public $username;
  public $password;
  public $email;
  public $signup_date;

  public function __construct($user, $pass, $signupemail)
  {
    if(isset($user))
      $this->username = $user;
    if(isset($pass))
      $this->password = $pass;
    if(isset($signupemail))
      $this->email = $signupemail;

    $this->signup_date = time();
  }

  public function exists()
  {
    // Connect to the MySQL DB 
    include('SqlInfo.php');
    $db = mysql_connect($sqlHost, $sqlUser, $sqlPass);
    if(!$db)
    {
      errorlog("Could not connect to the MySql DB (".mysql_error().") [".__FILE__.":".__LINE__."][".__FUNCTION__."]");
      return false;
    }
    mysql_select_db($sqlDb, $db);

    // Query the database for the username
    $sqlSelect = "SELECT username FROM `".$sqlDb."`.`".$sqlTblUsers."`".
                  "WHERE username='".$this->username."'";
    $result = mysql_query($sqlSelect);
    $row = mysql_fetch_array($result);

    // Set the return value based on the presence of the username in the DB    
    $return = !is_null($row['username']);

    mysql_free_result($result);
    mysql_close($db);

    return $return;
  }

  public function add()
  {
    // Check if the username is already present in the database
    if($this->exists())
    {
      errorlog("User ".$this->user." already exists [".__FILE__.":".__LINE__."][".__FUNCTION__."]");
      return false;
    }

    // Connect to the MySQL DB 
    include('SqlInfo.php');
    $db = mysql_connect($sqlHost, $sqlUser, $sqlPass);
    if(!$db)
    {
      errorlog("Could not connect to the MySql DB (".mysql_error().") [".__FILE__.":".__LINE__."][".__FUNCTION__."]");
      return false;
    }
    mysql_select_db($sqlDb, $db);

    // Add the user
    $sqlInsert = "INSERT INTO `".$sqlDb."`.`".$sqlTblUsers."` (username, pass, email, dateSignup)
                   VALUES ('".$this->username."','".$this->password."','".$this->email."','".$this->signup_date."')";
    if(!mysql_query($sqlInsert, $db))
    {
      errorlog("Could not connect to the MySql DB (".mysql_error().") [".__FILE__.":".__LINE__."][".__FUNCTION__."]");
      mysql_close($db);
      return false;
    }

    // Add was successful
    mysql_close($db);
    return true;
  }
}

function Signup()
{
  // SANITIZE!
  if(!isset($_POST['user']) || !isset($_POST['pass']) || !isset($_POST['email']))
  {
    harderror("Missing variable specification in POST [".__FILE__.":".__LINE__."][".__FUNCTION__."]");
    return;
  }

  $username = $_POST['user'];
  $password = $_POST['pass'];
  $email = $_POST['email'];

  // Create a new user
  $user = new User($username, $password, $email);

  // If the user exists, quit   
  if($user->exists())
  {
    harderror("User '".$username."' exists and cannot be added [".__FILE__.":".__LINE__."][".__FUNCTION__."]");
    return;
  }

  // Add it to the database
  if(!$user->add())
  {
    harderror("Add user '".$username."' failed [".__FILE__.":".__LINE__."][".__FUNCTION__."]");
    return;
  }

  $return['error'] = false;
  echo json_encode($return);
}



?>
