#!/usr/bin/env perl

use strict;
use warnings;
use CGI::Carp qw(fatalsToBrowser);
use CGI;

use utf8;
use Encode; 
use Switch;
use Acme::Comment type=>'C++', own_line => 0, one_line => 1;# C++風のコメントを使用できるようにする
use Data::Lock qw(dlock);
use Carp qw(croak);
use Crypt::SaltedHash;

use lib qw(./lib);
use Model;
use View;

my $CGIpm = new CGI;
$CGIpm->charset("utf-8");

my $mode   = &Encode::decode("UTF-8", $CGIpm->param('mode'));

# データベース情報
my $script = "login.cgi";     # スクリプト名
my $dbname = "TODODB";        # データベース名
my $dbhost = "localhost";     # ホスト
my $dbuser = "SCI01449";      # ユーザ名
my $dbpass = "DBPW#0511loki"; # パスワード

# ユーザ情報
my $userid = &Encode::decode("UTF-8", $CGIpm->param('userid'));
my $passwd = &Encode::decode("UTF-8", $CGIpm->param('passwd'));

# 検索情報
my @s_words    = split(/[\s]+/, &Encode::decode("UTF-8", $CGIpm->param('s_words')));
my $s_date_b   = &Encode::decode("UTF-8", $CGIpm->param('s_date_b'));
my $s_date_a   = &Encode::decode("UTF-8", $CGIpm->param('s_date_a'));
my $s_finished = &Encode::decode("UTF-8", $CGIpm->param('s_finished'));
my $s_order    = &Encode::decode("UTF-8", $CGIpm->param('s_order'));

# TODO追加情報
my $Owords   = &Encode::decode("UTF-8", $CGIpm->param('Owords'));
my $Vwords   = &Encode::decode("UTF-8", $CGIpm->param('Vwords'));

# TODO変更情報
my $chmode     = &Encode::decode("UTF-8", $CGIpm->param('chmode'));
my $sentenceID = &Encode::decode("UTF-8", $CGIpm->param('sentenceid'));
my $deadline   = &Encode::decode("UTF-8", $CGIpm->param('deadline'));
my $finished   = &Encode::decode("UTF-8", $CGIpm->param('finished'));
my $sentence   = &Encode::decode("UTF-8", $CGIpm->param('sentence'));

my $model = new Model($dbname, $dbhost, $dbuser, $dbpass);
my $view  = new View($CGIpm);

my @sentenceList = undef;
my $login   = 0;

print $CGIpm->header({-type => 'text/xml','-charset'=>'UTF-8'});

# データベース接続
if ($model->connect()) {
# 認証
    if ($model->login_user($userid, $passwd)) {
	$login = 1;
    }
}

if ($login) {
    eval {
	switch ($mode) {
	    case "SEARCH" {
		# 検索条件を元に検索
		@sentenceList = $model->get_sentenceList($userid, \@s_words, $s_date_b, $s_date_a, $s_finished, $s_order);
		(!$model->errno()) or die $model->error();
	    }
	    case "INSERT" {
		# TODOの追加
		$sentenceID = $model->reg_sentence($userid, $Owords.$Vwords);
		(!$model->errno()) or die $model->error();
		# TODOの編集
		$deadline =~ s/\s+|-+//g;
		if ($deadline) {
		    $model->set_sentence_deadline($userid, $sentenceID, $deadline);
		    (!$model->errno()) or die $model->error();
		}
		# 単語の登録
		if ($Owords) {
		    $model->reg_word($userid, $Owords, "O");   
		    (!$model->errno()) or die $model->error();
		}
		if ($Vwords) {
		    $model->reg_word($userid, $Vwords, "V");
		    (!$model->errno()) or die $model->error();
		}
		# 検索条件を元に検索
		@sentenceList = $model->get_sentenceList($userid, \@s_words, $s_date_b, $s_date_a, $s_finished, $s_order);
		(!$model->errno()) or die $model->error();    
	    }
	    case "UPDATE" {
		# TODOの編集
		switch ($chmode) {
		    case "DEADLINE" {
			$deadline =~ s/\s+|-+//g;
			if ($deadline) {
			    $model->set_sentence_deadline($userid, $sentenceID, $deadline);
			    (!$model->errno()) or die $model->error();
			}
		    }
		    case "FINISHED" {
			if ($finished) {
			    $model->set_sentence_finished($userid, $sentenceID, $finished);
			    (!$model->errno()) or die $model->error();
			}
		    }
		    case "SENTENCE" {
			if ($sentence) {
			    $model->set_sentence_todo($userid, $sentenceID, $sentence);
			    (!$model->errno()) or die $model->error();
			} else {
			    $model->del_sentence($userid, $sentenceID);
			    (!$model->errno()) or die $model->error();
			}
		    }
		}
		# 検索条件を元に検索
		@sentenceList = $model->get_sentenceList($userid, \@s_words, $s_date_b, $s_date_a, $s_finished, $s_order);
		(!$model->errno()) or die $model->error();
	    }
	    else {
		$view->xml_actionFailure("ERROR : 不正な要求です");
	    }
	}
    };
    if ($@) {
	$view->xml_actionFailure($model->error());
    } else {
	$view->xml_searchSuccess(\@sentenceList);
    }
} else {
    $view->xml_actionFailure("ERROR : ログインしなおして下さい");
}

exit 0;

