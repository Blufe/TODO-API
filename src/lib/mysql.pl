package mysql;

sub init {
    my ($dbname, $table, $user, $passwd, $host) = @_;
    my $dbh = DBI -> connect ("DBI:mysql:$dbname:$host",$user,$passwd);
    return $dbh;
}

sub select {
    my ($dbh, $table, $column, $where) = @_;
    my @items;

    if (!defined($dbh)) {
	return @items;
    }

    my $sth = $dbh->prepare("SELECT $column FROM $table WHERE $where");
    $sth->execute;
    my $num_rows = $sth->rows;
#    print "|";
#    for (my $i=0; $i<$sth->{'NUM_OF_FIELDS'}; $i++) {
#	print " $sth->{'NAME'}->[$i] |";
#    }
#    print "<br>";
    for (my $i=0; $i<$num_rows; $i++) {
	my @rows = $sth->fetchrow_array;
	foreach my $row (@rows) {
	    $items[$i] = $row;
	}
    }
    $sth->finish;
    return @items;
}

sub insert {
    my ($dbh, $table, $field, $values) = @_;

    if (!defined($dbh)) {
	return 0;
    }
 
    my $sth = $dbh->prepare("INSERT INTO $table ($field) VALUES ($values)");
    $sth->execute;
    $sth->finish;

    return 1;
}

sub delete {
    my ($dbh, $table, $where) = @_;
    
    if (!defined($dbh)) {
	return 0;
    }

    my $sth = $dbh->prepare("DELETE FROM $table WHERE $where");
    $sth->execute;
    $sth->finish;

    return 1;
}

sub update {
    my ($dbh, $table, $field, $where) = @_;

    if (!defined($dbh)) {
	return 0;
    }    

    my $sth = $dbh->prepare("UPDATE $table SET $field WHERE $where");
    $sth->execute;
    $sth->finish;

    return 1;
}

sub num_cols {
    my ($dbh, $table) = @_;

    if (!defined($dbh)) {
	return 0;
    }    

    my $sth = $dbh->prepare("SELECT * FROM $table");
    $sth->execute;
    my $num_column = $sth->{'NUM_OF_FIELDS'};
    $sth->finish;

    return $num_column;
}

sub num_rows {
    my ($dbh, $table) = @_;

    if (!defined($dbh)) {
	return 0;
    }    

    my $sth = $dbh->prepare("SELECT * FROM $table");
    $sth->execute;
    my $num_rows = $sth->rows;
    $sth->finish;

    return $num_rows;
}

sub colList {
    my ($dbh, $table) = @_;
    my @names;

    if (!defined($dbh)) {
	return @names;
    }

    my $sth = $dbh->prepare("SELECT * FROM $table");
    $sth->execute;
    for (my $i=0; $i<$sth->{'NUM_OF_FIELDS'}; $i++) {
	@names[$i] = $sth->{'NAME'}->[$i];
    }
    $sth->finish;

    return @names;
}

sub rowList {
    my ($dbh, $table, $column) = @_;
    my @rows;
    my @columns = colList($dbh, $table);

    foreach my $name (@columns) {
	if ($name eq $column) {
	    @rows = mysql::select($dbh, $table, $column, "1");    
	    break;
	}
    }
    return @rows;
}

sub close {
    my ($dbh) = @_;
    if (defined($dbh)) {
	$dbh->disconnect;
    }
}

1;

