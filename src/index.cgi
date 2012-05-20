#!/usr/bin/env perl

use strict;
use warnings;
use Switch;
use CGI::Carp qw(fatalsToBrowser);
use DBI qw(:sql_types);
use CGI;

require './lib/mysql.pl';

my $script = "index.cgi"; # スクリプト名
my $CGIpm = new CGI;
$CGIpm->charset("utf-8");

my $dbname = "TESTDB";    # データベース名
my $table  = "list";      # テーブル名
my $host   = "localhost"; # ホスト

my $user   = $CGIpm->param('user');
my $passwd = $CGIpm->param('pass');
my $dbh    = undef;

my $MODE_LOGIN  = "ログイン";
my $MODE_INSERT = "追加";
my $MODE_UPDATE = "変更";
my $MODE_DELETE = "削除";
my $mode    = undef;
my $connect = undef;
my @results   = undef;
my @q_results = undef;

my $q_user  = undef;
my @rows    = undef;
my @cols    = undef;

my $input_val = undef;
my $input_num = undef;

# htmlヘッダー部分
print 
    $CGIpm->header({'-expires'=>'+1m', '-charset'=>'UTF-8'}), 
    $CGIpm->start_html({ 
			'-title' => "test", 
			'-lang'  => 'ja', 
			'-head'  => $CGIpm->meta({
			    'http-equiv' => 'Content-Type', 
			    '-content'   => 'text/html; charset=UTF-8' 
			    }) 
			});

# データベースに接続
$dbh = &mysql::init($dbname, $table, $user, $passwd, $host);
$connect = defined($dbh);

$mode   = $CGIpm->param('mode');
$q_user = $CGIpm->escapeHTML($user);
@rows   = &mysql::rowList($dbh, $table, "id");
@cols   = &mysql::colList($dbh, $table);

switch ($mode) {
    case "$MODE_INSERT" {
	$input_val = $CGIpm->param('input_val');
    }
    case "$MODE_UPDATE" {
	$input_val = $CGIpm->param('input_val');
	$input_num = $CGIpm->param('input_num');
    }
    case "$MODE_DELETE" {
	$input_num = $CGIpm->param('input_num');
    }
    case "$MODE_LOGIN" {
	if ($connect) {
	    $mode = "";
	}
    }
}    

@results = &DBexec($mode, $dbh, $table, $user, $input_val, $input_num, \@rows);
@rows    = &mysql::rowList($dbh, $table, "id");
@cols    = &mysql::colList($dbh, $table);
for (my $i=0, my $num_results=@results; $i<$num_results; $i++) {
    foreach my $name (%{@results[$i]}) {
	$q_results[$i]{$name} = $CGIpm->escapeHTML($results[$i]{$name});
    }
}

if ($connect) {
    &menu_db($script, $q_user, $passwd, \@rows);
} else {
    &menu_login($script);
}

&show($script, $connect, $mode, \@cols, \@q_results);

&mysql::close($dbh);

print $CGIpm->end_html();

exit 0;

sub DBexec {
    my ($_mode, $_dbh, $_table, $_user, $_val, $_num, $_rows_lp) = @_;
    my @_rows     = @$_rows_lp;
    my $_num_rows = @_rows;
    my @values;
    my @types;
    my @items;

    # DB操作モード別のアクション
    switch ($_mode) {
	case "$MODE_INSERT" {
	    @values = ($_user, $_val);
	    @types  = (SQL_CHAR,SQL_CHAR);
	    &mysql::insert($_dbh, $_table, 
			   "name, memo, date", "?, ?, now()",
			   \@values, \@types);
	}
	case "$MODE_DELETE" { 
	    for (my $i=0; $i<$_num_rows; $i++) {
		if ($_rows[$i] eq $_num) {
		    @values = ($_rows[$i]);
		    @types  = (SQL_INTEGER);
		    &mysql::delete($_dbh, $_table, 
				   "id=?",
				   \@values, \@types);
		    last;
		}
	    }
	}
	case "$MODE_UPDATE" { 
	    for (my $i=0; $i<$_num_rows; $i++) {
		if ($_rows[$i] eq $_num) {
		    @values = ($_val, $_rows[$i]);
		    @types  = (SQL_CHAR, SQL_INTEGER);
		    &mysql::update($_dbh, $_table,
				   "memo=?", "id=?",
				   \@values, \@types);
		    last;
		}
	    }
	}
    }
    @items = &mysql::select($_dbh, $_table, 
			    "id, name, memo, date", "1", 
			    \@values, \@types);
    
    return @items;
}

