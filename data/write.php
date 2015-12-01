<?php
require_once('utils.php');
$file = fopen('data.csv','a');
$id = $_GET['workerId'];
if(!$id || $id=""){
  $id = $_SERVER['REMOTE_ADDR'];
}
$time = data(DATE_RFC2822);
$experiment = $_GET['experiment'];
$stimulus = $_GET['stim'];
$r1 = $_GET['r1'];
$r2 = $_GET['r2'];
$ans = $_GET['answer'];
$p = parseImg($stim);
fwrite($experiment,$id,$time,$stim,$p['mh'],$p['b'],$r1,$r2,$ans);
fclose($file);
?>
