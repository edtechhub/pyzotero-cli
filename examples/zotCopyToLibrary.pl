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

if (!@ARGV || $help) {
    print("Need arguments");
    print "Sorry, no help.";
    system("less","$0");
    exit;
};


foreach my $a (@ARGV) {
    $a =~ s/.*\///;
    &process($a);
};

exit();


sub process() {

my $HFKVA2IQ = $_[0];
my $gsource = "2405685";
my $gtarget = "2129771";
my $collection = "QMCLH63J";

system qq{zotero-cli --group-id $gsource item --key $HFKVA2IQ > $HFKVA2IQ.json};
my $extra =  `jq ".data.extra" $HFKVA2IQ.json`;
if ($extra =~ m/EdTechHub.ItemAlsoKnownAs:[^\n]*\b2129771\:([\w\d]+)\b/s) {
    say "Already present as $1";
} else {
    say "Adding...";
    system qq{jq ".data" $HFKVA2IQ.json | jq "del(.collections) | del(.key) | del(.version) | del(.dateAdded) | del(.dateModified)" | } .
	qq{jq '. += { "relations": {"owl:sameAs": "http://zotero.org/groups/$gsource/items/$HFKVA2IQ" }}' | }.
	qq{jq '. += { "collections": ["$collection"] }' > newElement.json };
    system qq{zotero-cli --group-id 2129771 create-item newElement.json };
    # Now need to patch the old element.
};
};

