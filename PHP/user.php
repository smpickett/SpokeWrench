<?php
/*==========================================================================*/
/* FILE: User.php                                                           */
/* Copyright (c) 2011 Stephen Pickett                                       */
/*==========================================================================*/

/*{{{1---- Settings --------------------------------------------------------*/
require('SqlInfo.php');
date_default_timezone_set('UTC');
session_start();
/*-------- END OF Settings -------------------------------------------------*/


/*{{{1---- Request Handler--------------------------------------------------*/
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
  case 'GetChallenge':
    Challenge();
    break;
  default:
    harderror("Invalid function specification in POST [".__FILE__.":".__LINE__."][".__FUNCTION__."]");
    break;
}
/*---- END OF Request Handler-----------------------------------------------*/


/*{{{1- User Class ----------------------------------------------------------*/
class User
{
  public $username;
  public $password;
  public $email;
  public $signup_date;

  //
  // Creates a new user
  // (converts the username to lower case)
  //
  public function __construct($user, $pass, $signupemail)
  {
    if(isset($user))
      $this->username = strtolower($user);
    if(isset($pass))
      $this->password = $pass;
    if(isset($signupemail))
      $this->email = $signupemail;

    $this->signup_date = time();
  }

  //
  // Check if the user exists
  // Returns: TRUE if the user exists, FALSE otherwise, or if error
  //
  public function exists()
  {
    errorlog("Checking if exists");

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

  //
  // Check if the password matches
  // Args: $challenge = the challenge number that was previously provided to the client
  // Returns: TRUE if the password matches, FALSE otherwise, or if error
  //
  public function checkpass($challenge)
  {
    errorlog("Checking pass");

    // Connect to the MySQL DB 
    include('SqlInfo.php');
    $db = mysql_connect($sqlHost, $sqlUser, $sqlPass);
    if(!$db)
    {
      errorlog("Could not connect to the MySql DB (".mysql_error().") [".__FILE__.":".__LINE__."][".__FUNCTION__."]");
      return false;
    }
    mysql_select_db($sqlDb, $db);

    // Query the database for the password
    $sqlSelect = "SELECT pass FROM `".$sqlDb."`.`".$sqlTblUsers."`".
                  "WHERE username='".$this->username."'";
    $result = mysql_query($sqlSelect);
    $row = mysql_fetch_array($result);

    errorlog("provided: ".$this->password.", check: ".sha1($row['pass'].$challenge));
    
    // use lower case for hexadecimal string compares
    if(strtolower(sha1($row['pass'].$challenge)) == strtolower($this->password))
      $return = true;
    else
      $return = false;

    mysql_free_result($result);
    mysql_close($db);

    return $return;
  }

  //
  // Adds a user to the database
  // Returns: TRUE if the addition was successful, FALSE otherwise
  //
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
/*-------- END OF User Class -----------------------------------------------*/


/*{{{1---- Error Functions -------------------------------------------------*/
function harderror($msg)
{
  errorlog($msg);
  $return['error'] = true;
  $return['errormsguser'] = "[SERVER ERROR] ".$msg;
  echo json_encode($return);
}

function errorlog($msg)
{
  return;
  if(is_null($_SESSION['log']))
    $_SESSION['log'] = "";
  $_SESSION['log'] = $_SESSION['log']." | ".$msg;
}
/*-------- END OF Error Functions ------------------------------------------*/

/*{{{1---- Functions -------------------------------------------------------*/
function Login()
{
  if(!isset($_POST['user']) || !isset($_POST['pass']))
  {
    harderror("Missing variable specification in POST [".__FILE__.":".__LINE__."][".__FUNCTION__."]");
    return;
  }

  $username = $_POST['user'];
  $password = $_POST['pass'];

  // Create a new user
  $user = new User($username, $password, null);

  // If the user doesn't exist, quit   
  if(!$user->exists())
  {
    $return['error'] = true;
    $return['errormsguser'] = "Invalid username or password";
    echo json_encode($return);
    return;
  }

  // User exists, check the password
  if(!$user->checkpass($_SESSION['challenge']))
  {
    $return['error'] = true;
    $return['errormsguser'] = "Invalid username or password";
    echo json_encode($return);
    return;
  }

  $return['error'] = false;
  echo json_encode($return);
  return;
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
  $_SESSION['challenge'] = mt_rand()."".mt_rand();
  $return['error'] = false;
  $return['challenge'] = $_SESSION['challenge'];
  echo json_encode($return);
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
/*-------- Error Functions -------------------------------------------------*/



?>
