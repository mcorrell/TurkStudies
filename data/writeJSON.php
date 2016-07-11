<?php
  $answer = json_decode($_POST['answer']);
  $path = 'data.csv';
  $file = fopen($path,'a');
  $keys = array_keys($answer);
  
  if(filesize($path)==0){
    $header = "";
    for($i = 0;$i<count($keys)-1;$i++){
      $header.=$keys[$i].',';
    }
    $header.=$keys[count($keys)-1].PHP_EOL;
    fwrite($file,header);
  }
 
  $line = "";
  for($i = 0;$i<count($keys)-1;$i++){
    $line.=$answer[$keys[$i]].',';
  }
  $line.=$answer[$keys[$i]].PHP_EOL;
  fwrite($file,line);
  fclose($file);
?>
