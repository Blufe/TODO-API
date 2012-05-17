package html;

sub header {
    my ($title) = @_;
    print '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">';
    print '<HTML>';
    print '<HEAD>';
    print '<META http-equiv="Content-Type" content="text/html; charset=UTF-8">';
    print "<TITLE>$title</TITLE>";
    print '</HEAD>';
    print '<BODY>';
}

sub footer {
    print '</BODY>';
    print '</HTML>';
}

1;
