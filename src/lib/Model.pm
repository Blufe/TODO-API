package Model;

use strict;
use warnings;

use utf8;
use Encode; 
use Switch;
use DBI qw(:sql_types);
use Acme::Comment type=>'C++', own_line => 0, one_line => 1;# C++風のコメントを使用できるようにする
use Data::Lock qw(dlock);
use Carp qw(croak);
use Carp qw(verbose); # デバッグ終了後消すこと
use Crypt::SaltedHash;

use lib qw(.);
use mysql;

dlock my $DEBUG = 0;

dlock my $TABLES = {
    "USER_LIST"     => "USER_LIST",
    "WORD_LIST"     => "WORD_LIST",
    "SENTENCE_LIST" => "SENTENCE_LIST"
    };

dlock my @ERRORS = (
		    "No problem",
		    "データベースに接続されていません",
		    "既すでに使われているユーザ名です",
		    "ユーザ登録に失敗しました",
		    "ユーザ名、またはパスワードが間違っています",
		    "不正なパスワードです",
		    "単語の登録に失敗しました",
		    "存在しない単語です",
		    "パスワードは８文字以上、６４文字以下です",
		    "ログインしなおしてください",
		    "TODOの登録に失敗しました",
		    "ユーザ名とパスワードを入力してください",
		    "変更処理に失敗しました",
		    "データベースの接続に失敗しました",
		    "データベースへのアクセスに失敗しました",
		    "日付のフォーマットが間違っています"# index : 15
		    );

sub new {
    my $thing = shift;
    my $class = ref($thing) || $thing;
    my ($dbname, $host, $userid, $passwd) = @_;
    my $self  = {
	"dbname" => $dbname,
	"host"   => $host,
	"userid" => $userid,
	"passwd" => $passwd,
	"dbh"    => undef,
	"error"  => $ERRORS[0],
	"errno"  => 0
	};

    return bless $self => $class;
}

sub error {
    my $self = shift;
    my ($errno, $errmsg) = @_;

    if ($errno) {
	$self->{"errno"} = $errno;
	$self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
	if ($DEBUG) {
	    if ($@) {
		croak $@;
	    }else {
		croak "ERROR($self->{\"errno\"}) : $self->{\"error\"}"; 
	    }
	}
    }

    return "ERROR($self->{\"errno\"}) : $self->{\"error\"}";
}

sub connect {
    my $self = shift;
    my $hit  = 0;

    eval {
	$self->{"dbh"} = &mysql::init($self->{"dbname"},
				      $self->{"userid"},
				      $self->{"passwd"},
				      $self->{"host"});
    };
    if ($@) {
	&error($self, 14, $@);
    } else {
	$hit = defined($self->{"dbh"});
	if (!$hit) {
	    &error($self, 13);
	} 
    }

    return $hit;
}

sub connected {
    my $self   = shift;
    my $result = 0;

    $result = defined($self->{"dbh"});
    
    return $result;
}

sub disconnect {
    my $self = shift;

    if (&connected($self)) {
	&mysql::close($self->{"dbh"});
    }

    return 0;
}

sub get_colList {
    my $self    = shift;
    my ($table) = @_;
    my @colList = undef;
    
    if (&connected($self)) {
	eval {
	    @colList = &mysql::colList($self->{"dbh"}, $table);
	};
	if ($@) {
	    &error($self, 14, $@);
	}
    } else {
	&error($self, 1);
    }

    return @colList;    
}

sub get_rowList {
    my $self    = shift;
    my ($table, $field) = @_;
    my @rowList = undef;
    
    if (&connected($self)) {
	eval {
	    @rowList = &mysql::rowList($self->{"dbh"}, $table, $field);
	};
	if ($@) {
	    &error($self, 14, $@);
	}
    } else {
	&error($self, 1);
    }

    return @rowList;
}

sub make_passwd {
    my $self     = shift;
    my ($passwd) = @_;
    my $salted   = undef;

    if ($passwd =~ /(\S{8,64}?$)/) {
	my $csh = Crypt::SaltedHash->new(algorithm => 'SHA-256', salt_len => 8);
	$csh->add($passwd);
	$salted = $csh->generate;
    } else {
	&error($self, 8);
    }
    
    return $salted;
}
    
sub check_passwd {
    my $self     = shift;
    my ($salted, $passwd) = @_;
    my $valid    = undef; 

    $valid = Crypt::SaltedHash->validate($passwd, $salted, 8);

    return $valid;
}

