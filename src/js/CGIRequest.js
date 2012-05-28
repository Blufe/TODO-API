function xmlCGIRequest(cgiPath, sendData, successFunc, errorFunc)
{
	$.ajax({
		type: "POST",
		url: cgiPath,
		contentType: "application/x-www-form-urlencoded; charset=utf-8",
		dataType: "xml",
		data: sendData,
		error:   errorFunc,
		success: successFunc
	}); // ajax
}

// ログインフォームのサブミットイベント
function loginRequest() 
{
	var loginForm = $('#loginForm');
	var userid = encodeURIComponent($(loginForm).children('#useridField').attr('value')); // get username
	var passwd = encodeURIComponent($(loginForm).children('#passwdField').attr('value')); // get password

	var cgiPath     = "./login.cgi";
	var sendData    = "userid=" + userid + "&passwd=" + passwd;
	var successFunc = loginResponse;
	var errorFunc   = loginConnectError;

	loginFormFixedOn();
	if (userid && passwd) {
		xmlCGIRequest(cgiPath, sendData, successFunc, errorFunc);
	} else {
		loginNotEnteredError();
	}

	return false; // 実際にsubmitするのを防ぐ
}

// ユーザ登録フォームのサブミットイベント
function registerRequest() 
{
	var registerForm = $('#registerForm');
	var userid = encodeURIComponent($(registerForm).children('#useridField').attr('value')); // get username
	var passwd = encodeURIComponent($(registerForm).children('#passwdField').attr('value')); // get password

	var cgiPath     = "./register.cgi";
	var sendData    = "userid=" + userid + "&passwd=" + passwd;
	var successFunc = registerResponse;
	var errorFunc   = registerConnectError;

	registerFormFixedOn();
	if (userid && passwd) {
		xmlCGIRequest(cgiPath, sendData, successFunc, errorFunc);
	} else {
		registerNotEnteredError();
	}

	return false; // 実際にsubmitするのを防ぐ
}

// TODOリストを取得する関数
function todoListRequest(words, date_a, date_b, finished)
{
	var dataForm   = $('#dataForm');
	var listForm   = $('#listForm');
	var searchData = $(dataForm).children('#searchData');

	// ユーザ情報
	var userid = encodeURIComponent($(dataForm).children('#useridData').attr('value')); // get username
	var passwd = encodeURIComponent($(dataForm).children('#passwdData').attr('value')); // get password

	// 検索情報
	var s_words    = encodeURIComponent($(searchData).children('#wordsData').attr('value'));
	var s_date_a   = encodeURIComponent($(searchData).children('#date_aData').attr('value'));
	var s_date_b   = encodeURIComponent($(searchData).children('#date_bData').attr('value'));
	var s_finished = encodeURIComponent($(searchData).children('#finishedData').attr('value'));
	var s_order    = encodeURIComponent($(searchData).children('#orderData').attr('value'));

	var sendData =  "mode=SEARCH" + 
			"&userid="  + userid + "&passwd="   + passwd   +
			"&s_words=" + s_words  + "&s_date_a=" + s_date_a + "&s_date_b=" + s_date_b + "&s_finished=" + s_finished + "&s_order=" + s_order;
	var cgiPath     = "./todo.cgi";
	var successFunc = todoListResponse;
	var errorFunc   = todoConnectError;


	if (userid && passwd) {
		xmlCGIRequest(cgiPath, sendData, successFunc, errorFunc);
	} else {
		logoutRequest();
	}

	return false; // 実際にsubmitするのを防ぐ
}

