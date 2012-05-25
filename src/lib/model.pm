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

#require './mysql.pl';

dlock my %TABLES = {
    "USER_LIST"     => "USER_LIST",
    "WORD_LIST"     => "WORD_LIST",
    "SENTENCE_LIST" => "SENTENCE_LIST"
    };

dlock my @ERRORS = (
		    "No problem",
		    "Not connected",
		    "Not exist userid (%s)",
		    "Fail user register ",
		    "Not exist userid or password",
		    "Incorrect password",
		    "Fail word register ",
		    "Not exist word",
		    "Password is 8 characters or more and 64 characters or less",
		    "Please login again",
		    "Fail word register ",
		    "Incorrect account",
		    "Failed to change"# index : 12
		    );

sub new {
    my $class = shift;
    my ($dbname, $host, $userid, $passwd) = @_;
    my %self  = {
	"dbname" => $dbname,
	"host"   => $host,
	"userid" => $userid,
	"passwd" => $passwd,
	"dbh"    => undef,
	"error"  => $ERRORS[0],
	"errno"  => 0
	};
    
    return bless \%self => $class;
}

sub error {
    my $self = shift;
    return "ERROR: ($self->{\"errno\"})\"$self->{\"error\"}\"";
}

sub connect {
    my $self = shift;

    $self->{"dbh"} = &mysql::init($self->{"dbname"},
				  $self->{"userid"},
				  $self->{"passwd"},
				  $self->{"host"});

    return defined($self->{"dbh"});
}

sub connected {
    my $self = shift;

    return defined($self->{"dbh"});
}

sub disconnect {
    my $self = shift;

    if (&connected()) {
	&mysql::close($self->{"dbh"});
    }

    return 0;
}

sub get_colList {
    my $self    = shift;
    my ($table) = @_;
    my @colList = undef;
    
    if (&connected()) {
	@colList = &mysql::colList($self->{"dbh"}, $table);
    } else {
	$self->{"errno"} = 1;
	$self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
	croak &error($self);
    }

    return @colList;    
}

sub get_rowList {
    my $self    = shift;
    my ($table, $field) = @_;
    my @rowList = undef;
    
    if (&connected()) {
	@rowList = &mysql::rowList($self->{"dbh"}, $table, $field);
    } else {
	$self->{"errno"} = 1;
	$self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
	croak &error($self);
    }

    return @rowList;
}

sub make_passwd {
    my $self     = shift;
    my $salted   = undef;

    if ($self->{"passwd"} =~ /(\S{8,64}?$)/) {
	my $csh = Crypt::SaltedHash->new(algorithm => 'SHA-256', salt_len => 8);
	$csh->add($self->{"passwd"});
	$salted = $csh->generate;
    } else {
	$self->{"errno"} = 8;
        $self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
        croak &error($self);
    }
    
    return $salted;
}
    
sub check_passwd {
    my $self     = shift;
    my ($salted) = @_;
    my $valid    = undef; 

    $valid = Crypt::SaltedHash->validate($salted, $self->{"passwd"}, 8);

    return $valid;
}

sub exist_user {
    my $self     = shift;
    my $table    = $TABLES{"USER_LIST"};
    my @values   = ($self->{"userid"});
    my @types    = (SQL_VARCHAR);
    my $exist    = undef;

    if (&connected()) {
	$exist = &mysql::exist_record($self->{"dbh"}, $table, 
				      "userID", "userID=?", 
				      \@values, \@types);	
    } else {
	$self->{"errno"} = 1;
	$self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
	croak &error($self);
    }    

    return $exist;
}

sub reg_user {
    my $self     = shift;
    my ($userid, $passwd) = @_;
    my $table    = $TABLES{"USER_LIST"};
    my @values   = ($userid, $passwd);
    my @types    = (SQL_VARCHAR, SQL_VARCHAR);
    my $hit      = 0;

    if (!defined($userid)) {
	$userid = $self->{"userid"};
    } else {
	$self->{"userid"} = $userid;
    }

    if (!defined($passwd)) {
	$passwd = $self->{"passwd"};
    } else {
	$self->{"passwd"} = $passwd;
    }

    if ((!defined($userid)) || (!defined($passwd))) {
	$self->{"errno"} = 11;
	$self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
	croak &error($self);
    } elsif (&connected()) {
	my $exist = &exist_user($self, $userid, $passwd);
	if (!$exist) {
	    &mysql::insert($self->{"dbh"}, $table, 
			   "userID, passwd", "?, ?",
			   \@values, \@types);
	    if (&exist_user($userid)) {
		$hit = 1;
	    } else {
		$self->{"errno"} = 3;
		$self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
		croak &error($self);
	    }
	} else {
	    $self->{"errno"} = 2;
	    $self->{"error"} = sprintf($ERRORS[$self->{"errno"}], $userid);
	    croak &error($self);
	}
    } else {
	$self->{"errno"} = 1;
	$self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
	croak &error($self);
    }

    return $hit;
}

