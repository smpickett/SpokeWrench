/*==========================================================================*/
/* FILE: User.js                                                            */
/* Copyright (c) 2011 Stephen Pickett                                       */
/*==========================================================================*/
var User = {};
User.LogIn = {};
User.SignUp = {};
User.Security = {};

/*---- Settings ------------------------------------------------------------*/
var loginscript = "/PHP/user.php";
/*---- END OF Settings -----------------------------------------------------*/

/*--------------------------------------------------------------------------*/
/* NAMESPACE: User                                                          */
/*  Provides generic functions for global use                               */
/*--------------------------------------------------------------------------*/
User.servererror = function(xml)
{
  // Inform the user that the server was unable to process the form
  User.error("server error");
};

User.error = function(err)
{
  // Show the desired error message
  $('div#userinfo').text(err);
};


/*--------------------------------------------------------------------------*/
/* NAMESPACE: User.LogIn                                                    */
/*  Handles the login procedure, and all tasks related to the login page    */
/*--------------------------------------------------------------------------*/
User.LogIn.focus = function()
{
  // Focus the user input box. Some browsers don't do this automatically
  $('input#user').focus();
};

User.LogIn.login = function()
{
  var username = $('input#user').val();
  var pass = $('input#pass').val();

  if((username === "") || (pass === ""))
  {
    // Return an error if either the username or password feild is empty
    $('div#userinfo').removeClass('hidden');
    $('div#userinfo').text("invalid username or password");
    return false;
  }
  else
  {
    // Inform the user that the login process has started
    $('div#userinfo').removeClass('hidden');
    $('div#userinfo').text("submitting...");

    // Call the PHP login script
    // (Note: password is sent hashed)
    $.ajax({
      type:'POST',
      url:loginscript,
      data: { func: 'GetChallenge' },
      dataType:'json',
      success: User.LogIn.login2,
      error: User.servererror
    });

    return false;
  }
};

User.LogIn.login2 = function(data)
{
  var username = $('input#user').val();
  var pass = $('input#pass').val();

  // Check to make sure that the server actually returned something
  if(data == undefined || data.error == undefined)
  {
    $('div#user_info').text("server error");
    return;
  }

  // Check to make sure that the sever didn't encounter an error
  if(data.error)
  {
    // Report the error message to the user
    $('div#user_info').text(data.errormsguser);
    return;
  }

  // Call the PHP login script
  // (Note: password is sent hashed)
  $.ajax({
    type:'POST',
    url:loginscript,
    data: { func: 'Login', user: username, pass: User.Security.sha1Hash(User.Security.sha1Hash(pass)+data.challenge) },
    dataType:'json',
    success: User.LogIn.redirect,
    error: User.servererror
  });
}

User.LogIn.redirect = function(cred)
{
  // Check to make sure that the server actually returned something
  if(cred == undefined)
  {
    User.servererror();
    return;
  }

  // Check to make sure that the sever didn't encounter an error
  if(cred.error)
  {
    // Report the error message to the user
    User.error(cred.errormsguser);
    return;
  }

  // It seems that everything is in order, redirect the user!
  window.location = "map.html";
};


/*--------------------------------------------------------------------------*/
/* NAMESPACE: User.SignUp                                                   */
/*  Handles the signup procedure, and all tasks related to the signup page  */
/*--------------------------------------------------------------------------*/

// Keep track if the inputs are valid
User.SignUp.validEmail = false;
User.SignUp.validUser = false;
User.SignUp.validPass = false;

User.SignUp.focus = function()
{
  // Focus the user input box. Some browsers don't do this automatically
  $('input#user').focus();
};

User.SignUp.checkuser = function(wait)
{
  var username = $('input#user').val();

  // If nothing is specified in the user box, clear errors and exit
  if(username === "")
  {
    $('td#user_info').text("");
    if(!$('td#user_info').hasClass('hidden'))
      $('td#user_info').addClass('hidden');
    User.SignUp.validUser = false;
    return;
  }

  // Call the PHP login script
  $.ajax({
    type:'POST',
    url:loginscript,
    async:!wait,
    cache:false,
    data: { func: 'CheckUsername', user: username }, 
    dataType:'json',
    success: function(data)
    {
      // Show the information field
      $('td#user_info').removeClass('hidden');

      // Check to make sure that the server actually returned something
      if(data == undefined || data.error == undefined)
      {
        $('td#user_info').text("server error");
        User.SignUp.validUser = false;
        return;
      }

      // Check to make sure that the sever didn't encounter an error
      if(data.error)
      {
        // Report the error message to the user
        $('td#user_info').text(data.errormsguser);
        User.SignUp.validUser = false;
        return;
      }

      // It seems that everything is in order, inform the user!
      if(data.exists)
      {
        $('td#user_info').text("username '" + username + "' is taken");
        User.SignUp.validUser = false;
      }
      else
      {
        $('td#user_info').text("username '" + username + "' is available!");
        User.SignUp.validUser = true;
      }
    },
    error: function(xml)
    {
      $('td#user_info').removeClass('hidden');
      $('td#user_info').text("server error");
      User.SignUp.validUser = false;
      return;
    }
  });

  return;
};

