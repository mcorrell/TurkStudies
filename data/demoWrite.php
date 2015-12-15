<?php
require_once('utils.php');
$file = fopen('demo.csv','a');
$id = $_POST['workerId'];
$experiment = $_POST['experiment'];
$gender = $_POST['gender'];
$age = $_POST['age'];
$education = $_POST['education'];
$experience = $_POST['experience'];
$comments = $_POST['comments'];
$comments = str_replace(",","_",$comments);

$time = date('c');
$ip = $_SERVER['REMOTE_ADDR'];
if(!$id || $id=""){
  $id = $ip;
}
$writestr = "$time,$experiment,$id,$ip,$gender,$age,$education,$experience,$comments;
echo $writestr;
fwrite($file,$writestr.PHP_EOL);
fclose($file);
?>
