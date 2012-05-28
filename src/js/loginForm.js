// 入力不可の有効化
function loginFormFixedOn()
{
	var loginForm = $('#loginForm');
	$(loginForm).children("#decisionButton").attr("disabled","disabed");
	$(loginForm).children('#useridField').attr("disabled","disabed");
	$(loginForm).children('#passwdField').attr("disabled","disabed");
}

// 入力不可の解除
function loginFormFixedOff()
{
	var loginForm = $('#loginForm');
	$(loginForm).children("#decisionButton").removeAttr("disabled");
	$(loginForm).children('#useridField').removeAttr("disabled");
	$(loginForm).children('#passwdField').removeAttr("disabled");
}

// 接続エラー
function loginConnectError(XMLHttpRequest, textStatus, errorThrown){
	var loginForm = $('#loginForm');
	$(loginForm).children('#resultField').text("通信に失敗しました");
//		+"responseText: " + XMLHttpRequest.responseText 
//		+ ", textStatus: " + textStatus 
//		+ ", errorThrown: " + errorThrown);
	loginFormFixedOff();
}

// 未入力によるエラー
function loginNotEnteredError() {
	var loginForm = $('#loginForm');
	$(loginForm).children('#resultField').text("ユーザ名とパスワードを入力してください。");
	loginFormFixedOff();
}

// ログイン処理の結果
function loginResponse(xmlData){
	var loginForm = $('#loginForm');
	var lists  = $(xmlData).children('lists');
	var result = $(lists).children('result');
	var error  = $(lists).children('error');

	if ($(result).text() == "login") {
		var listForm = $('#listForm');
		var dataForm = $('#dataForm');
		var menuForm = $('#menuForm');
		var userid = $(loginForm).children('#useridField').attr('value'); // get username
		var passwd = $(loginForm).children('#passwdField').attr('value'); // get password
		
		$(loginForm).hide();
		$(listForm).fadeIn();
		$(menuForm).fadeIn();
		$(dataForm).children('#useridData').attr('value', userid);
		$(dataForm).children('#passwdData').attr('value', passwd);
		todoListRequest();
	} else {
		$(loginForm).children("#resultField").text($(error).text());
	}
	loginFormFixedOff();
} 

// ユーザ登録フォームへ切り替えるボタンのクリック
function changeFormToRegister()
{
	var changeButton = this;
	var loginForm    = $('#loginForm');
	var registerForm = $('#registerForm');

	$(loginForm).hide();
	$(registerForm).css("display", "block");
	$(registerForm).children('#resultField').text("");
	registerFormFixedOff();
	$(registerForm).fadeIn();
}