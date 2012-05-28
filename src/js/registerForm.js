// 入力不可の有効化
function registerFormFixedOn()
{
	var registerForm = $('#registerForm');
	$(registerForm).children('#decisionButton').attr("disabled","disabed");
	$(registerForm).children('#useridField').attr("disabled","disabed");
	$(registerForm).children('#passwdField').attr("disabled","disabed");
}

// 入力不可の解除
function registerFormFixedOff()
{
	var registerForm = $('#registerForm');
	$(registerForm).children('#decisionButton').removeAttr("disabled");
	$(registerForm).children('#useridField').removeAttr("disabled");
	$(registerForm).children('#passwdField').removeAttr("disabled");
}

// 接続エラー
function registerConnectError(XMLHttpRequest, textStatus, errorThrown){
	var registerForm = $('#registerForm');
	$(registerForm).children('#resultField').text("通信に失敗しました");
	registerFormFixedOff(registerForm);
}

// 未入力によるエラー
function registerNotEnteredError() {
	var registerForm = $('#registerForm');
	$(registerForm).children('#resultField').text("ユーザ名とパスワードを入力してください。");
	registerFormFixedOff(registerForm);
}

// ユーザ登録処理の結果
function registerResponse(xmlData){
	var registerForm = $('#registerForm');
	var lists  = $(xmlData).children('lists');
	var result = $(lists).children('result');
	var error  = $(lists).children('error');

	if ($(result).text() == "register") {
		$(registerForm).children("#resultField").text(
			"登録完了しました。"
		);
	} else {
		$(registerForm).children("#resultField").text(
			$(error).text()
		);
		registerFormFixedOff();
	}
} 

// ログインフォームへ切り替えるボタンのクリック
function changeFormToLogin()
{
	var changeButton = this;
	var registerForm = $('#registerForm');
	var loginForm    = $('#loginForm');

	$(registerForm).hide();
	$(loginForm).css("display", "block");
	$(loginForm).children('#resultField').text("");
	loginFormFixedOff();
	$(loginForm).fadeIn();
}