// TODOを追加する関数
function todoAddRequest()
{
	var additionButton = this;
	var inputForm  = $(this).parent();
	var dataForm   = $('#dataForm');
	var listForm   = $('#listForm');
	var searchData = $(dataForm).children('#searchData');

	// ユーザ情報
	var userid = encodeURIComponent($(dataForm).children('#useridData').attr('value')); // get username
	var passwd = encodeURIComponent($(dataForm).children('#passwdData').attr('value')); // get password

	// 検索情報
	var s_words    = encodeURIComponent($(searchData).children('#wordsData').attr('value'));
	var s_date_a   = encodeURIComponent($(searchData).children('#date_aData').attr('value'));
	var s_date_b   = encodeURIComponent($(searchData).children('#date_bData').attr('value'));
	var s_finished = encodeURIComponent($(searchData).children('#finishedData').attr('value'));
	var s_order    = encodeURIComponent($(searchData).children('#orderData').attr('value'));

	// 入力フォーム情報
	var Owords   = $(inputForm).children('#inputOwordsField').attr('value');
	var Vwords   = $(inputForm).children('#inputVwordsField').attr('value');
	if (Owords == "何を？")     Owords = "";
	if (Vwords == "どうする？") Vwords = "";
	Owords = encodeURIComponent(Owords);
	Vwords = encodeURIComponent(Vwords);

	// 変更情報
	var deadline = $(inputForm).children('#inputDateField').children('#inputDeadlineField').attr('value');
	if (deadline == "いつまでに？") deadline = "";
	deadline = encodeURIComponent(deadline);

	// 送信内容
	var sendData =  "mode=INSERT" + 
			"&userid="  + userid  + "&passwd="   + passwd   +
			"&s_words=" + s_words + "&s_date_a=" + s_date_a + "&s_date_b=" + s_date_b + "&s_finished=" + s_finished + "&s_order=" + s_order +
			"&Owords="  + Owords  + "&Vwords="   + Vwords   + "&deadline=" + deadline;
	var cgiPath     = "./todo.cgi";
	var successFunc = todoListResponse;
	var errorFunc   = todoConnectError;

	if (userid && passwd) {
		xmlCGIRequest(cgiPath, sendData, successFunc, errorFunc);
	} else {
		logoutRequest();
	}

	return false; // 実際にsubmitするのを防ぐ
}

// 完了・未完ボタンのクリック
function todoUpdateFinishedRequest()
{
	var finishedButton = this;
	var dataForm   = $('#dataForm');
	var listForm   = $('#listForm');
	var searchData = $(dataForm).children('#searchData');
	var bgcolor = $(finishedButton).css("background-color");

	// ユーザ情報
	var userid = encodeURIComponent($(dataForm).children('#useridData').attr('value')); // get username
	var passwd = encodeURIComponent($(dataForm).children('#passwdData').attr('value')); // get password

	// 検索情報
	var s_words    = encodeURIComponent($(searchData).children('#wordsData').attr('value'));
	var s_date_a   = encodeURIComponent($(searchData).children('#date_aData').attr('value'));
	var s_date_b   = encodeURIComponent($(searchData).children('#date_bData').attr('value'));
	var s_finished = encodeURIComponent($(searchData).children('#finishedData').attr('value'));
	var s_order    = encodeURIComponent($(searchData).children('#orderData').attr('value'));

	// 変更情報
	var sentenceID = encodeURIComponent($(finishedButton).parent().attr('value'));
	var finished   = "";
	if (bgcolor == "rgba(0, 255, 0, 0.25)") {
		$(finishedButton).css("background-color", "rgba(255,0,0,0.25)");
		finished = "true";
	} else {
		$(finishedButton).css("background-color", "rgba(0,255,0,0.25)");
		finished = "false";
	}

	// 送信内容
	var sendData =  "mode=UPDATE"  + "&chmode=FINISHED" +
			"&userid="     + userid     + "&passwd="   + passwd   +
			"&s_words="    + s_words    + "&s_date_a=" + s_date_a + "&s_date_b=" + s_date_b + "&s_finished=" + s_finished + "&s_order=" + s_order +
			"&sentenceid=" + sentenceID + "&finished=" + finished;
	var cgiPath     = "./todo.cgi";
	var successFunc = todoListResponse;
	var errorFunc   = todoConnectError;

	if (userid && passwd) {
		xmlCGIRequest(cgiPath, sendData, successFunc, errorFunc);
	} else {
		logoutRequest();
	}

	return false; // 実際にsubmitするのを防ぐ
}

