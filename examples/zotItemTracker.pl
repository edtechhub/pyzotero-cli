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
my $link = "";
my $source = "";
my $first = "";
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
    "link" => \$link,
    "source=s" => \$source,
    "first" => \$first,
    ) or die("Error in command line arguments\n");

use JSON qw( decode_json  encode_json to_json from_json);

if ($help) {
    say "
$0 zotero://select/groups/261495/items/8F4BAW9N

";
    exit;
};

my $groupcollection = $ARGV[0];
if ($groupcollection =~ m|groups/(\d+)/items/([\d\w]+)|) {
    $group = $1;
    $item = $2;
} else {
    die("XXX");
};

my $ogroup;
my $oitem;

if ($first) {
    $ogroup = $group;
    $oitem = $item;
};


if ($source) {
    if ($source =~ m|groups/(\d+)/items/([\d\w]+)|) {
	$ogroup = $1;
	$oitem = $2;
    };
    if ($source =~ m|(\d+)\:([\d\w]+)|) {
	$ogroup = $1;
	$oitem = $2;
    };
}

my %a;
my %r;
$a{"$group:$item"} = 0;
my $cont = 1;

while ($cont == 1) {
    foreach (keys %a) {
	($group, $item) = (m|^(\d+)\:([\d\w]+)$|);
	$group = $1;
	$item = $2;
	my @a;
	if ($a{$_} == 0) {
	    @a = &getItems($group,$item);
	    $a{"$group:$item"} = 1;
	};
	foreach (@a) {
	    if (m|^(\d+)\:([\d\w]+)$|) {
		if (!$a{$_}) {
		    $a{$_} = 0;
		};
		#print "$_\t$a{$_}\n";
	    };
	};
    };
    $cont = 0;
    foreach (keys %a) {
	if ($a{$_} == 0) {
	    $cont = 1;
	};
    };
};

my %coll =qw{
    2129771 ode_PUB
    2405685 ETH_PUB
    2339240 ETH_INT
    261495  ode__ICT
    2083138 DIALRDP
};

foreach (qw(.title .dateAdded .dateModified .key)) {
    &showKey($_);    
};


if ($link) {
    my @all = keys %r;
    my $a = join " " ,@all;
    foreach (keys %r) {
	($group, $item) = (m|^(\d+)\:([\d\w]+)$|);
	# system "xdg-open zotero://select/groups/$group/items/$item";
	say `./zoteroUpdateETHIAKA.pl  --group $group --item $item $a`;
	if ($group eq $ogroup && $item eq $oitem) {
	    say `./zoteroUpdateExtraAppend.pl  --group $group --item $item "EdTechHub.Source: <this>"`;
	};
	say `./zoteroUpdateExtraAppend.pl  --group $group --item $item "EdTechHub.Source: $ogroup:$oitem"`;
	#say `./zoteroUpdateExtraAppend.pl  --group $ogroup --item $oitem "EdTechHub.Copy: $group:$item"`;
    };
};


sub showKey() {
    foreach (keys %r) {
	my $y = "       ";
	if (m/^(\d+)\:/) {
	    if ($coll{$1}) {
		$y = $coll{$1};
	    };
	};
	print "$_ $y\t";
	my $x;
	#$x = $r{$_};
	$x = &jq(".data | $_[0] ",$r{$_});
	$x =~ s/\n//;
	say "$_[0]: $x";
    };
};


sub showAll() {
    foreach (keys %r) {
	my $y = "";
	if (m/^(\d+)\:/) {
	    if ($coll{$1}) {
		$y = $coll{$1};
	    };
	};
	say "***--- $_ $y ---";
	my $x;
	#$x = $r{$_};
	$x = &jq(".data | {title: .title, dateAdded: .dateAdded, dateModified: .dateModified, key: .key} ",$r{$_});
	say $x;
    };
};

sub getItems() {
    my $group = $_[0];
    my $item = $_[1];
    say "GET--- $group:$item ---";
    #    my $str = `./zoteroUpdateField.pl --group $group --item $item --key extra `;
    my $st = `zotero-cli --group $group item --key $item`;
    my @ee;
    if ($st =~ m/\S/s && $st !~ m/StatusCodeError\: 404/) {
	$r{"$group:$item"} = $st;
	$st = &jq('.data',$st);
	if ($st =~ m/\S/s) {
	    my $str = &jq(".extra",$st);
	    #say $str;
	    my @extra ;
	    use List::MoreUtils qw(uniq);
	    if ($str =~ m/\S/s) {
		$str =~ s/\n$//s;
		$str =~ s/\"$//s;
		$str =~ s/^\"//s;
		@extra = split(/\\n/,$str);
		foreach my $e (@extra) {
		    if ($e =~ s/^EdTechHub\.ItemAlsoKnownAs\:\s*//) {
			$e =~ s/[\;\"]*\s*$//;
			my @e = split /\;/,$e;
			@ee = sort(uniq(@e));
			$e = "EdTechHub.ItemAlsoKnownAs\: ".join(";",@ee);
			#say $e;
		    };
		};
	    };
#	    "relations": {
#		"owl:sameAs": "http://zotero.org/groups/2405685/items/A8G2S2ZT",
#		    "dc:replaces": "http://zotero.org/groups/2129771/items/SMBVLED9"
	    my $n = &jq(".relations.\"owl:sameAs\" ",$st);
	    if ($n && !$ogroup) {
		if ($n =~ m|groups/(\d+)/items/([\d\w]+)|) {
		    $ogroup = $1;
		    $oitem = $2;
		    say "Setting source: $ogroup:$oitem";
		};
	    };
	    my @str = split /\n/, &jq(".relations | .[] ",$st);
	    foreach (@str) {
		if (m|groups/(\d+)/items/([\d\w]+)|) {
		    push @ee, "$1:$2";
		};
	    };
	};
    } else {
	$r{"$group:$item"} = "";
    };
    return @ee;
};


sub jq() {
    use IPC::Open2;
    use open IO => ':encoding(UTF-8)', ':std';
    open2(*README, *WRITEME, "jq", "-M", $_[0]);
    binmode(*WRITEME, "encoding(UTF-8)");
    binmode(*README, "encoding(UTF-8)");
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
