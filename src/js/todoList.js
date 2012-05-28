// 接続エラー
function todoConnectError(XMLHttpRequest, textStatus, errorThrown){
	todoErrorWrite("通信に失敗しました");
}

// TODOリスト取得処理の結果
function todoListResponse(xmlData){
	var lists  = $(xmlData).children('lists');
	var result = $(lists).children('result');
	var error  = $(lists).children('error');
	var data   = $(lists).children('data');

	if ($(result).text() == "success") {
		todoListWrite(data);
	} else {
		todoErrorWrite($(error).text());
	}

	setEventHandler();
} 

// TODOリストを表示する
function todoListWrite(xmlData)
{
	var listForm = $('#listForm');
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
	$(lines).prepend("<li><div id='todoInputField'>"+
			"<input id='inputOwordsField' type='text' value='何を？'>"+
			"<input id='inputVwordsField' type='text' value='どうする？'>"+
			"<div class='button' id='inputSubmitButton'>追加</div><br>"+
			"<div id='inputDateField'><input id='inputDeadlineField' type='text' value= 'いつまでに？' disabled='disabled'></div>"+
			"</div></li>");
}

// TODO検索フォームを表示する
function todoSearchForm(lines) {
	$(lines).prepend("<li><div id='todoSearchField'>"+
			"検索フォーム" + "&quot;&quot;" +
			"<div class='button' id='searchSubmitButton'>検索</div><br>"+
			"</div></li>");
	$('#todoSearchField').parent().hide();
	$('#menuForm').children('#menuButton').attr('value', 'off');
}

// TODOを表示する
function todoWrite(lines, sentenceID, todo, creation_date, deadline, finished)
{
	var finishedHTML;

	if (sentenceID>0) {
		if (finished == "true") {
			finishedHTML = "<div class='button' id='outputFinishedButton' background='rgba(255,0,0,0.25)'></div>";
		} else {
			finishedHTML = "<div class='button' id='outputFinishedButton' background='rgba(0,255,0,0.25)'></div>";
		}

		$(lines).append("<li><div id='todoOutputField' value='"+sentenceID+"'>"+
				"<div id='outputField'>"+
				"<form>"+
				"<input id='outputSentenceField' type='text' value='"+todo+"'><br>"+
				"<div id='outputDateField'>"+creation_date+" ～ "+
				"<input id='outputDeadlineField' type='text' value='"+deadline+"' disabled='disabled'></div>"+
				"</form>"+
				"</div>"+
				finishedHTML+
				"</div></li>");
	}
}

// TODOリストのエラーを表示する
function todoErrorWrite(text)
{
	var listForm = $('#listForm');
	$(listForm).html(
		"<ul class='line'>" +
		"<li>" +
		"<div id='todoErrorField'>"  +
		text +
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
function inputFieldFocus(){
	if ($(this).attr('id') == "inputOwordsField") {
		if ($(this).attr('value') == "何を？") {
			$(this).attr('value', '');
		}
	} else if ($(this).attr('id') == "inputVwordsField") {
		if ($(this).attr('value') == "どうする？") {
			$(this).attr('value', '');
		}
	}
}
function inputFieldBlur(){
	if ($(this).attr('value') === "") {
		if ($(this).attr('id') === "inputOwordsField") {
			$(this).attr('value', '何を？');
		} else if ($(this).attr('id') === "inputVwordsField") {
			$(this).attr('value', 'どうする？');
		}
	}
}

// 検索フォームを表示する検索ボタン
function openSearchForm() {
	var status = $('#menuForm').children('#menuButton').attr('value');
	if (status == "on") { 
		$('#menuForm').children('#menuButton').attr('value', 'off');
		$('#todoSearchField').parent().fadeOut();
	} else {
		$('#menuForm').children('#menuButton').attr('value', 'on');
		$('#todoSearchField').parent().fadeIn();
	}
}

// ログアウト処理
function logoutRequest() 
{
	var listForm  = $('#listForm');
	var dataForm  = $('#dataForm');
	var loginForm = $('#loginForm');
	
	$(listForm).html("");
	$(dataForm).children('#useridData').attr('value', '');
	$(dataForm).children('#passwdData').attr('value', '');

	$(loginForm).css("display", "block");
	$(loginForm).children('#resultField').text("");
	$(loginForm).children('#useridField').attr('value', '');
	$(loginForm).children('#passwdField').attr('value', '');
	loginFormFixedOff();
	$(loginForm).fadeIn();

	setEventHandler();
}

