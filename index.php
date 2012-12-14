<!DOCTYPE html>
<html>
	<head>
		<meta charset=utf-8 />
		<title>Factory Land</title>
		<link rel="stylesheet" type="text/css" media="screen" href="main.css" />
		<!-- <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js"></script> -->
  		<script>!window.jQuery && document.write('<script src="jquery-1.6.2.min.js"><\/script>')</script> 
		<script type="text/javascript" src="touchable.min.js"></script>
		<script type="text/javascript" src="client.js"></script>
		<!--[if IE]>
			<script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
		<![endif]-->
		<script type="text/javascript" charset="utf-8">
			$(document).ready(function() {
				main();
			});
		</script>
		<style>
			
		</style>
	</head>
	<body>
		<div id="fps"></div>
		<div style="position: relative;">
			<canvas id="layer1" class="layer" style="z-index: 0"></canvas>
			<canvas id="layer2" class="layer" style="z-index: 1"></canvas>
			<canvas id="layer3" class="layer" style="z-index: 2"></canvas>
		</div>
	</body>
</html>