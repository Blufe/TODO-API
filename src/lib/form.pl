package form;

sub getFormData
{
    my $rawdata;
    my %formdata;
    my @inputs;
    
    if ($ENV{'REQUEST_METHOD'} eq "POST") {
	read(STDIN, $rawdata, $ENV{'CONTENT_LENGTH'});
    }
    elsif ($ENV{'REQUEST_METHOD'} eq "GET") {
	$rawdata = $ENV{'QUERY_STRING'};
    }

    @inputs = split('&', $rawdata);

    foreach my $input (@inputs) {
	my ($name, $val) = split('=', $input);
	$val =~ tr/+/ /;
	$val =~ s/%([A-Fa-f0-9][A-Fa-f0-9])/pack("C", hex($1))/eg;
        $formdata{$name} .= "\0" if (defined($formdata{$name}));
	$formdata{$name} .= $val;
    }

    return %formdata;
}

1;