sub login_user {
    my $self     = shift;
    my ($userid, $passwd) = @_;
    my $table    = $TABLES{"USER_LIST"};
    my @values   = ($userid, $passwd);
    my @types    = (SQL_VARCHAR, SQL_VARCHAR);
    my @items    = undef;
    my $salted   = undef;
    my $hit      = 0;

    if (!defined($userid)) {
	$userid = $self->{"userid"};
    } else {
	$self->{"userid"} = $userid;
    }

    if (!defined($passwd)) {
	$passwd = $self->{"passwd"};
    } else {
	$self->{"passwd"} = $passwd;
    }

    if ((!defined($userid)) || (!defined($passwd))) {
	$self->{"errno"} = 11;
	$self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
	croak &error($self);
    } elsif (&connected()) {
	@items = &mysql::select($self->{"dbh"}, $table, 
				"passwd", "userid=? AND passwd=?",
				\@values, \@types);
	if (!@items) {
	    $self->{"errno"} = 4;
	    $self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
	} else {
	    $salted = $items[0]{"passwd"};
	    if (&check_passwd($passwd, $salted)) {
		$hit = 1;
	    } else { 
		$self->{"errno"} = 4;
		$self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
	    }
	}
    } else {
	$self->{"errno"} = 1;
	$self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
	croak &error($self);
    }

    return $hit;    
}

sub exist_word {
    my $self   = shift;
    my ($word, $type, $sentenceid) = @_;
    my $table  = $TABLES{"WORD_LIST"};
    my @values = ($word, $type, $sentenceid, $self->{"userid"});
    my @types  = (SQL_VARCHAR, SQL_VARCHAR, SQL_INTEGER, SQL_VARCHAR);
    my $exist  = 0;

    if (&connected()) {
	$exist = &mysql::exist_record($self->{"dbh"}, $table, 
				      "w_id", "(word=?) AND (type=?) AND (sentenceID=?) AND (userID=?)",
				      \@values, \@types);
    } else {
	$self->{"errno"} = 1;
	$self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
	croak &error($self);
    }

    return $exist;
}

sub reg_word {
    my $self   = shift;
    my ($word, $type, $sentenceid) = @_;
    my $table  = $TABLES{"WORD_LIST"};
    my @values = ($word, $type, $sentenceid, $self->{"userid"});
    my @types  = (SQL_VARCHAR, SQL_VARCHAR, SQL_INTEGER, SQL_VARCHAR);
    my $w_id   = 0;

    if (&connected()) {
	$w_id = &mysql::insert($self->{"dbh"}, $table, 
			       "word, type, sentenceID, userID", "?, ?, ?, ?",
			       \@values, \@types);
	if (!$w_id) {
	    $self->{"errno"} = 6;
	    $self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
	    croak &error($self);
	}
    } else {
	$self->{"errno"} = 1;
	$self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
	croak &error($self);
    }

    return $w_id;
}

sub get_word {
    my $self   = shift;
    my ($w_id) = @_;
    my $table  = $TABLES{"WORD_LIST"};
    my @values = ($w_id, $self->{"userid"});
    my @types  = (SQL_INTEGER, SQL_VARCHAR);
    my $word   = undef;
    my @items  = undef;

    if (&connected()) {
	@items = &mysql::select($self->{"dbh"}, $table, 
				"word", "(w_id=?) AND (userID=?)",
				\@values, \@types);
	if (@items) {
	    $word = $items[0]{"word"};
	}
	if (!$word) {
	    $self->{"errno"} = 7;
	    $self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
	    croak &error($self);
	}
    } else {
	$self->{"errno"} = 1;
	$self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
	croak &error($self);
    }

    return $word;
}

