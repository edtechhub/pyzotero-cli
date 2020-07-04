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
my $key = "";
my $value = "";
my $update = "";
my $group = "";
my $item = "";
GetOptions (
    "string=s" => \$string, 
    "help" => \$help, 
    "number=f" => \$number, 
    "key=s" => \$key,
    "value=s" => \$value,
    "update" => \$update,
    "group=s" => \$group,
    "item=s" => \$item,
    ) or die("Error in command line arguments\n");

use JSON qw( decode_json  encode_json to_json from_json);

my $thegroup = "";
if ($group) {
    $thegroup = "--group-id $group";
}

#my $zkey = "QV86W53S";
#  print `zotero-cli --group-id $group item --key $zkey | jq '.data | { key, version, $key }'`;
my $str = `zotero-cli $thegroup item --key $item | jq '.data'`;
#print $str;
if ($key) {
    if (!$value) {
	print &jq("{ $key }", $str);
    } else {
	$str = &jq("{ key, version }", $str);
	$str = &jq(". += { \"$key\":  $value }", $str);
	say $str;
	if ($update) {
	    open F,">$item.update.json";
	    print F $str;
	    close F;
	    system "zotero-cli --group-id $group update-item --key $item $item.update.json";
	}
    };
} else {
    print $str;
};



sub jq() {
    use IPC::Open2;
    open2(*README, *WRITEME, "jq", "-M", $_[0]);
    print WRITEME $_[1];
    close(WRITEME);
    my $output = join "",<README>;
    close(README);
    return $output;
}

