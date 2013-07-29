/* refer to easing.js for all available easing options */

;(function ($, window, document, undefined) {

    // setup defaults
    var d = document,
        pluginName = "tslide",
        defaults = {
            dir: "images",
            images: [],
            pagination: "on",
            autoplay: "on",
            easing: "linear",
            movetime: 500,
            pausetime: 5000
        };

    // add preload functionality to jquery
    $.fn.preload = function() {
        this.each(function(){
            $('<img/>')[0].src = this;
        });
    };

    // instantiate plugin
    function Plugin( element, options ) {
        this.element = element;
        this.options = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;
        this.active = 0;
        this.init();
    }

    Plugin.prototype = {

        init: function() {

            // cache plugin element in a variable
            var base = this;

            // clear any previously generated html within slider container
            $(base.element).html();

            $.post("get.php", { dir: base.options.dir }, function(data) {

                base.options.images = data;

                // check to make sure there are actual images to load
                if ( !base.options.images.length  || !base.options.dir.length ) {
                    $(base.element).html("No images loaded! Check image directory name and/or contents.");
                    return;
                }

                // validate user options before proceeding
                base.validate(base.options);

                // create image container and append images via array generated from images directory
                var html = "<div id='img-container'/>";
                $(base.element).append(base.generateImages(base.options.images)).find("img").wrapAll(html);
                //$(base.element).append(html).find("#img-container").append(data);

                // set initially active index first image
                var activeImage = $("#img-container").children().eq(0);
                activeImage.addClass("active");

                // caption funcionality if any are specified in user options
                if ( base.options.captions ) {
                    html = "<div class='caption'/>";
                    $(base.element).append(html);
                    base.updateCaption();
                }

                // create and append pagination to slider container if the setting is enabled
                if ( base.options.pagination === "on" ) {

                    // store pagination container in our html variable to wrap around image index dots
                    html = "<div id='pagination'/>";

                    // generate image index dots and provide click functionality 
                    $(base.element).append(base.generatePagination(base.options.images)).find(".page-index").click(function() {

                        // store index of currently active image
                        base.active = $("#img-container").children(".active").index();


                        // only animate if the new index is different from the current
                        if ( base.active !== $(this).index() ) {

                            // if autoplay is enabled stop autoplay and wait until animation is complete from clicking an image index before starting again
                            if ( base.options.autoplay === "on" ) {
                                base.play(0);
                            }

                            // call animation effect
                            base.move(base.active, $(this).index());

                            // add active class to selected image index and remove any previous active classes from other indices
                            base.updateIndex("#pagination", $(this).index());
                            base.updateIndex("#img-container", $(this).index());

                            // set image index position after animation to clicked element occurs
                            base.active = $("#img-container").children(".active").index();

                            // update caption if enabled
                            if ( base.options.captions ) {
                                base.updateCaption();
                            }

                            // if autoplay is enabled restart autoplay after click animation and image index updates have concluded
                            if ( base.options.autoplay === "on" ) {
                                base.play(1);
                            }

                        }

                    }).wrapAll(html);

                    // set initially active index in pagination
                    $("#pagination").children().eq(0).addClass("active");

                }

                // extract image attributes from image information array
                var paths = [],
                    widths = [],
                    heights = [];
                for ( var i=0; i<base.options.images.length; i++ ) {
                    paths[i] = base.options.images[i]["path"];
                    widths[i] = base.options.images[i]["width"];
                    heights[i] = base.options.images[i]["height"];
                }

                // set slider container to height of absolutely positioned image container
                base.setInitialHeight(heights[0], "#slider", ".sliderstyle");

                // center dynamically generated pagination module horizontally via negative margin
                $("#pagination").css({
                    "margin-left" : "-" + $("#pagination").children().length + "em"
                });

                // show pagination module when mouse enters image container, otherwise hide it
                $("#slider").on({
                    mouseenter: function() {
                        $("#pagination").slideDown(200);
                    },
                    mouseleave: function() {
                        $("#pagination").fadeOut(400);
                    }
                });

                // play slider if autoplay is enabled in user options
                if ( base.options.autoplay === "on" ) {
                    base.play(1);
                }

                // resize slider element and image container
                $(window).resize(function() {
                    base.setHeight("#img-container", "#slider");
                });

                return this;

            }, "json");

        },

        // create an array of image nodes to be inserted into image container
        generateImages: function(imgsrc) {
            var nodeBuffer = [];

            for ( var i=0; i<imgsrc.length; i++ ) {
                nodeBuffer.push($(d.createElement("img")).attr("src", imgsrc[i]["path"]).attr("alt", imgsrc[i]["path"]));
            }
            return nodeBuffer;
        },

        // create an array of pagination index nodes to be inserted into pagination container
        generatePagination: function(imgsrc) {
            if ( this.options.pagination === "on" ) {
                var nodeBuffer = [];
                for ( var i=0; i<imgsrc.length; i++ ) {
                    nodeBuffer.push($("<div class='page-index'/>"));
                }
                return nodeBuffer;
            }
        },

        // set initial height of container to image height
        setInitialHeight: function(el1, el2, el3) {
            //var e1 = $(el1);
            var e2 = $(el2);
            //var e1w = e1.width();
            //var e1h = e1.height();
            //var r = e1w / e1h;
            var p = $(el3).innerWidth() - $(el3).width();
            e2.height(el1-p/2);
        },

        // set height of second element to that of first
        setHeight: function(el1, el2) {
            var e1 = $(el1);
            var e2 = $(el2);
            //var e1w = e1.width();
            var e1h = e1.height();
            //var r = e1w / e1h;
            e2.height(e1h);
        },

        // function to validate user settings
        validate: function (object) {
            if ( object.pagination !== "on" && object.pagination !== "off" ) {
                console.log("pagination of '" + object.pagination + "' is neither on nor off. Defaulting to on.");
                object.pagination = "on";
            }
            if ( object.autoplay !== "on" && object.autoplay !== "off" ) {
                console.log("autoplay of '" + object.autoplay + "' is neither on nor off. Defaulting to on.");
                object.autoplay = "on";
            }
            if ( isNaN(parseInt(object.movetime, 10)) || parseInt(object.movetime, 10) < 1 || parseInt(object.movetime, 10) > 10000 ) {
                console.log("movetime of '" + object.movetime + "' is not between 1 and 10000 ms. Defaulting to 500.");
                object.movetime = 500;
            }
            if ( isNaN(parseInt(object.pausetime, 10)) || parseInt(object.pausetime, 100) < 1 || parseInt(object.pausetime, 10) > 20000 ) {
                console.log("pausetime of '" + object.pausetime + "' is not between 0.1 and 20 s. Defaulting to 5000.");
                object.pausetime = 5000;
            }
            var valid;
            for ( var key in $.easing ) {
                valid = 0;
                if ( object.easing === key ) {
                    valid = 1;
                    return;
                }
            }
            if ( !valid ) {
                console.log("easing of '" + object.easing + "' is not a valid method. Defaulting to linear.");
                object.easing = "linear";
            }
        },

        // update element to active state and reset all other elements
        updateIndex: function(el, index) {
            $(el).children().eq(index).addClass("active").siblings().removeClass("active");
        },

        // autoplay functionality
        play: function(flag) {
            var base = this;
            if ( flag ) {
                iv = setInterval(function() {
                    if ( base.active === base.options.images.length-1 ) {
                        base.updateIndex("#img-container", 0);
                        base.updateIndex("#pagination", 0);
                        base.move(base.active, 0);
                        base.active = 0;
                    }
                    else {
                        base.updateIndex("#img-container", base.active+1);
                        base.updateIndex("#pagination", base.active+1);
                        base.move(base.active, base.active+1);
                        base.active += 1;
                    }
                    if ( base.options.captions ) {
                        base.updateCaption();
                    }
                }, base.options.pausetime);
            }
            else {
                clearInterval(iv);
            }
        },

        // animation effect for changing image indices
        move: function(cur, dest) {
            $("#img-container > img").animate({
                "right": "+=" + 100 * (dest-cur) + "%"
            }, this.options.movetime, this.options.easing);
        },

        // change caption out depending on currently active image index or hide if none exists for current index
        updateCaption: function() {
            var ind = $("#img-container").children(".active").index();
            if ( this.options.captions[ind+1] ) {
                $(".caption").html( "<p>" + this.options.captions[ind+1] + "</p>" );
                $(".caption").fadeIn(400);
            }
            else {
                $(".caption").fadeOut(400);
            }
        }
    };

    $.fn.tslide = function ( options ) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin( this, options ));
            }
        });
    };

})( jQuery, window, document );