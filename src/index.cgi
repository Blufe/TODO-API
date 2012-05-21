#!/usr/bin/env perl

use strict;
use warnings;
use Switch;
use utf8;
use Encode; 
use CGI::Carp qw(fatalsToBrowser);
use DBI qw(:sql_types);
use CGI;

require './lib/mysql.pl';

my $script = "index.cgi"; # スクリプト名
my $CGIpm = new CGI;
$CGIpm->charset("utf-8");

my $dbname = "TODODB";    # データベース名
my $table  = "todo";      # テーブル名
my $host   = "localhost"; # ホスト

my $user   = &Encode::decode("UTF-8", $CGIpm->param('user'));
my $passwd = &Encode::decode("UTF-8", $CGIpm->param('pass'));
my $dbh    = undef;

my $MODE_LOGIN  = "ログイン";
my $MODE_INSERT = "追加";
my $MODE_UPDATE = "変更";
my $MODE_DELETE = "削除";
my $mode    = undef;
my $connect = undef;
my @results   = undef; # TODOデータ
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
$dbh = &mysql::init($dbname, $user, $passwd, $host);
$connect = defined($dbh);

$mode   = &Encode::decode("UTF-8", $CGIpm->param('mode'));
$q_user = $CGIpm->escapeHTML($user); 
@rows   = &mysql::rowList($dbh, $table, "t_id");
@cols   = &mysql::colList($dbh, $table);

switch ($mode) {
    case "$MODE_INSERT" {
	$input_val = &Encode::decode("UTF-8", $CGIpm->param('input_val'));
    }
    case "$MODE_UPDATE" {
	$input_val = &Encode::decode("UTF-8", $CGIpm->param('input_val'));
	$input_num = &Encode::decode("UTF-8", $CGIpm->param('input_num'));
    }
    case "$MODE_DELETE" {
	$input_num = &Encode::decode("UTF-8", $CGIpm->param('input_num'));
    }
    case "$MODE_LOGIN" {
	if ($connect) {
	    $mode = "";
	}
    }
}    

# データベース操作
@results = &DBexec($mode, $dbh, $table, $user, $input_val, $input_num, \@rows);
@rows    = &mysql::rowList($dbh, $table, "t_id");
@cols    = &mysql::colList($dbh, $table);
for (my $i=0, my $num_results=@results; $i<$num_results; $i++) {
    if (defined($results[$i])) {
	foreach my $name (%{$results[$i]}) {
	    $q_results[$i]{$name} = &Encode::decode("UTF-8", $CGIpm->escapeHTML($results[$i]{$name}));
	}
    }
}

if ($connect) {
    &menu_db($script, $q_user, $passwd, \@rows);
} else {
    &menu_login($script);
}

&show($script, $connect, $mode, \@cols, \@q_results);

# データベースに切断
&mysql::close($dbh);

# htmlフッター部分
print $CGIpm->end_html();

exit 0;

sub DBexec {
    my ($_mode, $_dbh, $_table, $_user, $_val, $_num, $_rows_lp) = @_;
    my @_rows     = @$_rows_lp;
    my $_num_rows = @_rows;
    my @_values    = undef;
    my @_types     = undef;
    my @_items     = undef;
    my %_wordDB    = undef;
    my $insert_id  = undef;

    # DB操作モード別のアクション
    switch ($_mode) {
	case "$MODE_INSERT" {
	    @_values = ($_user, $_val);
	    @_types  = (SQL_CHAR,SQL_CHAR);
	    %_wordDB =  &check_word($_val);
	    $insert_id = &mysql::insert($_dbh, $_table, 
					"name, memo, date", "?, ?, now()",
					\@_values, \@_types);
	    &register_word($_dbh, $insert_id, \%_wordDB);
	}
	case "$MODE_DELETE" { 
	    for (my $i=0; $i<$_num_rows; $i++) {
		if ($_rows[$i] eq $_num) {
		    @_values = ($_rows[$i]);
		    @_types  = (SQL_INTEGER);
		    &mysql::delete($_dbh, $_table, 
				   "t_id=?",
				   \@_values, \@_types);
		    $insert_id = $_rows[$i];
		    last;
		}
	    }
	}
	case "$MODE_UPDATE" { 
	    for (my $i=0; $i<$_num_rows; $i++) {
		if ($_rows[$i] eq $_num) {
		    @_values = ($_val, $_rows[$i]);
		    @_types  = (SQL_CHAR, SQL_INTEGER);
		    %_wordDB =  &check($_val);
		    &mysql::update($_dbh, $_table,
				   "memo=?", "t_id=?",
				   \@_values, \@_types);
		    $insert_id = $_rows[$i];
		    &register_word($_dbh, $insert_id, \%_wordDB);
		    last;
		}
	    }
	}
    }
    @_items = &mysql::select($_dbh, $_table, 
			    "t_id, name, memo, date", "1", 
			    \@_values, \@_types);
    
    return @_items;
}

