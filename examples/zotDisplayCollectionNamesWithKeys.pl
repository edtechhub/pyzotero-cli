#!/usr/bin/perl
use warnings;
use strict;
use open IO => ':encoding(UTF-8)', ':std';
use utf8;
use feature qw{ say };
use 5.18.2;
#use String::ShellQuote;
#$string = shell_quote(@list);
#use Data::Dumper;
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

my $top = "--top";
#$top = "";

foreach my $item (@ARGV) {
    if ($item =~ m/^\d+$/) {
	say "Top collections in library:";
	system qq{zotero-cli --group-id $item collections $top | jq '.[] | .data | { key, name } ' |  jq -s -c 'sort_by(.name) | .[]'};
    } else {
	(my $group, my $key) = ($item =~ m/(?:zotero\:\/\/select\/groups\/)?(\d+)(?:\/|\:)(?:collections\/)?([\w\d]+)/);
	say "Collections in collection: $group:$key";
	system qq{zotero-cli --group-id $group collections $top --key $key | jq '.[] | .data | { key, name } ' |  jq -s -c 'sort_by(.name) | .[]'};
    };
};
