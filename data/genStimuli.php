<?php
$experiment = $_GET['dir'];
$condition = $_GET['cond'];
require_once('utils.php');
$experiment='Pilot';
$condition='scatter';
$dirname = $experiment.'/'.$condition;
$fname = imgByIndex($dirname,rand(0,numImgs($dirname)-1));
echo $fname;
?>