User.SignUp.checkpass = function()
{
  var pass1 = $('input#pass1').val();
  var pass2 = $('input#pass2').val();

  if((pass1 === "") || (pass2 == ""))
  {
    // If nothing is specified in the password boxes, clear errors and exit
    $('td#pass2_info').text("");
    if(!$('td#pass2_info').hasClass('hidden'))
      $('td#pass2_info').addClass('hidden');
    User.SignUp.validPass = false;
  }
  else if(pass1 !== pass2)
  {
    // If the passwords don't match, indicate to user
    $('td#pass2_info').removeClass('hidden');
    $('td#pass2_info').text('passwords do not match');
    User.SignUp.validPass = false;
  }
  else if((pass1.length < 6) || (pass2.length < 6))
  {
    // If the password is shorter than 6 characters, indicate to user
    $('td#pass2_info').removeClass('hidden');
    $('td#pass2_info').text('passwords is shorter than 6 characters');
    User.SignUp.validPass = false;
  }
  else
  {
    // If the passwords match, clear all errors
    $('td#pass2_info').text("");
    if(!$('td#pass2_info').hasClass('hidden'))
      $('td#pass2_info').addClass('hidden');
    User.SignUp.validPass = true;
  }
  return;
}
  
User.SignUp.checkemail = function()
{
  var email = $('input#email').val();
  var emailRegEx = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

  if(email === "")
  {
    // If nothing is specified in the email boxe, clear errors and exit
    $('td#email_info').text("");
    if(!$('td#email_info').hasClass('hidden'))
      $('td#email_info').addClass('hidden');
    User.SignUp.validEmail = false;
    return;
  }
  
  if(email.search(emailRegEx) == -1)
  {
    // Valide the email address through RegEx
    $('td#email_info').removeClass('hidden');
    $('td#email_info').text("email is not in correct format");
    User.SignUp.validEmail = false;
  }
  else
  {
    // If the email is valid, remove all errors
    $('td#email_info').text("");
    if(!$('td#email_info').hasClass('hidden'))
      $('td#email_info').addClass('hidden');
    User.SignUp.validEmail = true;
  }

  return;
};

User.SignUp.signup = function()
{
  // Revalidate all fields
  // specify that we must wait for the username checking
  User.SignUp.checkuser(true);
  User.SignUp.checkpass();
  User.SignUp.checkemail();

  // Make sure all fields are valid before even trying to submit
  if(!User.SignUp.validUser)
  {
    $('div#userinfo').removeClass('hidden');
    User.error("username is not valid");
    return;
  }
  if(!User.SignUp.validPass)
  {
    $('div#userinfo').removeClass('hidden');
    User.error("password is not valid");
    return;
  }
  if(!User.SignUp.validEmail)
  {
    $('div#userinfo').removeClass('hidden');
    User.error("email is not valid");
    return;
  }
    
  // Client side checks out, proceed with signup reqest
  var user = $('input#user').val();
  var pass = $('input#pass1').val();
  var email = $('input#email').val();

  // Inform the user that the signup process has started
  $('div#userinfo').removeClass('hidden');
  $('div#userinfo').text("submitting...");

  // Call the PHP signup script
  $.ajax({
    type:'POST',
    url:loginscript,
    data: { func: 'Signup', user: user, pass: User.Security.sha1Hash(pass), email: email }, 
    dataType:'json',
    success: User.SignUp.redirect,
    error: User.servererror
  });

  return false;
};

User.SignUp.redirect = function(cred)
{
  // Check to make sure that the server actually returned something
  if(cred == undefined)
  {
    User.servererror();
    return;
  }

  // Check to make sure that the sever didn't encounter an error
  if(cred.error)
  {
    // Report the error message to the user
    User.error(cred.errormsguser);
    return;
  }

  // It seems that everything is in order, redirect the user!
  window.location = "map.html";
};


