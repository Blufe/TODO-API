// TODOリストを取得する関数
function todoListRequest(listForm, words, date_a, date_b, finished)
{
	var mainBlock = $(listForm).parent();
	var dataForm  = $(mainBlock).children('form#dataForm');
	var userid = $(dataForm).children('input#useridData').attr('value'); // get username
	var passwd = $(dataForm).children('input#passwdData').attr('value'); // get password
	var senddata = "mode=SEARCH" + "&userid=" + userid + "&passwd=" + passwd;

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

function todoListWrite(listForm, xmlData)
{
	$(listForm).html("<ul class='line'></ul>");
	var lines = $(listForm).children('.line');

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

function todoInputForm(lines) {
	$(lines).append("<li><div id='inputForm'>"+
			"<input id='inputSwords' type='text' value='誰が？'>"+
			"<input id='inputOwords' type='text' value='何を？'>"+
			"<input id='inputVwords' type='text' value='どうする？'>"+
			"<div id='inputSubmit'>追加</div><br>"+
			"<div id='date'>期限 : <input id='inputDeadline' type='text' disabled='disabled'></div>"+
			"</div></li>");
}

function todoWrite(lines, sentenceID, todo, creation_date, deadline, finished)
{
	var finishedHTML;
	if (finished == "true") {
		finishedHTML = "<div id='finished' background='rgb(255,0,0)'></div>";
	} else {
		finishedHTML = "<div id='finished'></div>";
	}

	$(lines).append("<li><div id='outputForm'>"+
			"<div id='text'>"+
			"<form id='"+sentenceID+"'>"+
			"<input id='todo' type='text' value="+todo+"><br>"+
			"<div id='date'>"+creation_date+" ～ "+
			"<input id='deadline' type='text' value='"+deadline+"' disabled='disabled'></div>"+
			"</form>"+
			"</div>"+
			finishedHTML+
			"</div></li>");
}

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
}

// 完了・未完ボタンのクリック
function todoFinishedButton()
{
	var finishedButton = this;
	var bgcolor = $(finishedButton).css("background-color");
	if (bgcolor == "rgba(0, 255, 0, 0.25)") {
		$(finishedButton).css("background-color", "rgba(255,0,0,0.25)");
	} else {
		$(finishedButton).css("background-color", "rgba(0,255,0,0.25)");
	}
}

// 入力欄のフォーカス
function todoInputFocus(){
	if ($(this).attr('id') == "inputSwords") {
		if ($(this).attr('value') == "誰が？") {
			$(this).attr('value', '');
		}
	} else if ($(this).attr('id') == "inputOwords") {
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
		if ($(this).attr('id') === "inputSwords") {
			$(this).attr('value', '誰が？');
		} else if ($(this).attr('id') === "inputOwords") {
			$(this).attr('value', '何を？');
		} else if ($(this).attr('id') === "inputVwords") {
			$(this).attr('value', 'どうする？');
		}
	}
}

// TODO追加ボタンのクリック
function todoAdditionButton()
{
	var additionButton = this;
	var inputForm = $(this).parent();
	var dataForm  = $('#dataForm');
	var listForm  = $('#listForm');

	var userid = $(dataForm).children('input#useridData').attr('value'); // get username
	var passwd = $(dataForm).children('input#passwdData').attr('value'); // get password
//	var senddata = "mode=SEARCH" + "&userid=" + userid + "&passwd=" + passwd;
	var senddata = "mode=INSERT" + "&userid=" + userid + "&passwd=" + passwd;

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

// ログアウト処理
function logoutRequest(listForm) 
{
	var mainBlock = $(listForm).parent();
	var dataForm  = $(mainBlock).children('form#dataForm');
	var loginForm = $(mainBlock).children('form#loginForm');
	
	$(listForm).html("");
	$(dataForm).children('input#useridData').attr('value', '');
	$(dataForm).children('input#passwdData').attr('value', '');

	$(loginForm).css("display", "block");
	$(loginForm).children('div#connectionResult').text("");
	$(loginForm).children('input#useridForm').attr('value', '');
	$(loginForm).children('input#passwdForm').attr('value', '');
	loginFormFixedOff(loginForm);
	$(loginForm).fadeIn();

	setEventHandler();
}

