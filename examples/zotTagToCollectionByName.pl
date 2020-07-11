#!/usr/bin/perl
use warnings;
use strict;
use open IO => ':encoding(UTF-8)', ':std';
use utf8;
use feature qw{ say };
use 5.18.2;
#use String::ShellQuote;
#$string = shell_quote(@list);
use Data::Dumper;
my $home = $ENV{HOME};
(my $date = `date +'%Y-%m-%d_%H.%M.%S'`) =~ s/\n//;
my $help = "";
my $string = "";
my $number = "";
use Getopt::Long;
GetOptions (
    "string=s" => \$string, 
    "help" => \$help, 
    "number=f" => \$number, 
    ) or die("Error in command line arguments\n");

use JSON qw( decode_json  encode_json to_json from_json);
my $group = "2129771";

my $root = "94GNF2EB";
$root = "HUMXGGB7";    


for $root (qw{HUMXGGB7 YQXNIQJJ X4GFHXUR I4XU5IXD}) {
    my $colls = from_json(`zotero-cli --group-id $group collections --key $root | jq '.[] | .data | { key, name } ' |  jq -s -c 'sort_by(.name) | .[]' | jq --slurp "." `);
    print Dumper($colls);    
    my %assoc;
    foreach (@{$colls}) {
	say "$_->{name} ::: $_->{key}";
	$assoc{"C:" . $_->{name}} = $_->{key};
	$assoc{"CC:" . $_->{name}} = $_->{key};
    };
    
    
    foreach my $tag (keys %assoc) {
	say "==================== $tag -> $assoc{$tag} ==============================";
	my $coll = $assoc{$tag};
	my $str = `zotero-cli --group-id $group items --filter '{"tag": "$tag"}' | jq '.[] | .data | { key, title, collections }  ' | jq --slurp '.' `;
	my $keys = from_json($str);
	foreach my $item (@{$keys}) {
	    my $key = $item->{key};
	    say "- $key: $item->{title}";
	    my $add = 1;
	    foreach (@{$item->{collections}}) {
		if ($_ eq $coll) {
		    $add = 0;
		};
	    };
	    if ($add) {
		say "... adding";
		system("zotero-cli --group-id $group item --key $key --addtocollection $coll | jq \".data.title\"");
	    };
	};
    };
};

