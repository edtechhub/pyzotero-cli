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
my $group = "2129771";
GetOptions (
    "group=s" => \$group, 
    "help" => \$help, 
    "number=f" => \$number, 
    ) or die("Error in command line arguments\n");


use Encode;
use JSON qw( decode_json  encode_json to_json from_json);
my $i=0;
my $newstr = encode('utf-8', `zotero-cli --group-id $group get "/collections?limit=100&start=$i"`);
my $res = &jq('length',$newstr);
my $str = $newstr;
print STDERR "Fetched $res";
while ($res >= 100) {
    $i+=100;
    $newstr = encode('utf-8', `zotero-cli --group-id $group get "/collections?limit=100&start=$i"`);
    $str .= $newstr;
    $res = &jq('length',$newstr);
    print STDERR "Fetched $res";
};
#print $str;
$str = &jq('.[] | .data | {key, name, parentCollection} ', $str);
$str = &jqs('.',$str);
#say $str;
print "Total: ". &jq('length',$str);

my $data = decode_json($str);
my %name;
#my %tree;
my %children;
my @top;

foreach (sort @{$data}) {
    #$tree{$_->{key}} = $_->{parentCollection};
    $name{$_->{key}} = $_->{name};
    if ($_->{parentCollection}) {
	push @{$children{$_->{parentCollection}}}, $_->{key};
    } else {
	push @top, $_->{key};
    };
};

my $depth = "";
my @tree ;
foreach (sort {$name{$a} cmp $name{$b}} @top) {
    &show($_);
};

sub show {
    my $key = $_[0];
    push @tree, $key;
    #    say "$depth\+ $key: $name{$key}";
    #    say join(".", @tree). " " . $name{$key};
    #    say join(".", @tree);
    $tree[0] =~ s/PFCKJVIL/location/;
    $tree[0] =~ s/SGAGGGLK/featured/;
    $tree[0] =~ s/WIWEWXZ8/pubtype/;
    $tree[0] =~ s/23WS6R2T/theme/;
    $tree[0] =~ s/GQH9J3MJ/ref/;
    say "https://docs.edtechhub.org/col/" .$tree[$#tree] . "\t" .
	"https://docs.edtechhub.org/lib/?" .$tree[0] . "=" .join(".", @tree[1..$#tree]);
    $depth .= "| ";
    foreach (sort {$name{$a} cmp $name{$b}} @{$children{$key}}) {
	&show($_);
    };
    chop($depth);
    chop($depth);
    pop @tree;
    return;
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
sub jqs() {
    use IPC::Open2;
    open2(*README, *WRITEME, "jq", "--slurp", "-M", $_[0]);
    print WRITEME $_[1];
    close(WRITEME);
    my $output = join "",<README>;
    close(README);
    return $output;
}


