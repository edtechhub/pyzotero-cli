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
GetOptions (
    "string=s" => \$string, 
    "help" => \$help, 
    "number=f" => \$number, 
    ) or die("Error in command line arguments\n");

if (!@ARGV || $help) {
    print("Need arguments");
    print "Sorry, no help.";
    system("less","$0");
    exit;
};

use utf8;
my %map;
say "$0

This script produces a map, whereby old keys (appearing in EdTechHub.ItemAlsoKnownAs) are mapped to the current key.

$0 zotero://select/groups/2129771/collections/BY3Q9D8Z

The script illustrates how output from zotero-cli can be processed in perl.
";
open MAP,">map-listItemsInCollection.txt";
foreach my $xkey (@ARGV) {
    (my $group,my $key) = ($xkey =~ m/(?:zotero\:\/\/select\/groups\/)?(\d+)(?:\/|\:)(?:collections\/)?([\w\d]+)/);
    say "$group:$key";
    #print "zotero-cli --group-id $group get '/collections/$key/collections'";
    #my $json = `zotero-cli --group-id $group get '/collections/$key/collections'`;
    my $json = `zotero-cli --group-id $group collection --key $key`;
    my $d = decode_json($json);    
    #    say Dumper($d);
    say "$key > ${$d}{key} - ${$d}{data}{name} (${$d}{'meta'}{'numItems'}, ${$d}{'meta'}{'numCollections'})";
    say "Getting items...";
    my $json2 = `zotero-cli --group-id $group items --collection '$key'`;
    my $items = JSON->new->decode($json2);
    say "items: $#{$items}";
    my $i=0;
    foreach (sort { ${$a}{data}{title} cmp ${$b}{data}{title}} @{$items}) {
	my $x = "";
	my $t = "";
	my $aka = "";
	$t = ${$_}{data}{itemType};
	next if $t eq "note";
	next if $t eq "attachment";
	$i++;
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
	print "------$i------
Key/Ty: ${$_}{key}\t${$_}{data}{itemType}
Title:  ${$_}{data}{title}
AKA:    $aka;
";
	foreach my $y (split("\;",$aka)) {
	    if ($map{$y} || $y eq "$group:${$_}{key}") {
	    } else {
		say MAP "$y\t$group:${$_}{key}";
		$map{$y} = 1;
	    };
	};
	if ($aka !~ m/2317526/) {
	    say "$group:".${$_}{key}."\t".$aka;
	    say("No reference...");
	};
    };
};
close MAP;

exit();
