<?php
$experiment = $_GET['dir'];
$condition = $_GET['cond'];

$dir = opendir($experiment.'/'.$condition.'/');

print $fname;
?>