sub exist_user {
    my $self     = shift;
    my ($userid) = @_;
    my $table    = $TABLES->{"USER_LIST"};
    my @values   = ($userid);
    my @types    = (SQL_VARCHAR);
    my $exist    = undef;

    if (&connected($self)) {
	eval {
	    $exist = &mysql::exist_record($self->{"dbh"}, $table,
					  "$table.userID=?", 
					  \@values, \@types);
	};
	if ($@) {
	    &error($self, 14, $@);
	}
    } else {
	&error($self, 1);
    }    

    return $exist;
}

sub reg_user {
    my $self     = shift;
    my ($userid, $passwd) = @_;
    my $table    = $TABLES->{"USER_LIST"};
    my @values   = undef;
    my @types    = undef;
    my $hit      = 0;

    if ((!defined($userid)) || (!defined($passwd))) {
	&error($self, 11);
    } elsif (&connected($self)) {
	my $exist = &exist_user($self, $userid);
	if (!$exist) {
	    $values[0] = $userid;
	    $types[0]  = SQL_VARCHAR;
	    $values[1] = &make_passwd($self, $passwd);
	    $types[1]  = SQL_VARCHAR;
	    eval {
		&mysql::insert($self->{"dbh"}, $table, 
			       "$table.userID, $table.passwd", "?, ?",
			       \@values, \@types);
	    };
	    if ($@) {
		&error($self, 14, $@);
	    } elsif (&exist_user($self, $userid)) {
		$hit = 1;
	    } else {
		&error($self, 3);
	    }
	} else {
	    &error($self, 2);
	}
    } else {
	&error($self, 1);
    }

    return $hit;
}

sub login_user {
    my $self     = shift;
    my ($userid, $passwd) = @_;
    my $table    = $TABLES->{"USER_LIST"};
    my @values   = ($userid);
    my @types    = (SQL_VARCHAR);
    my @items    = undef;
    my $salted   = undef;
    my $hit      = 0;

    if ((!defined($userid)) || (!defined($passwd))) {
	&error($self, 11);
    } elsif (&connected($self)) {
	eval {
	    @items = &mysql::select($self->{"dbh"}, $table, 
				    "$table.passwd", 
				    "$table.userID=?",
				    \@values, \@types);
	};
	if ($@) {
	    &error($self, 14, $@);
	} elsif (!defined(@items)) {
	    &error($self, 4);
	} else {
	    $salted = $items[0]{"passwd"};
	    if (&check_passwd($self, $passwd, $salted)) {
		$hit = 1;
	    } else {
		&error($self, 4);
	    }
	}
    } else {
	&error($self, 1);
    }

    return $hit;    
}

sub exist_word {
    my $self   = shift;
    my ($userid, $word, $type, $sentenceid) = @_;
    my $table  = $TABLES->{"WORD_LIST"};
    my @values = ($word, $type, $sentenceid, $userid);
    my @types  = (SQL_VARCHAR, SQL_VARCHAR, SQL_INTEGER, SQL_VARCHAR);
    my $exist  = 0;

    if (&connected($self)) {
	eval {
	    $exist = &mysql::exist_record($self->{"dbh"}, $table, 
					  "($table.word=?) AND ($table.type=?) AND ($table.sentenceID=?) AND ($table.userID=?)",
					  \@values, \@types);
	};
	if ($@) {
	    &error($self, 14, $@);
	}
    } else {
	&error($self, 1);
    }

    return $exist;
}

sub reg_word {
    my $self   = shift;
    my ($userid, $word, $type, $sentenceid) = @_;
    my $table  = $TABLES->{"WORD_LIST"};
    my @values = ($word, $type, $sentenceid, $userid);
    my @types  = (SQL_VARCHAR, SQL_VARCHAR, SQL_INTEGER, SQL_VARCHAR);
    my $w_id   = 0;

    if (&connected($self)) {
	eval {
	    $w_id = &mysql::insert($self->{"dbh"}, $table, 
				   "$table.word, $table.type, $table.sentenceID, $table.userID",
				   "?, ?, ?, ?",
				   \@values, \@types);
	};
	if ($@) {
	    &error($self, 14, $@);
	} elsif (!$w_id) {
	    &error($self, 6);
	}
    } else {
	&error($self, 1);
    }

    return $w_id;
}

sub get_word {
    my $self   = shift;
    my ($userid, $w_id) = @_;
    my $table  = $TABLES->{"WORD_LIST"};
    my @values = ($w_id, $userid);
    my @types  = (SQL_INTEGER, SQL_VARCHAR);
    my $word   = undef;
    my @items  = undef;

    if (&connected($self)) {
	eval {
	    @items = &mysql::select($self->{"dbh"}, $table, 
				    "$table.word", 
				    "($table.w_id=?) AND ($table.userID=?)",
				    \@values, \@types);
	};
	if ($@) {
	    &error($self, 14, $@);
	} else {
	    if (@items) {
		$word = $items[0]{"word"};
	    }
	    if (!$word) {
		&error($self, 7);
	    }
	}
    } else {
	&error($self, 1);
    }

    return $word;
}

