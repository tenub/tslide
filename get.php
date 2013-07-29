<?php

    $dir = $_POST["dir"];
    $images = glob($dir . "/*.{jpg,png,gif}", GLOB_BRACE);
    $image = array();
    $width = array();
    $height = array();
    for ($i=0; $i<count($images); $i++) { 
        list($width[$i], $height[$i]) = getimagesize($images[$i]);
        $image[$i] = array("path"=>$images[$i], "width"=>$width[$i], "height"=>$height[$i]);
    }
    $json = json_encode($image);
    print_r($json);

?>