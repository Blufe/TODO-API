#!/usr/bin/env perl

use strict;
use LWP::UserAgent;
use XML::Simple;
use YAML qw/ Dump /;
use Encode qw/ encode_utf8 /;
use CGI::Carp qw(fatalsToBrowser);
use CGI;

my $CGIpm = new CGI;
$CGIpm->charset("utf-8");

print 
    $CGIpm->header({'-expires'=>'+1m', '-charset'=>'UTF-8'}), 
    $CGIpm->start_html({ 
	'-title' => "test", 
	'-lang'  => 'ja', 
	'-head'  => $CGIpm->meta({
	    'http-equiv' => 'Content-Type', 
	    '-content'   => 'text/html; charset=UTF-8' 
	    }) 
	});

my $ua = LWP::UserAgent->new();
$ua->env_proxy();

my $text;
while (<>) {
    $text .= $_;
}

my $uri = q{http://api.jlp.yahoo.co.jp/MAService/V1/parse};
my $res = $ua->post(
    $uri, {
        appid    => '******',
        sentence => $text,
    },
);

my $xml = $res->content;
my $ref = XMLin( $res->content );
print Dump $ref;
for my $w ( @{ $ref->{ma_result}->{word_list}->{word} } ) {
    print encode_utf8( sprintf "%s\t%s,%s\n", $w->{surface}, $w->{pos}, $w->{reading} );
}


print $CGIpm->end_html();
