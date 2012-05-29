// イベントハンドル
$(document).ready(function(){
	setEventHandler();
});

function setEventHandler()
{
	// 検索フォームを開くボタンのクリックイベント
	$("#menuButton").unbind("click");
	$("#menuButton").bind("click", openSearchForm);
	// 検索フォームのクリア
	$("#clearButton").unbind("click");
	$("#clearButton").bind("click", clearSearchForm);

	// TODO追加入力欄のフォーカスイベント
	$('#inputVwordsField').bind("focus", inputFieldFocus).bind("blur",inputFieldBlur);
	$('#inputOwordsField').bind("focus", inputFieldFocus).bind("blur",inputFieldBlur);

	// TODO追加ボタンのクリックイベント
	$('*').find('#inputSubmitButton').each(function(){ $(this).bind("click", todoAddRequest); });

	// TODO検索ボタンのクリックイベント
	$("#searchSubmitButton").bind("click", todoListRequest);

	// TODO検索入力欄のフォーカスイベント
	$('#searchWordsField').bind("focus", searchFieldFocus).bind("blur",searchFieldBlur);

	// TODO検索入力欄の変更イベント
	$('#searchWordsField').bind("change", searchFieldChange);
	$('#searchDateUnderField').bind("change", searchFieldChange);
	$('#searchDateOverField').bind("change", searchFieldChange);
	$('#searchFinishedButton').bind("click", searchFinishedChange);

	// TODOの期日欄変更イベント
	$('*').find('.outputDeadlineField').each(function(){ $(this).bind("change", todoUpdateDeadlineRequest); });

	// TODOの変更イベント
	$('*').find('#outputSentenceField').each(function(){ $(this).bind("change", todoUpdateSentenceRequest); });

	// 完了・未完ボタンのクリックイベント
	$('*').find('#outputFinishedButton').each(function(){ $(this).bind("click", todoUpdateFinishedRequest); });

	// 各TODO上にカーソルが乗った時のイベント
	$('*').find('#todoOutputField').each(function(){ $(this).hover(todoHoverIn, todoHoverOut); });

	// ユーザ登録フォームへ切り替えるボタンのクリックイベント
	$('*').find('#changeButton[value="register"]').each(function(){ $(this).bind("click", changeFormToRegister); });

	// ログインフォームへ切り替えるボタンのクリックイベント
	$('*').find('#changeButton[value="login"]').each(function(){ $(this).bind("click", changeFormToLogin); });

	// ユーザ登録フォームのサブミットイベント
	$('*').find('#registerForm').each(function(){ $(this).bind("submit", registerRequest); });

	// ログインフォームのサブミットイベント
	$('*').find('#loginForm').each(function(){ $(this).bind("submit", loginRequest); });

	// 入力欄のカレンダー
	$("#inputDeadlineField").datepicker({
		dateFormat: 'yy-mm-dd',
		minDate: '+0d',
		showOtherMonths: true,
		showOn: 'button'
	});

	// 検索欄のカレンダー
	$("#searchDateUnderField").datepicker({
		dateFormat: 'yy-mm-dd',
		showOtherMonths: true,
		showOn: 'button'
	});
	$("#searchDateOverField").datepicker({
		dateFormat: 'yy-mm-dd',
		showOtherMonths: true,
		showOn: 'button'
	});

	// TODOリストのカレンダー
	$('*').find('.outputDeadlineField').each(function(){ 
		var id = $(this).parent().parent().parent().parent().attr("value");
		$(this).attr("id", id);
		$(this).datepicker({
			dateFormat: 'yy-mm-dd',
			minDate: '+0d',
			showOtherMonths: true,
			showOn: 'button'
		});
	});
}
