<?php
  echo $_GET['answer']."\n";
  $answer = json_decode($_GET['answer'],true);
  //$answer = json_decode('{"sigma":"0.05","sign":"","type":"line","m":"0.2","src":"https://homes.cs.washington.edu/~mcorrell/TurkStudies/data/Exp1/line/scatter/S0.05m0.2.png","isValidation":false,"answer":"0.16","error":"0.04","unsignedError":0.04,"index":0}',true);
  $cleaned = $_GET['clean'];
  if($cleaned=='true'){
    $path = 'cleandata.csv';
  }
  else{
    $path = 'data.csv';
  }
  $file = fopen($path,'a');
  $keys = array_keys($answer); 
  if(filesize($path)==0){
    $header = "";
    for($i = 0;$i<count($keys)-1;$i++){
      $header.=$keys[$i].',';
    }
    $header.=$keys[count($keys)-1].PHP_EOL;
    fwrite($file,$header);
    echo $header."\n";
  }
  echo "Writing line: \n";
  $line = "";
  for($i = 0;$i<count($keys)-1;$i++){
    $line.=$answer[$keys[$i]].',';
  }
  $line.=$answer[$keys[$i]].PHP_EOL;
  echo $line."\n";
  fwrite($file,$line);
  fclose($file);
  echo "Done";
?>