sub get_wordList {
    my $self   = shift;
    my ($userid, $type, $sentenceid) = @_;
    my $table  = $TABLES->{"WORD_LIST"};
    my @values = undef;
    my @types  = undef;
    my @wordList = undef;
    my $where  = "";
    my $count  = 0;
    
    if (&connected($self)) {
	$where .= "($table.userID=?)";
	$values[$count] = $userid;
	$types [$count] = SQL_VARCHAR;
	$count++;    
	if (defined($type)) {
	    $where .= " AND ($table.type=?)";
	    $values[$count] = $type;
	    $types [$count] = SQL_VARCHAR;
	    $count++;
	}
	if (defined($sentenceid)) {
	    $where .= " AND ($table.sentenceID=?)";
	    $values[$count] = $sentenceid;
	    $types [$count] = SQL_INTEGER;
	    $count++;
	}
	eval {
	    @wordList = &mysql::select($self->{"dbh"}, $table, 
				       "$table.word, $table.type, $table.sentenceid", 
				       $where,
				       \@values, \@types);
	};
	if ($@) {
	    &error($self, 14, $@);
	}
    } else {
	&error($self, 1);
    }

    return @wordList;
}

sub exist_sentence {
    my $self   = shift;
    my ($userid, $s_id) = @_;
    my $table  = $TABLES->{"SENTENCE_LIST"};
    my @values = undef;
    my @types  = undef;
    my @items  = undef;
    my $exist  = 0;

    if (!defined($self->{"userid"})) {
	&error($self, 9);
    } elsif (&connected($self)) {
	$values[0] = $s_id;
	$types [0] = SQL_INTEGER;
	$values[1] = $userid;
	$types [1] = SQL_VARCHAR;
	eval {
	    $exist = &mysql::exist_record($self->{"dbh"}, $table, 
					  "($table.sentenceID=?) AND ($table.userID=?)",
					  \@values, \@types);
	};
	if ($@) {
	    &error($self, 14, $@);
	} 
    } else {
	&error($self, 1);
    }

    return $exist;
}

sub reg_sentence {
    my $self   = shift;
    my ($userid, $text) = @_;
    my $table  = $TABLES->{"SENTENCE_LIST"};
    my @values = undef;
    my @types  = undef;
    my $s_id   = 0;

    if (!defined($self->{"userid"})) {
	&error($self, 9);
    } elsif (&connected($self)) {
	$values[0] = $text;
	$types [0] = SQL_VARCHAR;
	$values[1] = $userid;
	$types [1] = SQL_VARCHAR;
	eval {
	    $s_id = &mysql::insert($self->{"dbh"}, $table, 
				   "$table.todo, $table.creation_date, $table.finished, $table.userID",
				   "?, now(), 'false', ?",
				   \@values, \@types);
	};
	if ($@) {
	    &error($self, 14, $@);
	} elsif (!$s_id) {
	    &error($self, 10);
	}
    } else {
	&error($self, 1);
    }

    return $s_id;    
}

sub del_sentence {
    my $self   = shift;
    my ($userid, $s_id) = @_;
    my $table  = $TABLES->{"SENTENCE_LIST"};
    my @values = undef;
    my @types  = undef;
    my $hit    = 0;

    if (!defined($self->{"userid"})) {
	&error($self, 9);
    } elsif (&connected($self)) {
	$values[0] = $s_id;
	$types [0] = SQL_INTEGER;
	$values[1] = $userid;
	$types [1] = SQL_VARCHAR;
	eval {
	    &mysql::delete($self->{"dbh"}, $table, 
			   "($table.sentenceID=?) AND ($table.userID=?)",
			   \@values, \@types);
	};
	if ($@) {
	    &error($self, 14, $@);
	} else {
	    $hit = &exist_sentence($self, $s_id);
	    if (!defined($hit)) {
		&error($self, 12);
	    }
	}
    } else {
	&error($self, 1);
    }

    return $hit;
}

sub set_sentence_todo {
    my $self   = shift;
    my ($userid, $s_id, $text) = @_;
    my $table  = $TABLES->{"SENTENCE_LIST"};
    my @values = undef;
    my @types  = undef;
    my $hit    = 0;

    if (!defined($self->{"userid"})) {
	&error($self, 9);
    } elsif (&connected($self)) {
	$values[0] = $text;
	$types [0] = SQL_VARCHAR;
	$values[1] = $s_id;
	$types [1] = SQL_INTEGER;
	$values[2] = $userid;
	$types [2] = SQL_VARCHAR;
	eval {
	    $hit = &mysql::update($self->{"dbh"}, $table, 
				  "$table.todo=?", 
				  "($table.sentenceID=?) AND ($table.userID=?)",
				  \@values, \@types);
	};
	if ($@) {
	    &error($self, 14, $@);
	} elsif (!defined($hit)) {
	    &error($self, 12);
	}
    } else {
	&error($self, 1);
    }

    return $hit;    
}

