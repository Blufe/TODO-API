#!/usr/bin/env perl

use strict;
use warnings;
use CGI;
use CGI::Carp qw(fatalsToBrowser);
use DBI;
use Switch;

require './lib/form.pl';
require './lib/mysql.pl';
require './lib/html.pl';

print "Content-type: text/html; charset=UTF-8\n\n";
my %inputs = &form::getFormData();

my $script = "index.cgi"; # スクリプト名

my $dbname = "TESTDB";    # データベース名
my $table  = "list";      # テーブル名
my $host   = "localhost"; # ホスト

my $user   = $inputs{'user'}; # ユーザー名の取得
my $passwd = $inputs{'pass'}; # パスワードの取得

my %dbh = ("name"   => $dbname, 
	   "table"  => $table,
	   "host"   => $host,
	   "user"   => $user,
	   "passwd" => $passwd);

my $mode    = $inputs{'mode'};
my $connect = undef;
my @result  = undef;

my $q_user  = undef;
my @rows    = undef;
my @cols    = undef;
my $num_rows = undef;
my $num_cols = undef;

my $input_val = undef;
my $input_num = undef;

# htmlヘッダー部分
&html::header("test");

# データベースに接続
$dbh{"handler"} = &mysql::init($dbh{"name"}, $dbh{"table"}, $dbh{"user"}, $dbh{"passwd"}, $dbh{"host"});  

$connect = defined($dbh{"handler"});
if ($connect) {
    $q_user   = &CGI::escapeHTML($dbh{"user"});
    @rows     = &mysql::rowList($dbh{"handler"}, $dbh{"table"}, "id");
    @cols     = &mysql::colList($dbh{"handler"}, $dbh{"table"});
    $num_rows = @rows;
    $num_cols = @cols;
    switch ($mode) {
	case "INSERT" {
	    $input_val = $inputs{'insert_val'};
	}
	case "INSERT" {
	    $input_val = $inputs{'update_val'};
	    $input_num = $inputs{'update_num'};
	}
	case "DELETE" {
	    $input_num = $inputs{'delete_num'};
	}
	case "LOGIN" {
	    $mode = "";
	}
    }
    
}

if ($connect) {
    &menu_db($script, %dbh, $input_val, $input_num, $q_user, @rows, $num_rows);
} else {
    &menu_login($script);
}

@result = &DBexec(%dbh, $input_val, $input_num, $q_user, @rows, $num_rows);

&show($script, $mode, @result);

&mysql::close($dbh{"handler"});

&html::footer();

exit 0;


sub menu_login {
    my ($_script) = @_;
    # ログインフォーム
    print "<form action='$_script' method='post'>";
    print "<input type='hidden' name='mode' value='LOGIN'>";
    print "USER <input type='text' name='user' value=''><br>";
    print "PASS <input type='password' name='pass' value=''> ";
    print "<input type='submit' name='login' value='ログイン'>";
    print "</form><br>\n";
} 

sub menu_db { # データベースに接続できた
    my ($_script, %_dbh, $_user, @_rows, $_num_rows) = @_; 

    # 挨拶 
    print "<form action='$_script' method='post'>";
    print "Welcome, $_user!!　　　　　";
    print "<input type='submit' name='logout' value='ログアウト'>";
    print "</form><br>\n";

    # ----- データベース操作の選択肢 -----
    print "<form action='$_script' method='post'>";
    print "<input type='hidden' name='user' value='$_user'>";
    print "<input type='hidden' name='pass' value='$_dbh{'passwd'}'>";
    # DB操作「表示」モード
    print "<input type=radio name=\"mode\" value=\"SELECT\"checked>[表示]<br>"; 
    # DB操作「変更」モード
    print "<input type=radio name=\"mode\" value=\"UPDATE\">[変更]";
    # ・変更するidカラムのプルダウンメニュー
    print " No.<select name=\"update_num\" size=1>";
    for (my $i=0; $i<$_num_rows; $i++) {
	print "<option value=\"$i\">$_rows[$i]";
    }
    print "</select> ";
    # ・変更する内容
    print "<input type=text name=\"update_val\" value=\"\" size=20><br>"; 
    # DB操作「削除」モード
    print "<input type=radio name=\"mode\" value=\"DELETE\">[削除]";
    # ・削除するidカラムのプルダウンメニュー
    print " No.<select name=\"delete_num\" size=1>";
    for (my $i=0; $i<$_num_rows; $i++) {
	print "<option value=\"$i\">$_rows[$i]";
    }
    print "</select><br>";
    # DB操作「挿入」モード
    print "<input type=radio name=\"mode\" value=\"INSERT\">[挿入]";
    # ・挿入する内容
    print " <input type=text name=\"insert_val\" value=\"\" size=20><br>"; 
    # ----- データベース操作の選択肢 END -----
    
    print "<br><input type='submit' name='exec' value='決定'>";
    print "</form><br>\n";
}

sub DBexec {
    my (%_dbh, $_mode, $_val, $_num, $_user, @_rows, $_num_rows) = @_;
    my @items;

    # DB操作モード別のアクション
    switch ($_mode) {
	case "SELECT" { # 「表示」モード
	    @items = &mysql::select($dbh{"handler"}, 
				    $dbh{"table"}, 
				    "id, name, memo",
				    "1");
	}
	case "INSERT" {
	    #for (my $i=0; )
	    #&mysql::insert($dbh{"handler"}, 
		#	   $dbh{"table"}, 
			#   "id, name, memo",
			 #  "");
	}
	case "DELETE" { 
	    for (my $i=0; $i<$_num_rows; $i++) {
		if ($i eq $_num) {
		    &mysql::delete($dbh{"handler"}, 
				   $dbh{"table"},
				   "id=$_rows[$i]");
		    last;
		}
	    }
	}
	case "UPDATE" { 
$_rows[i]="1=1;delete from master;--"
    
	    for (my $i=0; $i<$_num_rows; $i++) {
		if ($i eq $_num) {
		    &mysql::update($dbh{"handler"}, 
				   $dbh{"table"}, 
				   "memo=$_val", 
				   "id=$_rows[$i]");
		    last;
		}
	    }
	}
    }
    
    return @items;
}

sub show {
    my ($_script, $_mode, @_result) = @_;
    
    switch ($_mode) {
	case "SELECT" {
	    print "query : [SELECT]<br>\n";
	}
	case "INSERT" { 
	    print "query : [INSERT]<br>\n";
	}
	case "DELETE" { 
	    print "query : [DELETE]<br>\n";
	}
	case "UPDATE" { 
	    print "query : [UPDATE]<br>\n";
	}
	case "LOGIN" { 
	    print "<br>ユーザー名、またはパスワードが間違っています。<br>";
	}
    }
}

