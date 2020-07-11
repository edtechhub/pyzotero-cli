#!/usr/bin/perl
use warnings;
use strict;
use open IO => ':encoding(UTF-8)', ':std';
use utf8;
use feature qw{ say };
use 5.18.2;
use JSON qw( decode_json  encode_json to_json from_json);
#use String::ShellQuote;
#$string = shell_quote(@list);
use Data::Dumper;
my $home = $ENV{HOME};
(my $date = `date +'%Y-%m-%d_%H.%M.%S'`) =~ s/\n//;
my $help = "";
my $string = "";
my $number = "";
use Getopt::Long;
my $verbose = "";
GetOptions (
    "string=s" => \$string, 
    "help" => \$help, 
    "number=f" => \$number, 
    "verbose" => \$verbose,
    ) or die("Error in command line arguments\n");

if (!@ARGV || $help) {
    print("Need arguments");
    print "Sorry, no help.";
    system("less","$0");
    exit;
};

use utf8;

say "$0

This script produces a map of collections, getting items in the collection as well.

$0 zotero://select/groups/2129771/collections/BY3Q9D8Z

The script illustrates how output from zotero-cli can be processed in perl.
";


my %map;
open MAP,">map-processCollections.txt";
foreach my $xkey (@ARGV) {
    # zotero://select/groups/2317526/collections/7D7LEFHR
    (my $group, my $key) = ($xkey =~ m/(?:zotero\:\/\/select\/groups\/)?(\d+)(?:\/|\:)(?:collections\/)?([\w\d]+)/);
    say "$group:$key";
    &getItems($group,$key);
    my $json = `zotero-cli --group-id $group get '/collections/$key/collections'`;
    my $d = decode_json($json);    
    my $i=0;
    foreach (sort { ${$a}{data}{name} cmp ${$b}{data}{name} } @{$d}) {
	$i++;
	#say Dumper(\%{$_});
	#exit;
	say "$key > ($i) ${$_}{key} - ${$_}{data}{name} (${$_}{'meta'}{'numItems'}, ${$_}{'meta'}{'numCollections'})";
	&getItems($group,${$_}{key});
    };
};
close MAP;

sub getItems() {
    (my $group,my $key) = @_;
    say "-- $group:$key";
    my $json2 = `zotero-cli --group-id $group items --collection '$key'`;
    #my $json2 = `zotero-cli --group-id $group get '/collections/$key/items'`;
    my $items = JSON->new->decode($json2);
    my $i=0;
    foreach (@{$items}) {
	my $t = ${$_}{data}{itemType};
	next if $t eq "note";
	next if $t eq "attachment";
	$i++;
	my $x = "";
	my $aka = "";
	if (${$_}{data}{extra}) {		
	    $x = ${$_}{data}{extra};
	    my @a = split /\n/,$x;
	    foreach (@a) {
		if (m/EdTechHub\.ItemAlsoKnownAs\:/) {
		    $aka = $_;
		    $aka =~ s/EdTechHub\.ItemAlsoKnownAs\:\s*//;
		    if (!m/^EdTechHub\.ItemAlsoKnownAs/) {
			say("Error in 'extra' - stopping");
			say "$group:".${$_}{key}."\t ($t) -> ".$x;
			exit("stopping for safety.");
		    };
		};
	    };
	};
	#say " --- ".${$_}{key}." ($t) -> ".$aka;
	#	    say MAP "$group:".${$_}{key}."\t".join("\t", split("\;",$aka));
	print "------$i------
Key/Ty: ${$_}{key}\t${$_}{data}{itemType}
Title:  ${$_}{data}{title}
AKA:    $aka;
" if $verbose;
	foreach my $y (split("\;",$aka)) {
	    if ($map{$y} || $y eq "$group:${$_}{key}") {
	    } else {
		if ($y =~ m/\:/) {
		    say MAP "$y\t$group:${$_}{key}";
		};
		$map{$y} = 1;
	    };
	};
	if ($aka !~ m/2317526/) {
	    say "$group:".${$_}{key}."\t".$aka;
	    say("No reference...");
	};
    };
};

exit();