sub menu_login {
    my ($_script) = @_;
    # ログインフォーム
    print
	$CGIpm->start_form({'-action'=>"$_script", '-method'=>'post'}),
	$CGIpm->hidden({'-name'=>'mode', '-value'=>"LOGIN"}),
	"USER ",
	$CGIpm->textfield({'-name'=>'user'}),
	$CGIpm->br(),
	"PASS ",
	$CGIpm->password_field({'-name'=>'pass'}),
	$CGIpm->submit({'-name'=>'mode', '-value'=>"$MODE_LOGIN"}),
	$CGIpm->end_form(),
	$CGIpm->br();
} 

sub menu_db { # データベースに接続できた
    my ($_script, $_q_user, $_passwd, $_rows_lp, $_num_rows) = @_; 
    my @_rows     = @$_rows_lp;
    my $_num_rows = @_rows;

    my @values = undef;
    my %lavels = undef;
    for (my $i=0; $i<$_num_rows; $i++) {
	$values[$i] = $_rows[$i];
	$lavels{"$_rows[$i]"} = $_rows[$i];
    }
    
    # 挨拶 
    print
	$CGIpm->start_form({'-action'=>"$_script", '-method'=>'post'}),
	"Welcome, $_q_user!! ",
	$CGIpm->submit({'-name'=>'logout', '-value'=>"ログアウト"}),
	$CGIpm->end_form(),
	# ----- データベース操作の選択肢 -----
	$CGIpm->start_form({'-action'=>"$_script", '-method'=>'post'}),
	$CGIpm->hidden({'-name'=>'user', '-value'=>"$_q_user"}),
	$CGIpm->hidden({'-name'=>'pass', '-value'=>"$_passwd"}),
	$CGIpm->textfield({'-name'=>'input_val','-size'=>'30'}),
	$CGIpm->submit({'-name'=>'mode', '-value'=>"$MODE_INSERT"}),
	$CGIpm->br(),
	"No.",
	$CGIpm->popup_menu({'-name'=>"input_num", '-values'=>[@values], '-labels'=>\%lavels}),
	# ----- データベース操作の選択肢 END -----
	$CGIpm->br(),
	$CGIpm->submit({'-name'=>'mode', '-value'=>"$MODE_UPDATE"}),
	$CGIpm->submit({'-name'=>'mode', '-value'=>"$MODE_DELETE"}),
	$CGIpm->end_form(),
	$CGIpm->br();
}

sub show {
    my ($_script, $_connect, $_mode, $_cols_lp, $_q_results_lp) = @_;
    my @_cols = @$_cols_lp;
    my @_q_results = @$_q_results_lp;
    my $_num_q_results = @_q_results;

    if ($_connect) {
	my $col_html;
	my $row_html;
	my @rows_html;

	foreach (@_cols) {
	    $col_html .= $CGIpm->th([$_]);
	}
	for (my $i=0; $i<$_num_q_results; $i++) {
	    $row_html = 
		$CGIpm->td([$_q_results[$i]{"id"}]).
		$CGIpm->td([$_q_results[$i]{"name"}]).
		$CGIpm->td([$_q_results[$i]{"memo"}]).
		$CGIpm->td([$_q_results[$i]{"date"}]);
	    $rows_html[$i] = $row_html;
	}

	print
	    $CGIpm->start_table({'-border'=>"2"}),
	    $CGIpm->caption($CGIpm->strong("TO-DO")),
	    $CGIpm->Tr({'-align'=>"center",'-valign'=>"top"}, [$col_html]),    
	    $CGIpm->Tr({'-align'=>"center",'-valign'=>"top"}, [@rows_html]),
	    $CGIpm->end_table();
    }

    switch ($_mode) {
	case "$MODE_INSERT" { 
	    print "query : [INSERT]";
	}
	case "$MODE_DELETE" { 
	    print "query : [DELETE]";
	}
	case "$MODE_UPDATE" { 
	    print "query : [UPDATE]";
	}
	case "$MODE_LOGIN" { 
	    print "ユーザー名、またはパスワードが間違っています。";
	}
    }
    print $CGIpm->br();
}

