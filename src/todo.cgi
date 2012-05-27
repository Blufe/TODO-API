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

my $script = "login.cgi";     # スクリプト名
my $dbname = "TODODB";        # データベース名
my $dbhost = "localhost";     # ホスト
my $dbuser = "SCI01449";      # ユーザ名
my $dbpass = "DBPW#0511loki"; # パスワード
my $userid = &Encode::decode("UTF-8", $CGIpm->param('userid'));
my $passwd = &Encode::decode("UTF-8", $CGIpm->param('passwd'));
my $mode   = &Encode::decode("UTF-8", $CGIpm->param('mode'));

my $model = new Model($dbname, $dbhost, $dbuser, $dbpass);
my $view  = new View();

my @sentenceList = undef;
my $login   = 0;
my $failure = 0;
my $error = "";

print $CGIpm->header({-type => 'text/xml','-charset'=>'UTF-8'});

# データベース接続
if ($model->connect()) {
# 認証
    if ($model->login_user($userid, $passwd)) {
	$login = 1;
    }
}

if ($login) {
    switch ($mode) {
	case "SEARCH" {
	    my @words    = split(/[\s]+/, &Encode::decode("UTF-8", $CGIpm->param('words')));
	    my $date_b   = &Encode::decode("UTF-8", $CGIpm->param('date_b'));
	    my $date_a   = &Encode::decode("UTF-8", $CGIpm->param('date_a'));
	    my $finished = &Encode::decode("UTF-8", $CGIpm->param('finished'));
	    @sentenceList = $model->get_sentenceList($userid, \@words, $date_b, $date_a, $finished);
	    $view->xml_searchSuccess(\@sentenceList);
	}
	else {
	    $view->xml_actionFailure("ERROR : 不正な要求です");
	}
    }
} else {
    $view->xml_actionFailure("ERROR : ログインしなおして下さい");
}

exit 0;

