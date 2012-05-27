// イベントハンドル
$(document).ready(function(){
	setEventHandler();
});

function setEventHandler()
{
	// 入力欄のカレンダー
	$("#inputDeadline").datepicker({
				dateFormat: 'yy-mm-dd', 
				minDate: '+0d',
				showOtherMonths: true,
				showOn: 'button'
			});
	
	// 入力欄のフォーカスイベント
	$('input#inputSwords').focus(todoInputFocus).blur(todoInputBlur);
	$('input#inputVwords').focus(todoInputFocus).blur(todoInputBlur);
	$('input#inputOwords').focus(todoInputFocus).blur(todoInputBlur);

	// TODO追加ボタンのクリックイベント
	$('div#inputSubmit').click(todoAdditionButton);

	// TODOリストの期日欄のカレンダー
	$("input#deadline").datepicker({
				dateFormat: 'yy-mm-dd', 
				minDate: '+0d',
				showOtherMonths: true,
				showOn: 'button'
			});

	// 完了・未完ボタンのクリックイベント
	$('div#finished').click(todoFinishedButton);

	// ユーザ登録フォームへ切り替えるボタンのクリックイベント
	$('button#changeForm[value="register"]').click(changeFormToRegister);

	// ログインフォームへ切り替えるボタンのクリックイベント
	$('button#changeForm[value="login"]').click(changeFormToLogin);

	// ユーザ登録フォームのサブミットイベント
	$('form#registerForm').submit(registerRequest);

	// ログインフォームのサブミットイベント
	$('form#loginForm').submit(loginRequest);
}