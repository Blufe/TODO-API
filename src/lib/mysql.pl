package mysql;

sub init {
    my ($dbname, $table, $user, $passwd, $host) = @_;
    my $dbh = DBI -> connect ("DBI:mysql:$dbname:$host",$user,$passwd);
    return $dbh;
}

sub select {
    my ($dbh, $table, $column, $where, $values_lp, $types_lp) = @_;
    my @values = @$values_lp;
    my @types  = @$types_lp;
    my $num_values = @values;
    my @items;
    my %item;
    my $name;

    if (!defined($dbh)) {
	return @items;
    }

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
#	my $j=0;
#	foreach my $row (@rows) {
#	    $items[($i*$num_cols)+$j] = $row;
#	    $j++;
#	}
    }
    $sth->finish;

    return @items;
}

sub insert {
    my ($dbh, $table, $field, $values, $values_lp, $types_lp) = @_;
    my @values = @$values_lp;
    my @types  = @$types_lp;
    my $num_values = @values;

    if (!defined($dbh)) {
	return 0;
    }
 
    my $sth = $dbh->prepare("INSERT INTO $table ($field) VALUES ($values)");
    for (my $i=0; $i<$num_values; $i++) {
	$sth->bind_param($i+1, $values[$i], $types[$i]);
    }
    $sth->execute;
    $sth->finish;

    return 1;
}

sub delete {
    my ($dbh, $table, $where, $values_lp, $types_lp) = @_;
    my @values = @$values_lp;
    my @types  = @$types_lp;
    my $num_values = @values;
    
    if (!defined($dbh)) {
	return 0;
    }

    my $sth = $dbh->prepare("DELETE FROM $table WHERE $where");
    for (my $i=0; $i<$num_values; $i++) {
	$sth->bind_param($i+1, $values[$i], $types[$i]);
    }
    $sth->execute;
    $sth->finish;

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

    my $sth = $dbh->prepare("UPDATE $table SET $field WHERE $where");
    for (my $i=0; $i<$num_values; $i++) {
	$sth->bind_param($i+1, $values[$i], $types[$i]);
    }
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
    my $sth  = undef;
    my @items = undef;
    my @columns = colList($dbh, $table);

    foreach my $name (@columns) {
	if ($name eq $column) {
	    $sth = $dbh->prepare("SELECT $column FROM $table");
	    $sth->execute();
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
    
    return @items;
}

sub close {
    my ($dbh) = @_;
    if (defined($dbh)) {
	$dbh->disconnect;
    }
}

1;

