// 完了・未完ボタンのクリック
function todoFinishedButton()
{
	var finishedButton = this;
	var bgcolor = $(finishedButton).css("background-color");
	if (bgcolor == "rgba(0, 255, 0, 0.25)") {
		$(finishedButton).css("background", "rgba(255,0,0,0.25)")
	} else {
		$(finishedButton).css("background", "rgba(0,255,0,0.25)")
	}
}


/*function login(fName){
	userid = document.ajaxForm.request.value;
	userid = document.ajaxForm.request.value;
	httpObj = createXMLHttpRequest(displayData);
	if (httpObj) {
		httpObj.open("POST","input.cgi",true);
		httpObj.send("userid="+encodeURI(userid));
	}
}

function get_todoList(userid)
{
	httpObj = createXMLHttpRequest(displayData);
	if (httpObj) {
		httpObj.open("POST","input.cgi",true);
		httpObj.send("userid="+encodeURI(userid));
	}
}

function loginResponse()
{
	if ((httpObj.readyState == 4) && 
	    (httpObj.status == 200)) {
		
		xmlData = httpObj.responseXML;

		//$("text").innerHTML = resultText;

	} else {
		//$("text").innerHTML = "<b>Loading...</b>";
	}
}

function todoListView()
{

}

function loginError(errStr)
{

}
*/
/*
    <script type="text/javascript">
    <!--
    document.writeln("<ul class='line'>");
    for (i=0; i<13; i++) {
        document.writeln("<li>");
        document.writeln("<div id='memo'>");
        document.writeln("<div id='text'>");
	document.writeln("<form method='POST' action='index.cgi'>");
	document.writeln("<input type='hidden' name='user'>");
	document.writeln("<input type='hidden' name='pass'>");
	document.writeln("<input type='text'>");
	document.writeln("\</form>");
	document.writeln("<\/div>");
        document.writeln("<div id='setting'><\/div>");
	document.writeln("<\/div>");
	document.writeln("<\/li>");
	}
	document.writeln("<\/ul>");    
     </script>
*/