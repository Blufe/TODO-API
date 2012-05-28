// イベントハンドル
$(document).ready(function(){
	setEventHandler();
});

function setEventHandler()
{
	$("#menuButton").unbind("click");
	$("#menuButton").bind("click", openSearchForm);

	// 入力欄のカレンダー
	$("#inputDeadlineField").datepicker({
				dateFormat: 'yy-mm-dd', 
				minDate: '+0d',
				showOtherMonths: true,
				showOn: 'button'
			});
	// TODOリストの期日欄のカレンダー
	$("#outputDeadlineField").datepicker({
				dateFormat: 'yy-mm-dd', 
				minDate: '+0d',
				showOtherMonths: true,
				showOn: 'button'
			});

	// 入力欄のフォーカスイベント
	$('#inputVwordsField').unbind("focus").unbind("blur");
	$('#inputOwordsField').unbind("focus").unbind("blur");
	$('#inputVwordsField').bind("focus", inputFieldFocus).bind("blur",inputFieldBlur);
	$('#inputOwordsField').bind("focus", inputFieldFocus).bind("blur",inputFieldBlur);

	// TODO検索ボタンのクリックイベント
	$("#searchSubmitButton").unbind("click");
	$("#searchSubmitButton").bind("click", todoListRequest);

	// TODO追加ボタンのクリックイベント
	$('#inputSubmitButton').unbind("click");
	$('#inputSubmitButton').bind("click", todoAddRequest);

	// TODOの期日欄変更イベント
	$("#outputDeadlineField").unbind("change");
	$("#outputDeadlineField").bind("change", todoUpdateDeadlineRequest);

	// TODOの変更イベント
	$("#outputSentenceField").unbind("change");
	$("#outputSentenceField").bind("change", todoUpdateSentenceRequest);

	// 完了・未完ボタンのクリックイベント
	$('#outputFinishedButton').unbind("click");
	$('#outputFinishedButton').bind("click", todoUpdateFinishedRequest);

	// ユーザ登録フォームへ切り替えるボタンのクリックイベント
	$('#changeButton[value="register"]').unbind("click");
	$('#changeButton[value="register"]').bind("click", changeFormToRegister);

	// ログインフォームへ切り替えるボタンのクリックイベント
	$('#changeButton[value="login"]').unbind("click");
	$('#changeButton[value="login"]').bind("click", changeFormToLogin);

	// ユーザ登録フォームのサブミットイベント
	$('#registerForm').unbind("submit");
	$('#registerForm').bind("submit", registerRequest);

	// ログインフォームのサブミットイベント
	$('#loginForm').unbind("submit");
	$('#loginForm').bind("submit", loginRequest);
}
