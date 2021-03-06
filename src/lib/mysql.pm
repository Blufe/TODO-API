package mysql;

use utf8;
use Encode; 
use DBI qw(:sql_types);

sub init {
    my ($dbname, $user, $passwd, $host) = @_;
    my $dbh = undef;

    eval {
	$dbh = DBI->connect("DBI:mysql:$dbname:$host",$user,$passwd);
    };
    if ($@) {
	die "$@";
    }
	
    return $dbh;
}

sub select {
    my ($dbh, $table, $column, $where, $values_lp, $types_lp) = @_;
    my @values = @$values_lp;
    my @types  = @$types_lp;
    my $num_values = @values;
    my @items = undef;
    my %item  = undef;
    my $name  = undef;

    if (!defined($dbh)) {
	return @items;
    }

    eval {
	my $sth = $dbh->prepare("SELECT $column FROM $table WHERE $where");
	for (my $i=0; $i<$num_values; $i++) {
	    $sth->bind_param($i+1, $values[$i], $types[$i]);
	}
	$sth->execute();
	my $num_cols = $sth->{'NUM_OF_FIELDS'};
	my $num_rows = $sth->rows;
	for (my $i=0; $i<$num_rows; $i++) {
	    my @rows = $sth->fetchrow_array;
	    for (my $j=0; $j<$num_cols; $j++) {
		$name = $sth->{'NAME'}->[$j];
		$items[$i]{$name} = $rows[$j];
	    }
	}
	$sth->finish;
    };
    if ($@) {
	die "$@";
    }
    print $items[0]{"id"};

    return @items;
}

sub insert {
    my ($dbh, $table, $field, $values, $values_lp, $types_lp) = @_;
    my @values = @$values_lp;
    my @types  = @$types_lp;
    my $num_values = @values;
    my $insert_id;

    if (!defined($dbh)) {
	return 0;
    }
 
    eval{
	my $sth = $dbh->prepare("INSERT INTO $table ($field) VALUES ($values)");
	for (my $i=0; $i<$num_values; $i++) {
	    $sth->bind_param($i+1, $values[$i], $types[$i]);
	}
	$sth->execute() or die(DBI::errstr);
	$insert_id = $sth->{mysql_insertid};
	$sth->finish;
    };
    if ($@) {
	die "$@";
    }

    return $insert_id;
}

sub delete {
    my ($dbh, $table, $where, $values_lp, $types_lp) = @_;
    my @values = @$values_lp;
    my @types  = @$types_lp;
    my $num_values = @values;
    
    if (!defined($dbh)) {
	return 0;
    }

    eval {
	my $sth = $dbh->prepare("DELETE FROM $table WHERE $where");
	for (my $i=0; $i<$num_values; $i++) {
	    $sth->bind_param($i+1, $values[$i], $types[$i]);
	}
	$sth->execute() or die(DBI::errstr);
	$sth->finish;
    };
    if ($@) {
	die "$@";
    }

    return 1;
}

sub update {
    my ($dbh, $table, $field, $where, $values_lp, $types_lp) = @_;
    my @values = @$values_lp;
    my @types  = @$types_lp;
    my $num_values = @values;

    if (!defined($dbh)) {
	return 0;
    }    

    eval {
	my $sth = $dbh->prepare("UPDATE $table SET $field WHERE $where");
	for (my $i=0; $i<$num_values; $i++) {
	    $sth->bind_param($i+1, $values[$i], $types[$i]);
	}
	$sth->execute() or die(DBI::errstr);
	$sth->finish;
    };
    if ($@) {
	die "$@";
    }

    return 1;
}

sub exist_record {
    my ($dbh, $table, $where, $values_lp, $types_lp) = @_;
    my @values = @$values_lp;
    my @types  = @$types_lp;
    my $num_values = @values;
    my $exist  = 0;

    if (!defined($dbh)) {
	return 0;
    }

    eval {    
	my $sth = $dbh->prepare("SELECT COUNT(*) FROM $table WHERE $where");
	for (my $i=0; $i<$num_values; $i++) {
	    $sth->bind_param($i+1, $values[$i], $types[$i]);
	}
	$sth->execute() or die(DBI::errstr);
	($exist) = $sth->fetchrow_array;
	$sth->finish;
    };
    if ($@) {
	die "$@";
    }

    return $exist;
}

sub num_cols {
    my ($dbh, $table) = @_;

    if (!defined($dbh)) {
	return 0;
    }    

    eval {
	my $sth = $dbh->prepare("SELECT * FROM $table");
	$sth->execute or die(DBI::errstr);
	my $num_column = $sth->{'NUM_OF_FIELDS'};
	$sth->finish;
    };
    if ($@) {
	die "$@";
    }

    return $num_column;
}

sub num_rows {
    my ($dbh, $table) = @_;

    if (!defined($dbh)) {
	return 0;
    }    

    eval {
	my $sth = $dbh->prepare("SELECT * FROM $table");
	$sth->execute() or die(DBI::errstr);
	my $num_rows = $sth->rows;
	$sth->finish;
    };
    if ($@) {
	die "$@";
    }

    return $num_rows;
}

sub colList {
    my ($dbh, $table) = @_;
    my @names;

    if (!defined($dbh)) {
	return @names;
    }

    eval {
	my $sth = $dbh->prepare("SELECT * FROM $table");
	$sth->execute or die(DBI::errstr);
	for (my $i=0; $i<$sth->{'NUM_OF_FIELDS'}; $i++) {
	    @names[$i] = $sth->{'NAME'}->[$i];
	}
	$sth->finish;
    };
    if ($@) {
	die "$@";
    }

    return @names;
}

sub rowList {
    my ($dbh, $table, $column) = @_;
    my $sth  = undef;
    my @items = undef;
    my @columns = colList($dbh, $table);

    if (!defined($dbh)) {
	return @names;
    }

    eval {
	foreach my $name (@columns) {
	    if ($name eq $column) {
		$sth = $dbh->prepare("SELECT $column FROM $table");
		$sth->execute() or die(DBI::errstr);
		break;
	    }
	}
	if (defined($sth)) {
	    my $num_rows = $sth->rows;
	    for (my $i=0; $i<$num_rows; $i++) {
		my @rows = $sth->fetchrow_array;
		$items[$i] = $rows[0];
	    }
	} 
    };
    if ($@) {
	die "$@";
    }
    
    return @items;
}

sub close {
    my ($dbh) = @_;

    eval {
	if (defined($dbh)) {
	    $dbh->disconnect;
	}
    };
    if ($@) {
	die "$@";
    }

}

1;