/*--------------------------------------------------------------------------*/
/* NAMESPACE: User.Security                                                 */
/*  Provides security functions for global use                              */
/*--------------------------------------------------------------------------*/
User.Security.sha1Hash = function(msg)
{
     // constants [§4.2.1]
     var K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];


     // PREPROCESSING 
  
     // add trailing '1' bit to string [§5.1.1]
     msg += String.fromCharCode(0x80); 

     // convert string msg into 512-bit/16-integer 
     // blocks arrays of ints [§5.2.1]

     // long enough to contain msg plus 2-word length
     var l = Math.ceil(msg.length/4) + 2;  
     // in N 16-int blocks
     var N = Math.ceil(l/16);             
     var M = new Array(N);
     for (var i=0; i<N; i++) {
         M[i] = new Array(16);
         // encode 4 chars per integer, big-endian encoding
         for (var j=0; j<16; j++) {  
             M[i][j] = (msg.charCodeAt(i*64+j*4)<<24) | 
                           (msg.charCodeAt(i*64+j*4+1)<<16) | 
                           (msg.charCodeAt(i*64+j*4+2)<<8) | 
                           (msg.charCodeAt(i*64+j*4+3));
         }
     }
     // add length (in bits) into final pair of 32-bit integers 
     // (big-endian) [5.1.1]
     // note: most significant word would be 
     // ((len-1)*8 >>> 32, but since JS converts
     // bitwise-op args to 32 bits, we need to simulate 
     // this by arithmetic operators
     M[N-1][14] = ((msg.length-1)*8) / Math.pow(2, 32); 
     M[N-1][14] = Math.floor(M[N-1][14]);
     M[N-1][15] = ((msg.length-1)*8) & 0xffffffff;

     // set initial hash value [§5.3.1]
     var H0 = 0x67452301;
     var H1 = 0xefcdab89;
     var H2 = 0x98badcfe;
     var H3 = 0x10325476;
     var H4 = 0xc3d2e1f0;

     // HASH COMPUTATION [§6.1.2]

     var W = new Array(80); var a, b, c, d, e;
     for (var i=0; i<N; i++) {

         // 1 - prepare message schedule 'W'
         for (var t=0;  t<16; t++) 
             W[t] = M[i][t];
         for (var t=16; t<80; t++) 
             W[t] = User.Security.ROTL(W[t-3] ^ W[t-8] ^ W[t-14] ^ W[t-16], 1);

         // 2 - initialise five working variables 
         // a, b, c, d, e with previous hash value
         a = H0; b = H1; c = H2; d = H3; e = H4;

         // 3 - main loop
         for (var t=0; t<80; t++) {
             // seq for blocks of 'f' functions and 'K' constants
             var s = Math.floor(t/20); 
             var T = (User.Security.ROTL(a,5) + User.Security.f(s,b,c,d) + e + K[s] + W[t]) 
                           & 0xffffffff;
             e = d;
             d = c;
             c = User.Security.ROTL(b, 30);
             b = a;
             a = T;
         }

         // 4 - compute the new intermediate hash value
        
         // note 'addition modulo 2^32'
         H0 = (H0+a) & 0xffffffff;  
         H1 = (H1+b) & 0xffffffff; 
         H2 = (H2+c) & 0xffffffff; 
         H3 = (H3+d) & 0xffffffff; 
         H4 = (H4+e) & 0xffffffff;
     }

     return H0.toHexStr() + H1.toHexStr() + H2.toHexStr() + 
                 H3.toHexStr() + H4.toHexStr();
}

//
// function 'f' [§4.1.1]
//
User.Security.f = function(s, x, y, z) 
{
     switch (s) {
     case 0: return (x & y) ^ (~x & z);           // Ch()
     case 1: return x ^ y ^ z;                    // Parity()
     case 2: return (x & y) ^ (x & z) ^ (y & z);  // Maj()
     case 3: return x ^ y ^ z;                    // Parity()
     }
}

//
// rotate left (circular left shift) value x 
// by n positions [§3.2.5]
//
User.Security.ROTL = function(x, n)
{
     return (x<<n) | (x>>>(32-n));
}

//
// extend Number class with a tailored hex-string method 
//   (note toString(16) is implementation-dependant, and 
//   in IE returns signed numbers when used on full words)
//
 Number.prototype.toHexStr = function()
{
     var s="", v;
     for (var i=7; i>=0; i--) { 
         v = (this>>>(i*4)) & 0xf; s += v.toString(16); }
     return s;
}

