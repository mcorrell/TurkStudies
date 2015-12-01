<?php
//n : number of points
//m : target slope
//s : bandwidth of error function
//mhat: actual slope
//b : actual intercept
//r : r-squared

$imgformat = ['n','m','s','mhat','b','r'];

function parseImg($img){
  $vars = split($img,'_');
  $properties = [];
  $properties['n'] = substr($vars[0],1);
  $properties['m'] = substr($vars[1],1);
  $properties['s'] = substr($vars[2],1);
  $properties['mh'] = substr($vars[3],1);
  $properties['b'] = substr($vars[4],1);
  $properties['r'] = substr($vars[5],1);
  return $properties; 
}

function numImgs($dir){
 $counter = 0;
  if($handle=opendir($dir)){
    while(false!==($file=readdir($handle))){
     if(substr($file,-3)=="png"){
       $counter++;
     }
    }
    closedir($handle);
  }
  return $counter;
}

function imgByIndex($dir,$fileIndex){
  $counter = 0;
  if($handle=opendir($dir)){
    while(false!==($file = readdir($handle))){
      if(substr($file,-3)=="png")
        $counter++;
      if($counter-1==$fileIndex)
        return $file;
    }
    closedir($handle);
  }
  return "";
}
?>
