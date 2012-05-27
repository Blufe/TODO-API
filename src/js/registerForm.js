// ログインフォームへ切り替えるボタンのクリック
function changeFormToLogin()
{
	var changeButton = this;
	var registerForm = $(changeButton).parent();
	var mainBlock    = $(registerForm).parent();
	var loginForm    = $(mainBlock).children('form#loginForm');

	$(registerForm).hide();
	$(loginForm).css("display", "block");
	$(loginForm).children('div#connectionResult').text("");
	loginFormFixedOff(loginForm);
	$(loginForm).fadeIn();
}


// ユーザ登録フォームのサブミットイベント
function registerRequest() 
{
	var registerForm = this;
	var userid = $(registerForm).children('input#useridForm').attr('value'); // get username
	var passwd = $(registerForm).children('input#passwdForm').attr('value'); // get password

	registerFormFixedOn(registerForm);
	if (userid && passwd) {
		$.ajax({
			type: "POST",
			url: "./register.cgi",
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			dataType: "xml",
			data: "userid=" + userid + "&passwd=" + passwd,
			error: function (XMLHttpRequest, textStatus, errorThrown) {
					registerConnectError(registerForm, XMLHttpRequest, textStatus, errorThrown);
				},
       			success: function (xmlData) {
					registerResponse(registerForm, xmlData);
				}
		}); // ajax
	}
	else {
		registerNotEnteredError(registerForm);
	}

	return false; // 実際にsubmitするのを防ぐ
}

// 入力不可の有効化
function registerFormFixedOn(registerForm)
{
	$(registerForm).children("input#decisionButton").attr("disabled","disabed");
	$(registerForm).children('input#useridForm').attr("disabled","disabed");
	$(registerForm).children('input#passwdForm').attr("disabled","disabed");
}

// 入力不可の解除
function registerFormFixedOff(registerForm)
{
	$(registerForm).children("input#decisionButton").removeAttr("disabled");
	$(registerForm).children('input#useridForm').removeAttr("disabled");
	$(registerForm).children('input#passwdForm').removeAttr("disabled");
}

// 接続エラー
function registerConnectError(registerForm, XMLHttpRequest, textStatus, errorThrown){
	$(registerForm).children('div#connectionResult').text("通信に失敗しました");
	registerFormFixedOff(registerForm);
}

// 未入力によるエラー
function registerNotEnteredError(registerForm) {
	$(registerForm).children('div#connectionResult').text("ユーザ名とパスワードを入力してください。");
	registerFormFixedOff(registerForm);
}

// ユーザ登録処理の結果
function registerResponse(registerForm, xmlData){
	var lists  = $(xmlData).children('lists');
	var result = $(lists).children('result');
	var error  = $(lists).children('error');

	if ($(result).text() == "register") {
		$(registerForm).children("div#connectionResult").text(
			"登録完了しました。"
		);
	} else {
		$(registerForm).children("div#connectionResult").text(
			$(error).text()
		);
		registerFormFixedOff(registerForm);
	}
} 
