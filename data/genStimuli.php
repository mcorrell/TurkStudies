<?php
$experiment = $_POST['experiment'];
$condition = $_POST['condition'];
require_once('utils.php');
if($experiment==""){
  $experiment='Pilot';
}
if($condition==""){
  $condition='scatter';
}
echo "TYOP";
$dirname = $experiment.'/'.$condition;
$fname = imgByIndex($dirname,rand(0,numImgs($dirname)-1));
echo "YO".$fname;
?>


