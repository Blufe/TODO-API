$(document).ready(function(){
	$("div#setting").live("click", function(){
		var bgcolor = $(this).css("background-color");
		if (bgcolor == "rgba(0, 255, 0, 0.25)") {
			$(this).css("background", "rgba(255,0,0,0.25)")
		} else {
			$(this).css("background", "rgba(0,255,0,0.25)")
		}
	});

	$("input#changeForm_register").click(function () {
		$('form#loginForm').hide();
		$('input#changeForm_register').hide();
		$('form#registerForm').fadeIn();
		$('input#changeForm_login').fadeIn();		
	});

	$("input#changeForm_login").click(function () {
		$('form#registerForm').hide();
		$('input#changeForm_login').hide();
		$('form#loginForm').fadeIn();
		$('input#changeForm_register').fadeIn();		
	});

	$("form#loginForm").submit(function () {
		var userid = $('input#useridForm').attr('value'); // get username
		var passwd = $('input#passwdForm').attr('value'); // get password

		if (userid && passwd) {
			$.ajax({
				type: "POST",
				url: "./index.cgi",
				contentType: "text/html; charset=utf-8",
				dataType: "xml",
				data: "userid=" + userid + "&passwd=" + passwd,
				error: function(XMLHttpRequest, textStatus, errorThrown) { 
          				$('div#loginResult').text("Error: 通信に失敗しました。");
					//$('div#loginResult').addClass("error");
				}, // error 
        			success: function(data){
					if (data.error) {
						$('div#loginResult').text("Error: ユーザ名、またはパスワードが間違っています。");
						//$('div#loginResult').addClass("error");
					} // if
					else { // login was successful
						$('form#loginForm').hide();
						$('div#loginResult').text("LOGIN");
						//$('div#loginResult').addClass("success");
					} //else
				} // success
			}); // ajax
		} // if
		else {
			$('div#loginResult').text("ユーザ名とパスワードを入力してください。");
			//$('div#loginResult').addClass("error");
		} // else
		//$('div#loginResult').fadeIn();
		return false;
	});
});

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