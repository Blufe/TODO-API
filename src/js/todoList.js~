// 接続エラー
function todoConnectError(XMLHttpRequest, textStatus, errorThrown){
	openErrorForm("通信に失敗しました");
}

// TODOリスト取得処理の結果
function todoListResponse(xmlData){
	var lists  = $(xmlData).children('lists');
	var result = $(lists).children('result');
	var error  = $(lists).children('error');
	var data   = $(lists).children('data');

	if ($(result).text() == "success") {
		todoListWrite(data);
		setEventHandler();
	} else {
		openErrorForm($(error).text());
	}
} 

// TODOリストを表示する
function todoListWrite(xmlData)
{
	var listForm = $('#listForm');
	$(listForm).html("<ul class='line'></ul>");
	var lines = $(listForm).children('.line');

	todoErrorWrite(lines);
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
			"<input id='searchWordsField' type='text' value='検索ワードを入れてください'>"+
			"<div class='button' id='searchSubmitButton'>検索</div><br>"+
			"<div id='searchDateField'>"+
			"<input id='searchDateUnderField' type='text' value= 'いつから？' disabled='disabled'> ～ " +
			"<input id='searchDateOverField' type='text' value= 'いつまで？' disabled='disabled'></div>"+
			"<div class='button' id='searchFinishedButton' value='false'>未完のみ</div>"+
			"</div></li>");
	$('#todoSearchField').parent().hide();
	$('#menuForm').children('#menuButton').attr('value', 'off');
	$('#menuForm').children('#menuButton').text('＋');
}

// TODOを表示する
function todoWrite(lines, sentenceID, todo, creation_date, deadline, finished)
{
	var finishedButton;

	if (sentenceID>0) {
//		console.log(todo);

		$(lines).append("<li><div id='todoOutputField' value='"+sentenceID+"'>"+
				"<div id='outputField'>"+
				"<form>"+
				"<input id='outputSentenceField' type='text' value='"+todo+"'><br>"+
				"<div id='outputDateField'>"+creation_date+" ～ "+
				"<input class='outputDeadlineField' id='outputDeadlineField' type='text' value='"+deadline+"' disabled='disabled'></div>"+
				"</form>"+
				"</div>"+
				"<div class='button' id='outputFinishedButton'></div>" +
				"</div></li>");
		$(lines).find('#todoOutputField[value="'+sentenceID+'"]').each(function(){
			finishedButton = $(this).children('#outputFinishedButton');
		});
		$(finishedButton).attr('value', finished);
		if (finished === "true") {
			$(finishedButton).css('background-color', 'rgba(255,0,0,0.25)');		
//text-decoration:line-through
		} else {
			$(finishedButton).css('background-color', 'rgba(0,255,0,0.25)');
		}
	}
}

// TODOリストのエラーを表示する
function todoErrorWrite(lines)
{
	$(lines).prepend(
		"<li>" +
		"<div id='todoErrorField'>"  +
		"</div>" +
		"</li>"
	);
	$('#todoErrorField').parent().hide();
}

