// イベントハンドル
$(document).ready(function(){
	setEventHandler();
});

function setEventHandler()
{
	$("div#updateButton").click(todoListRequest);
	$("div#searchMenuButton").click(openSearchForm);

	// 入力欄のカレンダー
	$("#inputDeadline").datepicker({
				dateFormat: 'yy-mm-dd', 
				minDate: '+0d',
				showOtherMonths: true,
				showOn: 'button'
			});
	// TODOリストの期日欄のカレンダー
	$("input#deadline").datepicker({
				dateFormat: 'yy-mm-dd', 
				minDate: '+0d',
				showOtherMonths: true,
				showOn: 'button'
			});

	// 入力欄のフォーカスイベント
	$('input#inputVwords').focus(todoInputFocus).blur(todoInputBlur);
	$('input#inputOwords').focus(todoInputFocus).blur(todoInputBlur);

	// TODO追加ボタンのクリックイベント
	$('div#inputSubmit').click(todoAddRequest);

	// TODOの期日欄変更イベント
	$("input#deadline").change(todoUpdateDeadlineRequest);

	// TODOの変更イベント
	$("input#todo").change(todoUpdateSentenceRequest);

	// 完了・未完ボタンのクリックイベント
	$('div#finished').click(todoUpdateFinishedRequest);

	// ユーザ登録フォームへ切り替えるボタンのクリックイベント
	$('button#changeForm[value="register"]').click(changeFormToRegister);

	// ログインフォームへ切り替えるボタンのクリックイベント
	$('button#changeForm[value="login"]').click(changeFormToLogin);

	// ユーザ登録フォームのサブミットイベント
	$('form#registerForm').submit(registerRequest);

	// ログインフォームのサブミットイベント
	$('form#loginForm').submit(loginRequest);
}