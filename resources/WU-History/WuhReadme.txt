Readme for Wu-History.php
By Jim McMurry - jcweather.us - jmcmurry@mwt.net


All instructions for the script are in the comments at the beginning of the script.

One thing to note though is that search spiders can spend a lot of time going through this script because it calls itself with various different parameters.  The spiders just see those as different links and blindly follow them.  

It is wise to have a robots.txt file in the root of your web site to tell the spiders to not go there.  A couple ways to do this are:


User-agent: *
Disallow: /WUHistory/

or

User-agent: *
Disallow: /history.php