sub register_word {
    my ($_dbh, $_t_id, $_wordDB_lp) = @_;
    my $_word_table  = "word";
    my $_list_table  = "list";
    my %_wordDB = %{$_wordDB_lp};
    my @_word_values = undef;
    my @_word_types  = undef;
    my @_list_values = undef;
    my @_list_types  = undef;

    $_list_values[0] = $_t_id;
    $_list_types[0]  = SQL_INTEGER;
    foreach my $type (%_wordDB) {
	$_word_values[0] = $type;
	$_word_types[0]  = SQL_CHAR;

	foreach (@{$_wordDB{$type}}) {
	    $_word_values[1] = $_;
	    $_word_types[1]  = SQL_CHAR;
	    my $_w_id = &mysql::insert($_dbh, $_word_table, 
				      "type, word", "?, ?",
				      \@_word_values, \@_word_types);

	    if ($_w_id) {
		$_list_values[1] = $_w_id;
		$_list_types[1]  = SQL_INTEGER;
		&mysql::insert($_dbh, $_list_table, 
			       "t_id, w_id", "?, ?",
			       \@_list_values, \@_list_types);
	    }
	}
    }
}

sub check_word {
    my ($_memo) = @_;
    my $word    = undef;
    my $escape  = undef;
    my @words   = undef;
    my (@S_words, @V_words, @O_words);
    my ($num_words, $num_S_words, $num_V_words, $num_O_words, $num_other);
    my ($S_word, $V_word, $O_word);
    my @other   = undef;
    my %wordDB  = undef;

    # 全半角スペースの除去
    @words = split(/[\s]+/,$_memo);
    $num_words = @words;
    $num_S_words = $num_V_words = $num_O_words = $num_other = 0;
    $escape = undef;

    # １文ならother
    if (($_memo !~ /\\/) && ($num_words == 1)) {
	@other = @words;
    } else {
	# 分けた短文を参照
	foreach (@words) {
	    $word = $_;
	    
	    # 短文を初めに現れた\で２分割
	    while ($word =~ /\\/) {
		# 前半部の処理
		$word = "$`";
		if ("$word") {
		    switch ($escape) {
			case "S" {    
			    $S_words[$num_S_words++] = "$word";
			}
			case "V" {
			    $V_words[$num_V_words++] = "$word";
			}
			case "O" {
			    $O_words[$num_O_words++] = "$word";
			}
			elsif ($num_O_words == 0) {
			    $O_words[$num_O_words++] = "$word";
			}
			elsif ($num_V_words == 0) {
			    $V_words[$num_V_words++] = "$word";
			}
			else {
			    $other[$num_other++] = "$word";
			}
		    }
		    $escape = undef;
		}

		# 後半部を短文として参照
		$word   = "$'";
		if ($word =~ /^[svoSVO]/) {
		    $escape = "\U$&\E";
		    $word   = "$'";
		} else {
		    $escape = undef;
		}
	    }
	    if ("$word") {
		switch ($escape) {
		    case "S" {    
			$S_words[$num_S_words++] = "$word";
		    }
		    case "V" {
			$V_words[$num_V_words++] = "$word";
		    }
		    case "O" {
			$O_words[$num_O_words++] = "$word";
		    }
		    elsif ($num_O_words == 0) {
			$O_words[$num_O_words++] = "$word";
		    }
		    elsif ($num_V_words == 0) {
			$V_words[$num_V_words++] = "$word";
		    }
		    else {
			$other[$num_other++] = "$word";
		    }
		}
		$escape = undef;
	    }
	    # \が短文の中に無くなったら次の短文を参照
	}
    }
    print "Ss : @S_words<br>";
    print "Vs : @V_words<br>";
    print "Os : @O_words<br>";
    print "Ot : @other<br>";
    $wordDB{"S"}     = [@S_words];
    $wordDB{"V"}     = [@V_words];
    $wordDB{"O"}     = [@O_words];
    $wordDB{"other"} = [@other];

    return %wordDB;
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
	# ----- データベース操作の選択肢 ----
	$CGIpm->start_form({'-action'=>"$_script", '-method'=>'post'}),
	$CGIpm->hidden({'-name'=>'user', '-value'=>"$_q_user"}),
	$CGIpm->hidden({'-name'=>'pass', '-value'=>"$_passwd"}),
	$CGIpm->textfield({'-name'=>'input_val','-value'=>'','-size'=>'30'}),
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
		$CGIpm->td([$_q_results[$i]{"t_id"}]).
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

