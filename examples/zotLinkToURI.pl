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
my $attach = "";
my $viewondocs = "";
my $linktosource = "";
my $linksourcetocopy = "";
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
    "attach" => \$attach,
    "viewondocs" => \$viewondocs,
    "linktosource" => \$linktosource,
    "linksourcetocopy" => \$linksourcetocopy,
    ) or die("Error in command line arguments\n");

use JSON qw( decode_json  encode_json to_json from_json);

if ($help || !@ARGV) {
    say "

Add a link with URI/title:

$0 --attach zotero://select/groups/2129771/items/UXTXCBCN URI TITLE

Add preformatted links:

$0 --viewondocs zotero://select/groups/2129771/items/UXTXCBCN
$0 --linktosource zotero://select/groups/2129771/items/UXTXCBCN

NOT IMPLEMENTED:

$0 --update zotero://select/groups/2129771/items/MXSNWAQN URI
$0 --update zotero://select/groups/2129771/items/MXSNWAQN URI TITLE
$0 --updatetitle zotero://select/groups/2129771/items/MXSNWAQN TITLE
$0 --delete zotero://select/groups/2129771/items/MXSNWAQN

";
    exit;
};

my $groupcollection = $ARGV[0];
if ($groupcollection =~ m|groups/(\d+)/items/([\d\w]+)|) {
    $group = $1;
    $item = $2;
} else {
    die("Add group/item in zotero://... as first argument.");
};


if ($viewondocs) {
    system "$0 --attach $groupcollection \"https://docs.opendeved.net/lib/$item\" \"View on docs.opendeved.net\"";
};


if ($linktosource || $linksourcetocopy || $link) {
    my $str = from_json(`zotero-cli --group-id $group item --key $item | jq '.data | .extra' `);
    if ($linktosource || $link) {
	if ($str =~ m/EdTechHub.Source: (\d+)\:([\w\d]+)/s) {
	    say "Found source: $1:$2";
	    system "$0 --attach $groupcollection \"zotero://select/groups/$1/items/$2\" \"View source item in library $1\"";
	} else {
	    say "Did not find source."
	};
    };
    if ($linksourcetocopy || $link) {
	if ($str =~ m/EdTechHub.Source: (\d+)\:([\w\d]+)/s) {
	    say "Found source: $1:$2";
	    system "$0 --attach \"zotero://select/groups/$1/items/$2\" $groupcollection \"View copy of this item in library $group\"";
	} else {
	    say "Did not find source."
	};
    };
}


my $json = <<ENDSHERE;
{
  "parentItem": "PARENT",
  "itemType": "attachment",
  "linkMode": "linked_url",
  "title": "TITLE",
  "url": "URL",
  "note": "",
  "contentType": "",
  "charset": "",
  "tags": [],
  "relations": {}    
}
ENDSHERE
    ;
if ($attach) {
    $json =~ s/PARENT/$item/s;
    $json =~ s/URL/$ARGV[1]/s;
    $json =~ s/TITLE/$ARGV[2]/s;
    open F,">item-$date.json";
    print F $json;
    close F;
    print `zotero-cli --group-id $group create-item item-$date.json`;
}


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
