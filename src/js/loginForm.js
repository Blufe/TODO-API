// ログインフォームのサブミットイベント
function loginRequest() 
{
	var loginForm = this;
	var userid = $(loginForm).children('#useridForm').attr('value'); // get username
	var passwd = $(loginForm).children('#passwdForm').attr('value'); // get password

	loginFormFixedOn(loginForm);
	if (userid && passwd) {
		$.ajax({
			type: "POST",
			url: "./login.cgi",
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			dataType: "xml",
			data: "userid=" + userid + "&passwd=" + passwd,
			error:  function (XMLHttpRequest, textStatus, errorThrown) {
					loginConnectError(loginForm, XMLHttpRequest, textStatus, errorThrown);
				},
       			success: function (xmlData) {
					loginResponse(loginForm, xmlData);
				}
		}); // ajax
	}
	else {
		loginNotEnteredError(loginForm);
	}

	return false; // 実際にsubmitするのを防ぐ
}

// 入力不可の有効化
function loginFormFixedOn(loginForm)
{
	$(loginForm).children("#decisionButton").attr("disabled","disabed");
	$(loginForm).children('#useridForm').attr("disabled","disabed");
	$(loginForm).children('#passwdForm').attr("disabled","disabed");
}

// 入力不可の解除
function loginFormFixedOff(loginForm)
{
	$(loginForm).children("#decisionButton").removeAttr("disabled");
	$(loginForm).children('#useridForm').removeAttr("disabled");
	$(loginForm).children('#passwdForm').removeAttr("disabled");
}

// 接続エラー
function loginConnectError(loginForm, XMLHttpRequest, textStatus, errorThrown){
	$(loginForm).children('#connectionResult').text("通信に失敗しました");
//		+"responseText: " + XMLHttpRequest.responseText 
//		+ ", textStatus: " + textStatus 
//		+ ", errorThrown: " + errorThrown);
	loginFormFixedOff(loginForm);
}

// 未入力によるエラー
function loginNotEnteredError(loginForm) {
	$(loginForm).children('#connectionResult').text("ユーザ名とパスワードを入力してください。");
	loginFormFixedOff(loginForm);
}

// ログイン処理の結果
function loginResponse(loginForm, xmlData){
	var lists  = $(xmlData).children('lists');
	var result = $(lists).children('result');
	var error  = $(lists).children('error');

	if ($(result).text() == "login") {
		var listForm = $('#listForm');
		var dataForm = $('#dataForm');
		var menuForm = $('#menuForm');
		var userid = $(loginForm).children('#useridForm').attr('value'); // get username
		var passwd = $(loginForm).children('#passwdForm').attr('value'); // get password
		
		$(loginForm).hide();
		$(listForm).fadeIn();
		$(menuForm).fadeIn();
		$(dataForm).children('#useridData').attr('value', userid);
		$(dataForm).children('#passwdData').attr('value', passwd);
		todoListRequest();
	} else {
		$(loginForm).children("#connectionResult").text($(error).text());
	}
	loginFormFixedOff(loginForm);
} 

// ユーザ登録フォームへ切り替えるボタンのクリック
function changeFormToRegister()
{
	var changeButton = this;
	var loginForm    = $('#loginForm');
	var registerForm = $('#registerForm');

	$(loginForm).hide();
	$(registerForm).css("display", "block");
	$(registerForm).children('div#connectionResult').text("");
	registerFormFixedOff(registerForm);
	$(registerForm).fadeIn();
}