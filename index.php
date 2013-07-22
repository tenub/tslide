<!doctype html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta charset="utf-8">
<title>tslide: Simple Image Slider</title>
<link rel="stylesheet" href="assets/css/bootstrap.min.css">
<link rel="stylesheet" href="assets/css/bootstrap-responsive.min.css">
<link rel="stylesheet" href="assets/css/main.css">
<link href='http://fonts.googleapis.com/css?family=Oxygen:400,700,300&amp;subset=latin,latin-ext' rel='stylesheet' type='text/css'>
<!--[if lt IE 9]>
	<script src="http://html5shiv.googlecode.com/svn/divunk/html5.js"></script>
<![endif]-->
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
<script src="assets/js/bootstrap.min.js"></script>
<script src="assets/js/easing.min.js"></script>
<script src="assets/js/tslide.js"></script>
<script type="text/javascript">

	// create array of slider images from directory
	(function (window, document) {

		<?php

			// set image directory to load images from here
			$imgdir = "images/";

			echo "var slider_dir = '" . $imgdir . "';";

			if ($dir = opendir($imgdir)) {
				echo "var slider_images = [";
				while (false !== ($file = readdir($dir))) {
					list($fileName, $fileExt) = preg_split("/[\/.-]/", $file);
					if (($fileExt == "jpg") || ($fileExt == "gif") || ($fileExt == "png") || ($fileExt == "jpeg")) {
						echo "'" . $file . "',";
					}
				}
				echo "];";
				closedir($dir);
			}

		?>

		// preload slider images
		$.fn.preload = function() {
		    this.each(function(){
		        $('<img/>')[0].src = slider_dir+this;
		    });
		}

		$(slider_images).preload();

		$(window).load(function() {

			$("#slider").tslide({
				dir: slider_dir,
				images: slider_images,
				pagination: "on",
				autoplay: "on",
	            easing: "easeOutExpo",
	            movetime: 500,
	            pausetime: 5000
			});

		});
		
	})(window, document);

</script>
</head>
<body>
	<div class="container">
		<div id="title">tslide</div>
		<div class="sliderstyle">
			<div id="slider"></div>
		</div>
		<div id="content">tslide is a simple, lightweight image slider created using HTML/CSS3, JavaScript/jQuery, &amp; PHP that loops through an array of images seamlessly. Simply place your images in the images directory and tslide will generate a proper image slider so you can show your friends how cool you are!</div>
	</div>
</body>
</html>