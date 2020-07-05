#!/usr/bin/perl
use warnings;
use strict;
use open IO => ':encoding(UTF-8)', ':std';
use utf8;
use feature qw{ say };
use 5.18.2;
use String::ShellQuote;
#use Data::Dumper;
my $home = $ENV{HOME};
(my $date = `date +'%Y-%m-%d_%H.%M.%S'`) =~ s/\n//;
my $help = "";
my $number = "";
use Getopt::Long;
my $key = "";
my $value = "";
my $update = "";
my $group = "";
my $item = "";
my $file = "";
my $remove = "";
GetOptions (
    "help" => \$help, 
    "number=f" => \$number, 
    "key=s" => \$key,
    "value=s" => \$value,
    "update" => \$update,
    "group=s" => \$group,
    "item=s" => \$item,
    "file=s" => \$file,
    "remove" => \$remove,
    ) or die("Error in command line arguments\n");

use JSON qw( decode_json  encode_json to_json from_json);

my $thegroup = "";
if ($group) {
    $thegroup = "--group $group";
}

my @t;
if (@ARGV) {
    @t = @ARGV;
};

if ($file) {
    open F,"$file";
    push @t, <F>;
    close F;
}


if ($help || !@t) {
    say "
$0 --group 123 --key ABC gr:id
$0 --group 123 --key ABC --file gr_id.txt

The gr:id combinations are added to Extra > ETH.IAKA for item ABC in group 123.
";
    exit;
};


foreach (@t) {
    s/\n//;
};

my $str = `./zoteroUpdateField.pl $thegroup --item $item --key extra | jq " .extra "`;

my @extra ;
if ($str =~ m/\S/s) {
    $str =~ s/\n$//s;
    $str =~ s/\"$//s;
    $str =~ s/^\"//s;
    @extra = split(/\\n/,$str);
};

push @extra, @t;

my $string = shell_quote("\"" . join("\\n", @extra) . "\"");
#print $string;

say `./zoteroUpdateField.pl $thegroup  --item $item --key extra --value $string --update`;

