<?php
require_once('utils.php');
$file = fopen('data.csv','a');
$id = $_GET['workerId'];
if(!$id || $id=""){
  $id = $_SERVER['REMOTE_ADDR'];
}
$time = date('c');
$experiment = $_GET['experiment'];
$stim = $_GET['stim'];
$condition = $_GET['condition'];
$n = $_GET['n'];
$r1 = $_GET['r1'];
$r2 = $_GET['r2'];
$x1 = $_GET['x1'];
$x2 = $_GET['x2'];
$ans = $_GET['answer'];
$p = parseImg($stim);
$m = $p['mh'];
$b = $p['b'];
$correct = (($ans==-1 && $r1<$r2) || ($ans==1 && $r1>$r2)) ? 1:0;
$tanD1 = abs($m*$x1 - $r1 + $b)/sqrt( ($m*$m) + 1);
$tanD2 = abs($m*$x2 - $r2 + $b)/sqrt( ($m*$m) + 1);
$resid1 = abs( $r1 - (($m*$x1) + $b));
$resid2 = abs( $r2 - (($m*$x2) + $b));
$writestr = "$experiment,$condition,$id,$n,$time,$stim,$m,$b,$r1,$r2,$x1,$x2,$tanD1,$tanD2,$resid1,$resid2,$ans,$correct";
echo $writestr;
fwrite($file,$writestr.PHP_EOL);
fclose($file);
?>
