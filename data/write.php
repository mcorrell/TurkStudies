<?php
require_once('utils.php');
$file = fopen('data.csv','a');
$id = $_GET['workerId'];
if(!$id || $id==""){
  $id = $_SERVER['REMOTE_ADDR'];
}
$time = date('c');
$experiment = $_GET['experiment'];
$stim = $_GET['stim'];
$condition = $_GET['condition'];
$n = $_GET['n'];
$r1 = $_GET['r1'];
$r2 = $_GET['r2'];
$y1 = $_GET['y1'];
$y2 = $_GET['y2'];
$x1 = $_GET['x1'];
$x2 = $_GET['x2'];
$rt = $_GET['rt'];
$ans = $_GET['answer'];
$p = parseImg($stim);
$m = $p['mh'];
$b = $p['b'];
$correct = (($ans==-1 && abs($r1)<abs($r2)) || ($ans==1 && abs($r2)<abs($r1))) ? 1:0;
$tanD1 = abs($m*$x1 - $y1 + $b)/sqrt( ($m*$m) + 1);
$tanD2 = abs($m*$x2 - $y2 + $b)/sqrt( ($m*$m) + 1);
$writestr = "$experiment,$condition,$id,$n,$time,$stim,$m,$b,$y1,$y2,$x1,$x2,$tanD1,$tanD2,$r1,$r2,$ans,$correct,$rt";
echo $writestr;
fwrite($file,$writestr.PHP_EOL);
fclose($file);
?>