// エラーフォームを開く
function openErrorForm(text)
{
	$('#todoErrorField').text(text);
	$('#todoErrorField').parent().fadeIn();
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

// 各TODO上にカーソルが来た時の関数
function todoHoverIn() {
	$(this).find('.outputDeadlineField').each(function(){
		$(this).datepicker({
			dateFormat: 'yy-mm-dd',
			minDate: '+0d',
			showOtherMonths: true,
			showOn: 'button'/*,
			onClose: function(dateText, inst) { 
				$(this).datepicker('destroy');
			}*/
		});
	});
}
function todoHoverOut() {}

// 検索フォームを表示する関数
function openSearchForm() {
	var status = $('#menuForm').children('#menuButton').attr('value');
	var dataForm    = $('#dataForm');
	var searchData  = $(dataForm).children('#searchData');
	var searchField = $('#todoSearchField');	
	var s_words    = $(searchData).children('#wordsData').attr('value');
	var s_date_a   = $(searchData).children('#date_aData').attr('value');
	var s_date_b   = $(searchData).children('#date_bData').attr('value');
	var s_finished = $(searchData).children('#finishedData').attr('value');
	var s_order    = $(searchData).children('#orderData').attr('value');

	if (s_words == "") { 
		s_words = "検索ワードを入れてください"; 
	}
	if (s_date_a == "") { 
		s_date_a = "いつまで？"; 
	}
	if (s_date_b == "") { 
		s_date_b = "いつから？"; 
	}

	if (s_finished == "false") {
		$(searchField).children('#searchFinishedButton').css("background-color", "rgba(0,255,0,0.25)");
		$(searchField).children('#searchFinishedButton').text("未完のみ");
	} else if (s_finished == "true") {
		$(searchField).children('#searchFinishedButton').css("background-color", "rgba(255,0,0,0.25)");
		$(searchField).children('#searchFinishedButton').text("完了のみ");
	} else {
		$(searchField).children('#searchFinishedButton').css("background-color", "rgba(0,0,255,0.25)");
		$(searchField).children('#searchFinishedButton').text("両方とも");
	}
	$(searchField).children('#searchFinishedButton').attr('value', s_finished);

	$(searchField).children('#searchWordsField').attr('value', s_words);
	$(searchField).children('#searchDateField').children('#searchDateUnderField').attr('value', s_date_b);
	$(searchField).children('#searchDateField').children('#searchDateOverField').attr('value', s_date_a);

	if (status == "on") { 
		$('#menuForm').children('#menuButton').attr('value', 'off');
		$('#menuForm').children('#menuButton').text('＋');
		$('#todoSearchField').parent().fadeOut();
	} else {
		$('#menuForm').children('#menuButton').attr('value', 'on');
		$('#menuForm').children('#menuButton').text('－');
		$('#todoSearchField').parent().fadeIn();
	}
}

// 検索フォームをクリアする関数
function clearSearchForm() {
	var dataForm    = $('#dataForm');
	var searchData  = $(dataForm).children('#searchData');
	var searchField = $('#todoSearchField');	

	$(searchData).children('#wordsData').attr('value', '');
	$(searchData).children('#date_aData').attr('value', '');
	$(searchData).children('#date_bData').attr('value', '');
	$(searchData).children('#finishedData').attr('value', 'false');
	$(searchData).children('#orderData').attr('value', 'desc');

	todoListRequest();
}

// 検索欄のフォーカス
function searchFieldFocus() {
	if ($(this).attr('value') == "検索ワードを入れてください") {
		$(this).attr('value', '');
	}
}
function searchFieldBlur() {
	if ($(this).attr('value') === "") {
		$(this).attr('value', '検索ワードを入れてください');
	}
}

// 検索欄の完了／未完選択ボタン
function searchFinishedChange() {
	var dataForm    = $('#dataForm');
	var searchData  = $(dataForm).children('#searchData');
	var searchField = $('#todoSearchField');
	var s_finished = $(searchField).children('#searchFinishedButton').attr('value');

	if (s_finished == "false") {
		$(searchField).children('#searchFinishedButton').css("background-color", "rgba(255,0,0,0.25)");
		$(searchField).children('#searchFinishedButton').text("完了のみ");
		s_finished = "true";
	} else if (s_finished == "true") {
		$(searchField).children('#searchFinishedButton').css("background-color", "rgba(0,0,255,0.25)");
		$(searchField).children('#searchFinishedButton').text("両方とも");
		s_finished = "";
	} else {
		$(searchField).children('#searchFinishedButton').css("background-color", "rgba(0,255,0,0.25)");
		$(searchField).children('#searchFinishedButton').text("未完のみ");
		s_finished = "false";
	}
	$(searchField).children('#searchFinishedButton').attr('value', s_finished);
	$(searchData).children('#finishedData').attr('value', s_finished);
}

// 検索欄変更時の関数
function searchFieldChange() {
	var dataForm    = $('#dataForm');
	var searchData  = $(dataForm).children('#searchData');
	var searchField = $('#todoSearchField');
	var s_words    = $(searchField).children('#searchWordsField').attr('value');
	var s_date_b   = $(searchField).children('#searchDateField').children('#searchDateUnderField').attr('value');
	var s_date_a   = $(searchField).children('#searchDateField').children('#searchDateOverField').attr('value');
	var s_order    = "desc";

	if (s_words == "検索ワードを入れてください") { 
		s_words = ""; 
	}

	$(searchData).children('#wordsData').attr('value', s_words);
	$(searchData).children('#date_aData').attr('value', s_date_a);
	$(searchData).children('#date_bData').attr('value', s_date_b);
	$(searchData).children('#orderData').attr('value', s_order);
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