sub set_sentence_deadline {
    my $self   = shift;
    my ($userid, $s_id, $deadline) = @_;
    my $table  = $TABLES->{"SENTENCE_LIST"};
    my @values = undef;
    my @types  = undef;
    my $hit    = 0;

    if (!defined($self->{"userid"})) {
	&error($self, 9);
    } elsif (&connected($self)) {
	if ($deadline =~ /^\d{8}$/) {
	    $values[0] = $deadline;
	    $types [0] = SQL_CHAR;
	    $values[1] = $s_id;
	    $types [1] = SQL_INTEGER;
	    $values[2] = $userid;
	    $types [2] = SQL_VARCHAR;
	    eval {
		$hit = &mysql::update($self->{"dbh"}, $table, 
				      "$table.deadline=?", 
				      "($table.sentenceID=?) AND ($table.userID=?)",
				      \@values, \@types);
	    };
	    if ($@) {
		&error($self, 14, $@);
	    } elsif (!defined($hit)) {
		&error($self, 12);
	    }
	} else {
	    &error($self, 15);
	}
    } else {
	&error($self, 1);
    }

    return $hit;
}

sub set_sentence_finished {
    my $self   = shift;
    my ($userid, $s_id, $finished) = @_;
    my $table  = $TABLES->{"SENTENCE_LIST"};
    my @values = undef;
    my @types  = undef;
    my $hit    = 0;

    if (!defined($self->{"userid"})) {
	&error($self, 9);
    } elsif (&connected($self)) {
	$values[0] = $finished;
	$types [0] = SQL_CHAR;
	$values[1] = $s_id;
	$types [1] = SQL_INTEGER;
	$values[2] = $userid;
	$types [2] = SQL_VARCHAR;
	eval {
	    $hit = &mysql::update($self->{"dbh"}, $table, 
				  "$table.finished=?",
				  "($table.sentenceID=?) AND ($table.userID=?)",
				  \@values, \@types);
	};
	if ($@) {
	    &error($self, 14, $@);
	} elsif (!defined($hit)) {
	    &error($self, 12);
	}
    } else {
	&error($self, 1);
    }

    return $hit;
}

sub get_sentenceList {
    my $self   = shift;
    my ($userid, $words_lp, $date_b, $date_a, $finished) = @_;
    my @words  = @$words_lp;

    my $table  = $TABLES->{"SENTENCE_LIST"};
    my @values = undef;
    my @types  = undef;
    my $where  = "";
    my $count  = 0;

    my @sentenceList = undef;
    
    if (!defined($userid)) {
	&error($self, 9);
    } elsif (&connected($self)) {
	$values[$count] = $userid;
	$types [$count] = SQL_VARCHAR;
	$where .= "($table.userID=?) ";
	$count++;
	if (($finished eq "false") || ($finished eq "true")) {
	    $values[$count] = $finished;
	    $types [$count] = SQL_CHAR;
	    $where .= "AND ($table.finished=?)";
	    $count++;
	}
	if (($date_b) || ($date_a)) {
	    $where .= "AND (1";
	    if ($date_b =~ /^\d{8}$/) {
		$values[$count] = $date_b;
		$types [$count] = SQL_VARCHAR;
		$where .= "AND ($table.deadline>=?)";
		$count++;
	    }
	    if ($date_a =~ /^\d{8}$/) {
		$values[$count] = $date_a;
		$types [$count] = SQL_VARCHAR;
		$where .= "AND ($table.deadline<=?)";
		$count++;
	    }
	    $where .= ")";
	}
	if (@words) {
	    foreach (@words) {
		if ($_) { 
		    $values[$count] = "%".$_."%";
		    $types [$count] = SQL_VARCHAR;
		    $where .= " AND ($table.text LIKE ?)";
		    $count++;
		}
	    }
	} 
	eval {
	    @sentenceList = &mysql::select($self->{"dbh"}, $table, 
					   "$table.sentenceID, $table.todo, $table.creation_date, $table.deadline, $table.finished",
					   $where,
					   \@values, \@types);
	};
	if ($@) {
	    &error($self, 14, $@);
	}
    } else {
	&error($self, 1);
    }

    return @sentenceList;    
}

;

