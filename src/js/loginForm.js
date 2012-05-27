// ユーザ登録フォームへ切り替えるボタンのクリック
function changeFormToRegister()
{
	var changeButton = this;
	var loginForm    = $(changeButton).parent();
	var mainBlock    = $(loginForm).parent();
	var registerForm = $(mainBlock).children('form#registerForm');

	$(loginForm).hide();
	$(registerForm).css("display", "block");
	$(registerForm).children('div#connectionResult').text("");
	registerFormFixedOff(registerForm);
	$(registerForm).fadeIn();
}

// ログインフォームのサブミットイベント
function loginRequest() 
{
	var loginForm = this;
	var userid = $(loginForm).children('input#useridForm').attr('value'); // get username
	var passwd = $(loginForm).children('input#passwdForm').attr('value'); // get password

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
	$(loginForm).children("input#decisionButton").attr("disabled","disabed");
	$(loginForm).children('input#useridForm').attr("disabled","disabed");
	$(loginForm).children('input#passwdForm').attr("disabled","disabed");
}

// 入力不可の解除
function loginFormFixedOff(loginForm)
{
	$(loginForm).children("input#decisionButton").removeAttr("disabled");
	$(loginForm).children('input#useridForm').removeAttr("disabled");
	$(loginForm).children('input#passwdForm').removeAttr("disabled");
}

// 接続エラー
function loginConnectError(loginForm, XMLHttpRequest, textStatus, errorThrown){
	$(loginForm).children('div#connectionResult').text("通信に失敗しました");
//		+"responseText: " + XMLHttpRequest.responseText 
//		+ ", textStatus: " + textStatus 
//		+ ", errorThrown: " + errorThrown);
	loginFormFixedOff(loginForm);
}

// 未入力によるエラー
function loginNotEnteredError(loginForm) {
	$(loginForm).children('div#connectionResult').text("ユーザ名とパスワードを入力してください。");
	loginFormFixedOff(loginForm);
}

// ログイン処理の結果
function loginResponse(loginForm, xmlData){
	var lists  = $(xmlData).children('lists');
	var result = $(lists).children('result');
	var error  = $(lists).children('error');

	if ($(result).text() == "login") {
		var listForm = $(loginForm).parent().children('form#listForm');
		var dataForm = $(loginForm).parent().children('form#dataForm');
		var userid = $(loginForm).children('input#useridForm').attr('value'); // get username
		var passwd = $(loginForm).children('input#passwdForm').attr('value'); // get password
		
		$(loginForm).hide();
		$(listForm).fadeIn();
		$(dataForm).children('input#useridData').attr('value', userid);
		$(dataForm).children('input#passwdData').attr('value', passwd);
		todoListRequest(listForm);
	} else {
		$(loginForm).children("div#connectionResult").text($(error).text());
	}
	loginFormFixedOff(loginForm);
} 