function todoUpdateDeadlineRequest()
{
	var deadlineCal = this;
	var dataForm   = $('#dataForm');
	var listForm   = $('#listForm');
	var searchData = $(dataForm).children('#searchData');

	// ユーザ情報
	var userid = encodeURIComponent($(dataForm).children('#useridData').attr('value')); // get username
	var passwd = encodeURIComponent($(dataForm).children('#passwdData').attr('value')); // get password

	// 検索情報
	var s_words    = encodeURIComponent($(searchData).children('#wordsData').attr('value'));
	var s_date_a   = encodeURIComponent($(searchData).children('#date_aData').attr('value'));
	var s_date_b   = encodeURIComponent($(searchData).children('#date_bData').attr('value'));
	var s_finished = encodeURIComponent($(searchData).children('#finishedData').attr('value'));
	var s_order    = encodeURIComponent($(searchData).children('#orderData').attr('value'));

	// 変更情報
	var sentenceID = encodeURIComponent($(deadlineCal).parent().parent().parent().parent().attr('value'));
	var deadline   = encodeURIComponent($(deadlineCal).attr('value'));

	// 送信内容
	var sendData =  "mode=UPDATE"  +  "&chmode=DEADLINE" +
			"&userid="     + userid     + "&passwd="   + passwd   +
			"&s_words="    + s_words    + "&s_date_a=" + s_date_a + "&s_date_b=" + s_date_b + "&s_finished=" + s_finished + "&s_order=" + s_order +
			"&sentenceid=" + sentenceID + "&deadline=" + deadline;
	var cgiPath     = "./todo.cgi";
	var successFunc = todoListResponse;
	var errorFunc   = todoConnectError;

	if (userid && passwd) {
		xmlCGIRequest(cgiPath, sendData, successFunc, errorFunc);
	} else {
		logoutRequest();
	}

	return false; // 実際にsubmitするのを防ぐ
}

function todoUpdateSentenceRequest()
{
	var sentenceForm = this;
	var dataForm   = $('#dataForm');
	var listForm   = $('#listForm');
	var searchData = $(dataForm).children('#searchData');

	// ユーザ情報
	var userid = encodeURIComponent($(dataForm).children('#useridData').attr('value')); // get username
	var passwd = encodeURIComponent($(dataForm).children('#passwdData').attr('value')); // get password

	// 検索情報
	var s_words    = encodeURIComponent($(searchData).children('#wordsData').attr('value'));
	var s_date_a   = encodeURIComponent($(searchData).children('#date_aData').attr('value'));
	var s_date_b   = encodeURIComponent($(searchData).children('#date_bData').attr('value'));
	var s_finished = encodeURIComponent($(searchData).children('#finishedData').attr('value'));
	var s_order    = encodeURIComponent($(searchData).children('#orderData').attr('value'));

	// 変更情報
	var sentenceID = encodeURIComponent($(sentenceForm).parent().parent().parent().attr('value'));
	var sentence   = encodeURIComponent($(sentenceForm).attr('value'));

	// 送信内容
	var sendData =  "mode=UPDATE"  + "&chmode=SENTENCE" +
			"&userid="     + userid     + "&passwd="   + passwd   +
			"&s_words="    + s_words    + "&s_date_a=" + s_date_a + "&s_date_b=" + s_date_b + "&s_finished=" + s_finished + "&s_order=" + s_order +
			"&sentenceid=" + sentenceID + "&sentence=" + sentence;
	var cgiPath     = "./todo.cgi";
	var successFunc = todoListResponse;
	var errorFunc   = todoConnectError;

	if (userid && passwd) {
		xmlCGIRequest(cgiPath, sendData, successFunc, errorFunc);
	} else {
		logoutRequest();
	}

	return false; // 実際にsubmitするのを防ぐ
}