sub get_wordList {
    my $self   = shift;
    my ($type, $sentenceid) = @_;
    my $table  = $TABLES{"WORD_LIST"};
    my @values = undef;
    my @types  = undef;
    my @wordList = undef;
    my $where  = "";
    my $count  = 0;
    
    if (&connected()) {
	$where .= "(userID=?)";
	$values[$count] = $self->{"userid"};
	$types [$count] = SQL_VARCHAR;
	$count++;    
	if (defined($type)) {
	    $where .= " AND (type=?)";
	    $values[$count] = $type;
	    $types [$count] = SQL_VARCHAR;
	    $count++;
	}
	if (defined($sentenceid)) {
	    $where .= " AND (sentenceID=?)";
	    $values[$count] = $sentenceid;
	    $types [$count] = SQL_INTEGER;
	    $count++;
	}
	@wordList = &mysql::select($self->{"dbh"}, $table, 
				"word, type, sentenceid", $where,
				\@values, \@types);
    } else {
	$self->{"errno"} = 1;
	$self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
	croak &error($self);
    }

    return @wordList;
}

sub exist_sentence {
    my $self   = shift;
    my ($s_id) = @_;
    my $table  = $TABLES{"SENTENCE_LIST"};
    my @values = undef;
    my @types  = undef;
    my @items  = undef;
    my $exist  = 0;

    if (!defined($self->{"userid"})) {
	$self->{"errno"} = 9;
	$self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
	croak &error($self);
    } elsif (&connected()) {
	$values[0] = $s_id;
	$types [0] = SQL_INTEGER;
	$values[1] = $self->{"userid"};
	$types [1] = SQL_VARCHAR;
	@items = &mysql::select($self->{"dbh"}, $table, 
				"sentenceID", "(sentenceID=?) AND (userID=?)",
				\@values, \@types);
	if (defined(@items)) {
	    $exist = $items[0]{"sentenceID"};
	}
    } else {
	$self->{"errno"} = 1;
	$self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
	croak &error($self);
    }

    return $exist;
}

sub reg_sentence {
    my $self   = shift;
    my ($text) = @_;
    my $table  = $TABLES{"SENTENCE_LIST"};
    my @values = undef;
    my @types  = undef;
    my $s_id   = 0;

    if (!defined($self->{"userid"})) {
	$self->{"errno"} = 9;
	$self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
	croak &error($self);
    } elsif (&connected()) {
	$values[0] = $text;
	$types [0] = SQL_VARCHAR;
	$values[1] = $self->{"userid"};
	$types [1] = SQL_VARCHAR;
	$s_id = &mysql::insert($self->{"dbh"}, $table, 
			       "todo, creation_date, finished, userID", "?, now(), 'false', ?",
			       \@values, \@types);
	if (!$s_id) {
	    $self->{"errno"} = 10;
	    $self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
	    croak &error($self);
	}
    } else {
	$self->{"errno"} = 1;
	$self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
	croak &error($self);
    }

    return $s_id;    
}

sub del_sentence {
    my $self   = shift;
    my ($s_id) = @_;
    my $table  = $TABLES{"SENTENCE_LIST"};
    my @values = undef;
    my @types  = undef;
    my $hit    = 0;

    if (!defined($self->{"userid"})) {
	$self->{"errno"} = 9;
	$self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
	croak &error($self);
    } elsif (&connected()) {
	$values[0] = $s_id;
	$types [0] = SQL_INTEGER;
	$values[1] = $self->{"userid"};
	$types [1] = SQL_VARCHAR;
	
	&mysql::delete($self->{"dbh"}, $table, 
		       "(sentenceID=?) AND (userID=?)",
		       \@values, \@types);
	$hit = &exist_sentence($self, $s_id);
	if (!defined($hit)) {
	    $self->{"errno"} = 12;
	    $self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
	    croak &error($self);
	}
    } else {
	$self->{"errno"} = 1;
	$self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
	croak &error($self);
    }

    return $hit;
}

sub set_sentence_todo {
    my $self   = shift;
    my ($s_id, $text) = @_;
    my $table  = $TABLES{"SENTENCE_LIST"};
    my @values = undef;
    my @types  = undef;
    my $hit    = 0;

    if (!defined($self->{"userid"})) {
	$self->{"errno"} = 9;
	$self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
	croak &error($self);
    } elsif (&connected()) {
	$values[0] = $text;
	$types [0] = SQL_VARCHAR;
	$values[1] = $s_id;
	$types [1] = SQL_INTEGER;
	$values[2] = $self->{"userid"};
	$types [2] = SQL_VARCHAR;
	
	$hit = &mysql::update($self->{"dbh"}, $table, 
			      "todo=?", "(sentenceID=?) AND (userID=?)",
			      \@values, \@types);
	if (!defined($hit)) {
	    $self->{"errno"} = 12;
	    $self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
	    croak &error($self);
	}
    } else {
	$self->{"errno"} = 1;
	$self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
	croak &error($self);
    }

    return $hit;    
}

