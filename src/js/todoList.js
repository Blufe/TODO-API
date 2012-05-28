// TODOリストを取得する関数
function todoListRequest(words, date_a, date_b, finished)
{
	var dataForm   = $('#dataForm');
	var listForm   = $('#listForm');
	var searchData = $(dataForm).children('#searchData');

	// ユーザ情報
	var userid = $(dataForm).children('#useridData').attr('value'); // get username
	var passwd = $(dataForm).children('#passwdData').attr('value'); // get password

	// 検索情報
	var s_words    = $(searchData).children('#wordsData').attr('value');
	var s_date_a   = $(searchData).children('#date_aData').attr('value');
	var s_date_b   = $(searchData).children('#date_bData').attr('value');
	var s_finished = $(searchData).children('#finishedData').attr('value');
	var s_order    = $(searchData).children('#orderData').attr('value');

	var senddata =  "mode=SEARCH" + 
			"&userid="  + userid + "&passwd="   + passwd   +
			"&s_words=" + s_words  + "&s_date_a=" + s_date_a + "&s_date_b=" + s_date_b + "&s_finished=" + s_finished + "&s_order=" + s_order;

	if (userid && passwd) {
		$.ajax({
			type: "POST",
			url: "./todo.cgi",
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			dataType: "xml",
			data: senddata,
			error:  function (XMLHttpRequest, textStatus, errorThrown) {
					todoConnectError(listForm, XMLHttpRequest, textStatus, errorThrown);
				},
       			success: function (xmlData) {
					todoListResponse(listForm, xmlData);
				}
		}); // ajax
	}
	else {
		logoutRequest(listForm);
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
	var userid = $(dataForm).children('#useridData').attr('value'); // get username
	var passwd = $(dataForm).children('#passwdData').attr('value'); // get password

	// 検索情報
	var s_words    = $(searchData).children('#wordsData').attr('value');
	var s_date_a   = $(searchData).children('#date_aData').attr('value');
	var s_date_b   = $(searchData).children('#date_bData').attr('value');
	var s_finished = $(searchData).children('#finishedData').attr('value');
	var s_order    = $(searchData).children('#orderData').attr('value');

	// 入力フォーム情報
	var Owords   = $(inputForm).children('#inputOwords').attr('value');
	var Vwords   = $(inputForm).children('#inputVwords').attr('value');
	if (Owords == "何を？")     Owords = "";
	if (Vwords == "どうする？") Vwords = "";

	// 変更情報
	var deadline = $(inputForm).children('#date').children('#inputDeadline').attr('value');
	if (deadline == "いつまでに？") deadline = "";

	// 送信内容
	var senddata =  "mode=INSERT" + 
			"&userid="  + userid  + "&passwd="   + passwd   +
			"&s_words=" + s_words + "&s_date_a=" + s_date_a + "&s_date_b=" + s_date_b + "&s_finished=" + s_finished + "&s_order=" + s_order +
			"&Owords="  + Owords  + "&Vwords="   + Vwords   + "&deadline=" + deadline;

	if (userid && passwd) {
		$.ajax({
			type: "POST",
			url: "./todo.cgi",
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			dataType: "xml",
			data: senddata,
			error:  function (XMLHttpRequest, textStatus, errorThrown) {
					todoConnectError(listForm, XMLHttpRequest, textStatus, errorThrown);
				},
       			success: function (xmlData) {
					todoListResponse(listForm, xmlData);
				}
		}); // ajax
	}
	else {
		logoutRequest(listForm);
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
	var userid = $(dataForm).children('#useridData').attr('value'); // get username
	var passwd = $(dataForm).children('#passwdData').attr('value'); // get password

	// 検索情報
	var s_words    = $(searchData).children('#wordsData').attr('value');
	var s_date_a   = $(searchData).children('#date_aData').attr('value');
	var s_date_b   = $(searchData).children('#date_bData').attr('value');
	var s_finished = $(searchData).children('#finishedData').attr('value');
	var s_order    = $(searchData).children('#orderData').attr('value');

	// 変更情報
	var sentenceID = $(finishedButton).parent().attr('value');
	var finished   = "";
	if (bgcolor == "rgba(0, 255, 0, 0.25)") {
		$(finishedButton).css("background-color", "rgba(255,0,0,0.25)");
		finished = "true";
	} else {
		$(finishedButton).css("background-color", "rgba(0,255,0,0.25)");
		finished = "false";
	}

	// 送信内容
	var senddata =  "mode=UPDATE"  + "&chmode=FINISHED" +
			"&userid="     + userid     + "&passwd="   + passwd   +
			"&s_words="    + s_words    + "&s_date_a=" + s_date_a + "&s_date_b=" + s_date_b + "&s_finished=" + s_finished + "&s_order=" + s_order +
			"&sentenceid=" + sentenceID + "&finished=" + finished;

	if (userid && passwd) {
		$.ajax({
			type: "POST",
			url: "./todo.cgi",
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			dataType: "xml",
			data: senddata,
			error:  function (XMLHttpRequest, textStatus, errorThrown) {
					todoConnectError(listForm, XMLHttpRequest, textStatus, errorThrown);
				},
       			success: function (xmlData) {
					todoListResponse(listForm, xmlData);
				}
		}); // ajax
	}
	else {
		logoutRequest(listForm);
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
	var userid = $(dataForm).children('#useridData').attr('value'); // get username
	var passwd = $(dataForm).children('#passwdData').attr('value'); // get password

	// 検索情報
	var s_words    = $(searchData).children('#wordsData').attr('value');
	var s_date_a   = $(searchData).children('#date_aData').attr('value');
	var s_date_b   = $(searchData).children('#date_bData').attr('value');
	var s_finished = $(searchData).children('#finishedData').attr('value');
	var s_order    = $(searchData).children('#orderData').attr('value');

	// 変更情報
	var sentenceID = $(deadlineCal).parent().parent().parent().parent().attr('value');
	var deadline   = $(deadlineCal).attr('value');

	// 送信内容
	var senddata =  "mode=UPDATE"  +  "&chmode=DEADLINE" +
			"&userid="     + userid     + "&passwd="   + passwd   +
			"&s_words="    + s_words    + "&s_date_a=" + s_date_a + "&s_date_b=" + s_date_b + "&s_finished=" + s_finished + "&s_order=" + s_order +
			"&sentenceid=" + sentenceID + "&deadline=" + deadline;

	if (userid && passwd) {
		$.ajax({
			type: "POST",
			url: "./todo.cgi",
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			dataType: "xml",
			data: senddata,
			error:  function (XMLHttpRequest, textStatus, errorThrown) {
					todoConnectError(listForm, XMLHttpRequest, textStatus, errorThrown);
				},
       			success: function (xmlData) {
					todoListResponse(listForm, xmlData);
				}
		}); // ajax
	}
	else {
		logoutRequest(listForm);
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
	var userid = $(dataForm).children('#useridData').attr('value'); // get username
	var passwd = $(dataForm).children('#passwdData').attr('value'); // get password

	// 検索情報
	var s_words    = $(searchData).children('#wordsData').attr('value');
	var s_date_a   = $(searchData).children('#date_aData').attr('value');
	var s_date_b   = $(searchData).children('#date_bData').attr('value');
	var s_finished = $(searchData).children('#finishedData').attr('value');
	var s_order    = $(searchData).children('#orderData').attr('value');

	// 変更情報
	var sentenceID = $(sentenceForm).parent().parent().parent().attr('value');
	var sentence   = $(sentenceForm).attr('value');

	// 送信内容
	var senddata =  "mode=UPDATE"  + "&chmode=SENTENCE" +
			"&userid="     + userid     + "&passwd="   + passwd   +
			"&s_words="    + s_words    + "&s_date_a=" + s_date_a + "&s_date_b=" + s_date_b + "&s_finished=" + s_finished + "&s_order=" + s_order +
			"&sentenceid=" + sentenceID + "&sentence=" + sentence;

	if (userid && passwd) {
		$.ajax({
			type: "POST",
			url: "./todo.cgi",
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			dataType: "xml",
			data: senddata,
			error:  function (XMLHttpRequest, textStatus, errorThrown) {
					todoConnectError(listForm, XMLHttpRequest, textStatus, errorThrown);
				},
       			success: function (xmlData) {
					todoListResponse(listForm, xmlData);
				}
		}); // ajax
	}
	else {
		logoutRequest(listForm);
	}

	return false; // 実際にsubmitするのを防ぐ
}

// 接続エラー
function todoConnectError(listForm, XMLHttpRequest, textStatus, errorThrown){
	todoErrorWrite("通信に失敗しました");
}

// TODOリスト取得処理の結果
function todoListResponse(listForm, xmlData){
	var lists  = $(xmlData).children('lists');
	var result = $(lists).children('result');
	var error  = $(lists).children('error');
	var data   = $(lists).children('data');

	if ($(result).text() == "success") {
		todoListWrite(listForm, data);
	} else {
		todoErrorWrite(listForm, $(error).text());
	}

	setEventHandler();
} 

// TODOリストを表示する
function todoListWrite(listForm, xmlData)
{
	$(listForm).html("<ul class='line'></ul>");
	var lines = $(listForm).children('.line');

	todoSearchForm(lines);
	todoInputForm(lines);
	$(xmlData).each(function(){
		var sentenceID    = $(this).children('sentenceID').text();
		var todo          = $(this).children('todo').text();
		var creation_date = $(this).children('creation_date').text();
		var deadline      = $(this).children('deadline').text();
		var finished      = $(this).children('finished').text();
		todoWrite(lines, sentenceID, todo, creation_date, deadline, finished);
        });
}

// TODO入力フォームを表示する
function todoInputForm(lines) {
	$(lines).prepend("<li><div id='inputForm'>"+
			"<input id='inputOwords' type='text' value='何を？'>"+
			"<input id='inputVwords' type='text' value='どうする？'>"+
			"<div id='inputSubmit'>追加</div><br>"+
			"<div id='date'><input id='inputDeadline' type='text' value= 'いつまでに？'disabled='disabled'></div>"+
			"</div></li>");
}

// TODO検索フォームを表示する
function todoSearchForm(lines) {
	$(lines).prepend("<li><div id='searchForm'>"+
			"検索フォーム" +
			"<div id='updateButton'>検索</div><br>"+
			"</div></li>");
	$('#searchForm').parent().hide();
	$('#searchForm').parent().attr('value', 'off');
}

// TODOを表示する
function todoWrite(lines, sentenceID, todo, creation_date, deadline, finished)
{
	var finishedHTML;

	if (sentenceID>0) {
		if (finished == "true") {
			finishedHTML = "<div id='finished' background='rgb(255,0,0)'></div>";
		} else {
			finishedHTML = "<div id='finished'></div>";
		}

		$(lines).append("<li><div id='outputForm' value='"+sentenceID+"'>"+
				"<div id='text'>"+
				"<form>"+
				"<input id='todo' type='text' value="+todo+"><br>"+
				"<div id='date'>"+creation_date+" ～ "+
				"<input id='deadline' type='text' value='"+deadline+"' disabled='disabled'></div>"+
				"</form>"+
				"</div>"+
				finishedHTML+
				"</div></li>");
	}
}

// TODOリストのエラーを表示する
function todoErrorWrite(listForm, text)
{
	$(listForm).html(
		"<ul class='line'>" +
		"<li>" +
		"<div id='memo'>"  +
		"<div id='todoError'>" +
		text +
		"</div>" +
		"</div>" +
		"</li>"  +
		"</ul>"    
	);
	var lines = $(listForm).children('.line');
	todoSearchForm(lines);
	todoInputForm(lines);
	alert(text);
}

// 入力欄のフォーカス
function todoInputFocus(){
	if ($(this).attr('id') == "inputOwords") {
		if ($(this).attr('value') == "何を？") {
			$(this).attr('value', '');
		}
	} else if ($(this).attr('id') == "inputVwords") {
		if ($(this).attr('value') == "どうする？") {
			$(this).attr('value', '');
		}
	}
}
function todoInputBlur(){
	if ($(this).attr('value') === "") {
		if ($(this).attr('id') === "inputOwords") {
			$(this).attr('value', '何を？');
		} else if ($(this).attr('id') === "inputVwords") {
			$(this).attr('value', 'どうする？');
		}
	}
}

// 検索フォームを表示する検索ボタン
function openSearchForm() {
	if ($('#searchForm').parent().attr('value') == "on") { 
		$('#searchForm').parent().attr('value', "off");
		$('#searchForm').parent().fadeOut();
	} else {
		$('#searchForm').parent().attr('value', "on");
		$('#searchForm').parent().fadeIn();
	}
}

// ログアウト処理
function logoutRequest(listForm) 
{
	var dataForm  = $('#dataForm');
	var loginForm = $('#loginForm');
	
	$(listForm).html("");
	$(dataForm).children('#useridData').attr('value', '');
	$(dataForm).children('#passwdData').attr('value', '');

	$(loginForm).css("display", "block");
	$(loginForm).children('#connectionResult').text("");
	$(loginForm).children('#useridForm').attr('value', '');
	$(loginForm).children('#passwdForm').attr('value', '');
	loginFormFixedOff(loginForm);
	$(loginForm).fadeIn();

	setEventHandler();
}

