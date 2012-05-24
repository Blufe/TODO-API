$(document).ready(function(){
	$("div#setting").live("click", function(){
		var bgcolor = $(this).css("background-color");
		if (bgcolor == "rgba(0, 255, 0, 0.25)") {
			$(this).css("background", "rgba(255,0,0,0.25)")
		} else {
			$(this).css("background", "rgba(0,255,0,0.25)")
		}
	});

	$("div#container").draggable({});
});

