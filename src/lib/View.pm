package View;

use strict;
use warnings;

use utf8;
use Encode; 
use Acme::Comment type=>'C++', own_line => 0, one_line => 1;# C++風のコメントを使用できるようにする
use Data::Lock qw(dlock);
use Carp qw(croak);

dlock my @ERRORS = (
		    "No problem"
		    );

sub new {
    my $thing = shift;
    my $class = ref($thing) || $thing;
    my $self  = {
	"error"  => $ERRORS[0],
	"errno"  => 0
	};
    
    return bless $self => $class;
}

sub error {
    my $self = shift;
    #    croak "Exception: ($self->{\"errno\"})\"$self->{\"error\"}\"";
    return "ERROR: ($self->{\"errno\"})\"$self->{\"error\"}\"";
}

sub xml_header {
    my $self = shift;
    print '<?xml version="1.0" encoding="utf-8"?>';
}

sub xml_lists_start {
    my $self = shift;
    print '<lists>';
}

sub xml_lists_end {
    my $self = shift;
    print '</lists>';
}

sub xml_block {
    my $self = shift;
    my ($name, $value) = @_;
    print 
	"<$name>",
	$value,
	"</$name>";
}

# ログイン

sub xml_loginACK {
    my $self = shift;

    &xml_header($self);
    &xml_lists_start($self);
    print '<result>';
    print "login";
    print '</result>';
    &xml_lists_end($self);
}

sub xml_loginNCK {
    my $self = shift;
    my ($errmsg) = @_;

    &xml_header($self);
    &xml_lists_start($self);
    print '<result>';
    print "error";
    print '</result>';
    print '<error>';
    print "$errmsg";
    print '</error>';
    &xml_lists_end($self);
}

# ユーザ登録

sub xml_registerACK {
    my $self = shift;

    &xml_header($self);
    &xml_lists_start($self);
    print '<result>';
    print "register";
    print '</result>';
    &xml_lists_end($self);
}

sub xml_registerNCK {
    my $self = shift;
    my ($errmsg) = @_;

    &xml_header($self);
    &xml_lists_start($self);
    print '<result>';
    print "error";
    print '</result>';
    print '<error>';
    print "$errmsg";
    print '</error>';
    &xml_lists_end($self);
}

sub xml_searchSuccess {
    my $self = shift;
    my ($sentenceList_lp) = @_;
    my @sentenceList = @$sentenceList_lp;
    my %sentence = undef;
    
    &xml_header($self);
    &xml_lists_start($self);
    print '<result>';
    print "success";
    print '</result>';
    foreach (@sentenceList) {
	%sentence = %{$_};
	print "<data>";
	print "<sentenceID>$sentence{'sentenceID'}</sentenceID>";
	print "<todo>$sentence{'todo'}</todo>";
	print "<creation_date>$sentence{'creation_date'}</creation_date>";
	print "<deadline>$sentence{'deadline'}</deadline>";
	print "<finished>$sentence{'finished'}</finished>";
	print '</data>';
    }
    &xml_lists_end($self);
}

sub xml_actionFailure {
    my $self = shift;
    my ($errmsg) = @_;

    &xml_header($self);
    &xml_lists_start($self);
    print '<result>';
    print "error";
    print '</result>';
    print '<error>';
    print "$errmsg";
    print '</error>';
    &xml_lists_end($self);
}

;