sub set_sentence_deadline {
    my $self   = shift;
    my ($s_id, $deadline) = @_;
    my $table  = $TABLES{"SENTENCE_LIST"};
    my @values = undef;
    my @types  = undef;
    my $hit    = 0;

    if (!defined($self->{"userid"})) {
	$self->{"errno"} = 9;
	$self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
	croak &error($self);
    } elsif (&connected()) {
	$values[0] = $deadline;
	$types [0] = SQL_CHAR;
	$values[1] = $s_id;
	$types [1] = SQL_INTEGER;
	$values[2] = $self->{"userid"};
	$types [2] = SQL_VARCHAR;
	
	$hit = &mysql::update($self->{"dbh"}, $table, 
			      "deadline=?", "(sentenceID=?) AND (userID=?)",
			      \@values, \@types);
	if (!defined($hit)) {
	    $self->{"errno"} = 12;
	    $self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
	    croak &error($self);
	}
    } else {
	$self->{"errno"} = 1;
	$self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
	croak &error($self);
    }

    return $hit;
}

sub set_sentence_finished {
    my $self   = shift;
    my ($s_id, $finished) = @_;
    my $table  = $TABLES{"SENTENCE_LIST"};
    my @values = undef;
    my @types  = undef;
    my $hit    = 0;

    if (!defined($self->{"userid"})) {
	$self->{"errno"} = 9;
	$self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
	croak &error($self);
    } elsif (&connected()) {
	$values[0] = $finished;
	$types [0] = SQL_CHAR;
	$values[1] = $s_id;
	$types [1] = SQL_INTEGER;
	$values[2] = $self->{"userid"};
	$types [2] = SQL_VARCHAR;
	
	$hit = &mysql::update($self->{"dbh"}, $table, 
			      "finished=?", "(sentenceID=?) AND (userID=?)",
			      \@values, \@types);
	if (!defined($hit)) {
	    $self->{"errno"} = 12;
	    $self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
	    croak &error($self);
	}
    } else {
	$self->{"errno"} = 1;
	$self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
	croak &error($self);
    }

    return $hit;
}

sub get_sentenceList {
    my $self   = shift;
    my ($words_lp, $date_b, $date_f, $finished) = @_;
    my @words  = @$words_lp;

    my $table  = $TABLES{"SENTENCE_LIST"};
    my @values = undef;
    my @types  = undef;
    my $where  = "";
    my $count  = 0;

    my @sentenceList = undef;
    
    if (!defined($self->{"userid"})) {
	$self->{"errno"} = 9;
	$self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
	croak &error($self);
    } elsif (&connected()) {
	$values[$count] = $self->{"userid"};
	$types [$count] = SQL_VARCHAR;
	$where .= "(userID=?) ";
	$count++;
	if (($finished eq "false") || ($finished eq "true")) {
	    $values[$count] = $finished;
	    $types [$count] = SQL_CHAR;
	    $where .= "AND (finished=?)";
	    $count++;
	}
	if (($date_b) || ($date_f)) {
	    $where .= "AND (1";
	    if ($date_b =~ /^\d{10}$/) {
		$values[$count] = $date_b;
		$types [$count] = SQL_VARCHAR;
		$where .= "AND (deadline>=?)";
		$count++;
	    }
	    if ($date_f =~ /^\d{10}$/) {
		$values[$count] = $date_f;
		$types [$count] = SQL_VARCHAR;
		$where .= "AND (deadline<=?)";
		$count++;
	    }
	    $where .= ")";
	}
	if (@words) {
	    foreach (@words) {
		if ($_) { 
		    $values[$count] = "%".$_."%";
		    $types [$count] = SQL_VARCHAR;
		    $where .= " AND (text LIKE ?)";
		    $count++;
		}
	    }
	} 
	
	@sentenceList = &mysql::select($self->{"dbh"}, $table, 
				      "sentenceID, todo, creation_date, deadline, finished", $where,
				      \@values, \@types);
    } else {
	$self->{"errno"} = 1;
	$self->{"error"} = sprintf($ERRORS[$self->{"errno"}]);
	croak &error($self);
    }

    return @sentenceList;    
}

;

