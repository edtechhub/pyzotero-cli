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
$0 --group 123 --key ABC Tag1 Tag2 Tag3
$0 --group 123 --key ABC --file tags.txt

The tags  Tag1 Tag2 Tag3 are added to item ABC in group 123.
";
    exit;
};


foreach (@t) {
    s/\n//;
    $_ = "\"$_\"";
};

my $str = `./zoteroUpdateField.pl $thegroup --item $item --key tags | jq " .tags[] | .tag"`;
if ($str =~ m/\S/s) {
    $str =~ s/\n$//s;
    push @t, split(/\n/,$str);
};

my $string = shell_quote("[{\"tag\":".join("},{\"tag\":", @t)."}]");

if ($remove) {
    $string = shell_quote("[]");
};

say `./zoteroUpdateField.pl $thegroup  --item $item --key tags --value $string --update`;

