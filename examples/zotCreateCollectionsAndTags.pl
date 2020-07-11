#!/usr/bin/perl
use warnings;
use strict;
use open IO => ':encoding(UTF-8)', ':std';
use utf8;
use feature qw{ say };
use 5.18.2;
use String::ShellQuote;
use Data::Dumper;
my $home = $ENV{HOME};
(my $date = `date +'%Y-%m-%d_%H.%M.%S'`) =~ s/\n//;
my $help = "";
my $string = "";
my $number = "";
use Getopt::Long;
my $groupcollection = "zotero://select/groups/2259720/collections/S4WHJHRY";
my $groupitem = "zotero://select/groups/2259720/items/I88FJV64";

GetOptions (
    "groupitem=s" => \$groupitem, 
    "groupcollection=s" => \$groupcollection, 
    "help" => \$help, 
    "number=f" => \$number, 
    ) or die("Error in command line arguments\n");

use Encode;
use JSON qw(decode_json encode_json to_json from_json);

#my $new = &createColl("PFCKJVIL","ROMP");
#say &createColl("$new","ROMP2");

my %a;
my $group = "2259720";
my $item = "S4WHJHRY";
#$a{"Theme"} = "JVMZDEF2";

if ($groupcollection) {
    if ($groupcollection =~ m|groups/(\d+)/collections/([\d\w]+)|) {
	$group = $1;
	$item = $2;
	say "Group/collection: $group $item";
    };
};
my $indent = "";    
open TAG, ">tags.txt";
while (<DATA>) {
    my $i=-1;
    s/\n//;
    my @a = split /\;/,$_;
    my @b;
    my $latest = $item;
    my $prefix = "_";
    $indent = "";    
    foreach (@a) {
	$indent .= "\t";
	$i++;
	if ($a{$_}) {
	    say "$indent $_ -> $a{$_}";
	    #push @b, $a{$_};
	    if ($prefix eq "_" || $prefix ne "_C:") {
		$_ =~ m/^(.)/;
		$prefix .= "$1:";
	    };
	    $latest = $a{$_};
	} else {
	    $a{$_} = &createColl($latest, $_);
	    $latest = $a{$_};
	    say "$indent $_ -> $a{$_}";
	    if ($i == $#a) {
		say TAG "$prefix$_ $latest";
		say "$indent\t $prefix$_ $latest";
	    } else {
		if ($prefix eq "_" || $prefix ne "_C:") {
		    $_ =~ m/^(.)/;
		    $prefix .= "$1:";
		};
	    };
	    #push @b, $a{$_};
	};
    };
};
close TAG;

if ($groupitem) {
    if ($groupitem =~ m|groups/(\d+)/items/([\d\w]+)|) {
	$group = $1;
	$item = $2;
	say "Group:item: $group $item";
	system("./zoteroUpdateTags.pl --group $group --item $item --file tags.txt");
    };
};


sub createColl() {
    if ($_[0] && $_[1]) {
	my $parent = $_[0];
	my $string = shell_quote($_[1]);
	say "$indent\t +create: $parent -> $string";
	my $newstr = encode('utf-8', `zotero-cli --group-id $group collections --key $parent --create-child $string`);
	#say $newstr;
	$newstr =~ m/key\: '([\w\d]+)'/s;
	return $1;	
    } else {
	die("$_[0] && $_[1]");
    };
};


__DATA__
Theme;Hardware and modality;Audio and Radio
Theme;Hardware and modality;Video and television
Theme;Hardware and modality;Messaging and phone calls
Theme;Hardware and modality;Web-enabled
Theme;Hardware and modality;Application-based
Theme;Hardware and modality;Offline
Theme;Hardware and modality;Print media
Theme;Hardware and modality;Open and Distance Learning
Theme;Within-country contexts;Urban
Theme;Within-country contexts;Peri-urban 
Theme;Within-country contexts;Rural
Theme;Within-country contexts;Low connectivity and/or electricity
Theme;Populations;Refugees and migrants
Theme;Populations;Low-literacy levels individuals
Theme;Populations;Girls
Theme;Populations;Disabled and special educational needs individuals
Theme;Populations;Minority groups 
Theme;Populations;Out-of-school populations
Theme;Populations;Parents and caretakers
Theme;Populations;School administrators and senior leadership team
Theme;Populations;Ministries of education
Theme;Populations;Trainee teachers
Theme;Populations;Teaching assistants
Theme;Populations;Support and community workers
Theme;Populations;Teacher trainers
Theme;Populations;Teachers
Theme;Educational level;Early childhood and pre-primary
Theme;Educational level;Primary education
Theme;Educational level;Secondary education
Theme;Educational level;Tertiary/higher education
Theme;Educational level;Technical and vocational education and training
Theme;Educational level;Adult education
Theme;Educational level;Teacher education (pre-service and in-service)
Theme;Focus;Access
Theme;Focus;Assessment
Theme;Focus;Cost analysis
Theme;Focus;Equity
Theme;Focus;Governance
Theme;Focus;Monitoring and evaluation
Theme;Focus;Education financing
Theme;Focus;COVID and reopening of schools
Theme;Focus;System readiness
Theme;Focus;Curriculum and educational content
Theme;Focus;Online and distance teaching and learning
Theme;Focus;Educational data
Language of publication;English
Language of publication;French
Language of publication;Arabic
Language of publication;Portugeese
Language of publication;Chinese
Language of publication;Russian
Language of publication;Spanish
Publication type;Case study
Publication type;Blog post
Publication type;Evidence review
Publication type;Systematic literature review
Publication type;Helpdesk response
Publication type;Country scan
Publication type;Working paper
Publication type;Journal article
Publication type;Impact evaluation
Publication type;Policy paper
Publication type;Thesis
Publication type;Book
Publication type;Book chapter
Publication type;Conference paper
Publication type;Web page or website
Publication type;Reference list
Country;Asia;Western Asia;Abkhazia XABKH
Country;Asia;Southern Asia;Afghanistan AFG
Country;Europe;Southern Europe;Albania ALB
Country;Africa;Northern Africa;Algeria DZA
Country;Europe;Southern Europe;Andorra AND
Country;Africa;Middle Africa;Angola AGO
Country;Americas;Caribbean;Antigua and Barbuda ATG
Country;Americas;South America;Argentina ARG
Country;Asia;Western Asia;Armenia ARM
Country;Asia;Western Asia;Artsakh XARTH
Country;Oceania;Australia and New Zealand;Australia AUS
Country;Europe;Western Europe;Austria AUT
Country;Asia;Western Asia;Azerbaijan AZE
Country;Americas;Caribbean;Bahamas BHS
Country;Asia;Western Asia;Bahrain BHR
Country;Asia;Southern Asia;Bangladesh BGD
Country;Americas;Caribbean;Barbados BRB
Country;Europe;Eastern Europe;Belarus BLR
Country;Europe;Western Europe;Belgium BEL
Country;Americas;Central America;Belize BLZ
Country;Africa;Western Africa;Benin BEN
Country;Asia;Southern Asia;Bhutan BTN
Country;Americas;South America;Bolivia BOL
Country;Europe;Southern Europe;Bosnia and Herzegovina BIH
Country;Africa;Southern Africa;Botswana BWA
Country;Americas;South America;Brazil BRA
Country;Asia;South-estern Asia;Brunei Darussalam BRN
Country;Europe;Eastern Europe;Bulgaria BGR
Country;Africa;Western Africa;Burkina Faso BFA
Country;Africa;Eastern Africa;Burundi BDI
Country;Asia;South-estern Asia;Cambodia KHM
Country;Africa;Middle Africa;Cameroon CMR
Country;Americas;Northern America;Canada CAN
Country;Africa;Western Africa;Cape Verde CPV
Country;Europe;Western Europe;Catalan Republic XCATA
Country;Africa;Middle Africa;Central African Republic CAF
Country;Africa;Middle Africa;Chad TCD
Country;Americas;South America;Chile CHL
Country;Asia;Eastern Asia;China CHN
Country;Americas;South America;Colombia COL
Country;Africa;Eastern Africa;Comoros COM
Country;Africa;Middle Africa;Democratic Republic of the Congo COD
Country;Africa;Middle Africa;Republic of the Congo COG
Country;Africa;Middle Africa;Congo XCO
Country;Americas;Central America;Costa Rica CRI
Country;Africa;Western Africa;Ivory Coast CIV
Country;Europe;Southern Europe;Croatia HRV
Country;Americas;Caribbean;Cuba CUB
Country;Asia;Western Asia;Cyprus CYP
Country;Europe;Eastern Europe;Czech Republic CZE
Country;Europe;Northern Europe;Denmark DNK
Country;Africa;Eastern Africa;Djibouti DJI
Country;Americas;Caribbean;Dominican Republic DOM
Country;Americas;Caribbean;Dominica DMA
Country;Asia;South-estern Asia;Timor-L'este TLS
Country;Americas;South America;Ecuador ECU
Country;Africa;Northern Africa;Egypt EGY
Country;Americas;Central America;El Salvador SLV
Country;Africa;Eastern Africa;Eritrea ERI
Country;Europe;Northern Europe;Estonia EST
Country;Africa;Southern Africa;eSwatini SWZ
Country;Africa;Eastern Africa;Ethiopia ETH
Country;Oceania;Melanesia;Fiji FJI
Country;Europe;Northern Europe;Finland FIN
Country;Europe;Western Europe;France FRA
Country;Africa;Middle Africa;Gabon GAB
Country;Africa;Western Africa;Gambia GMB
Country;Asia;Western Asia;Georgia GEO
Country;Europe;Western Europe;Germany DEU
Country;Africa;Western Africa;Ghana GHA
Country;Europe;Southern Europe;Greece GRC
Country;Americas;Caribbean;Grenada GRD
Country;Americas;Central America;Guatemala GTM
Country;Africa;Western Africa;Guinea-Bissau GNB
Country;Africa;Middle Africa;Equatorial Guinea GNQ
Country;Africa;Western Africa;Guinea GIN
Country;Americas;South America;Guyana GUY
Country;Americas;Caribbean;Haiti HTI
Country;Americas;Central America;Honduras HND
Country;Europe;Eastern Europe;Hungary HUN
Country;Europe;Northern Europe;Iceland ISL
Country;Asia;Southern Asia;India IND
Country;Asia;South-estern Asia;Indonesia IDN
Country;Asia;Southern Asia;Iran IRN
Country;Asia;Western Asia;Iraq IRQ
Country;Europe;Northern Europe;Ireland IRL
Country;Asia;Western Asia;Israel ISR
Country;Europe;Southern Europe;Italy ITA
Country;Americas;Caribbean;Jamaica JAM
Country;Asia;Eastern Asia;Japan JPN
Country;Asia;Western Asia;Jordan JOR
Country;Asia;Central Asia;Kazakhstan KAZ
Country;Africa;Eastern Africa;Kenya KEN
Country;Oceania;Micronesia;Kiribati KIR
Country;Asia;Eastern Asia;North Korea PRK
Country;Asia;Eastern Asia;Korea XKOR
Country;Asia;Eastern Asia;Korea (Republic of) KOR
Country;Europe;Southern Europe;Kosovo XKSVO
Country;Asia;Western Asia;Kurdistan XKRDN
Country;Asia;Western Asia;Kuwait KWT
Country;Asia;Central Asia;Kyrgyzstan KGZ
Country;Asia;South-estern Asia;Laos LAO
Country;Europe;Northern Europe;Latvia LVA
Country;Asia;Western Asia;Lebanon LBN
Country;Africa;Southern Africa;Lesotho LSO
Country;Africa;Western Africa;Liberia LBR
Country;Africa;Northern Africa;Libya LBY
Country;Europe;Western Europe;Liechtenstein LIE
Country;Europe;Northern Europe;Lithuania LTU
Country;Europe;Western Europe;Luxembourg LUX
Country;Africa;Eastern Africa;Madagascar MDG
Country;Africa;Eastern Africa;Malawi MWI
Country;Asia;South-estern Asia;Malaysia MYS
Country;Asia;Southern Asia;Maldives MDV
Country;Africa;Western Africa;Mali MLI
Country;Europe;Southern Europe;Malta MLT
Country;Oceania;Micronesia;Marshall Islands MHL
Country;Africa;Western Africa;Mauritania MRT
Country;Africa;Eastern Africa;Mauritius MUS
Country;Americas;Central America;Mexico MEX
Country;Oceania;Micronesia;Federated States of Micronesia FSM
Country;Europe;Eastern Europe;Republic of Moldova MDA
Country;Europe;Eastern Europe;Pridnestrovian Moldovan Republic XPRMR
Country;Europe;Western Europe;Monaco MCO
Country;Asia;Eastern Asia;Mongolia MNG
Country;Europe;Southern Europe;Montenegro MNE
Country;Africa;Northern Africa;Morocco MAR
Country;Africa;Eastern Africa;Mozambique MOZ
Country;Asia;South-estern Asia;Myanmar MMR
Country;Africa;Southern Africa;Namibia NAM
Country;Oceania;Micronesia;Nauru NRU
Country;Asia;Southern Asia;Nepal NPL
Country;Europe;Western Europe;Netherlands NLD
Country;Oceania;Australia and New Zealand;New Zealand NZL
Country;Americas;Central America;Nicaragua NIC
Country;Africa;Western Africa;Niger NER
Country;Africa;Western Africa;Nigeria NGA
Country;Asia;Western Asia;North Cyprus XNCYP
Country;Europe;Southern Europe;North Macedonia MKD
Country;Europe;Northern Europe;Norway NOR
Country;Asia;Western Asia;Oman OMN
Country;Asia;Southern Asia;Pakistan PAK
Country;Oceania;Micronesia;Palau PLW
Country;Asia;Western Asia;State of Palestine PSE
Country;Americas;Central America;Panama PAN
Country;Oceania;Melanesia;Papua New Guinea PNG
Country;Americas;South America;Paraguay PRY
Country;Americas;South America;Peru PER
Country;Asia;South-estern Asia;Philippines PHL
Country;Europe;Eastern Europe;Poland POL
Country;Europe;Southern Europe;Portugal PRT
Country;Africa;Eastern Africa;Puntland XPTLD
Country;Asia;Western Asia;Qatar QAT
Country;Europe;Eastern Europe;Romania ROU
Country;Europe;Eastern Europe;Russian Federation RUS
Country;Africa;Eastern Africa;Rwanda RWA
Country;Africa;North Africa;Sahrawi Arab Democratic Republic XSADR
Country;Americas;Caribbean;Saint Kitts and Nevis KNA
Country;Americas;Caribbean;Saint Lucia LCA
Country;Americas;Caribbean;Saint Vincent and the Grenadines VCT
Country;Oceania;Polynesia;Samoa WSM
Country;Europe;Southern Europe;San Marino SMR
Country;Africa;Middle Africa;São Tomé and Príncipe STP
Country;Asia;Western Asia;Saudi Arabia SAU
Country;Africa;Western Africa;Senegal SEN
Country;Europe;Southern Europe;Serbia SRB
Country;Africa;Eastern Africa;Seychelles SYC
Country;Africa;Western Africa;Sierra Leone SLE
Country;Asia;South-estern Asia;Singapore SGP
Country;Europe;Eastern Europe;Slovakia SVK
Country;Europe;Southern Europe;Slovenia SVN
Country;Oceania;Melanesia;Solomon Islands SLB
Country;Africa;Eastern Africa;Somalia SOM
Country;Africa;Eastern Africa;Somaliland XSMLD
Country;Africa;Southern Africa;South Africa ZAF
Country;Asia;Eastern Asia;South Korea KOR
Country;Asia;Western Asia;South Ossetia XOSSA
Country;Africa;Eastern Africa;South Sudan SSD
Country;Europe;Southern Europe;Spain ESP
Country;Asia;Southern Asia;Sri Lanka LKA
Country;Africa;Northern Africa;Sudan SDN
Country;Americas;South America;Suriname SUR
Country;Europe;Northern Europe;Sweden SWE
Country;Europe;Western Europe;Switzerland CHE
Country;Asia;Western Asia;Syrian Arab Republic SYR
Country;Asia;Central Asia;Tajikistan TJK
Country;Africa;Eastern Africa;United Republic of Tanzania TZA
Country;Asia;South-estern Asia;Thailand THA
Country;Asia;Southern Asia;Tibet XTIBT
Country;Africa;Western Africa;Togo TGO
Country;Oceania;Polynesia;Tonga TON
Country;Americas;Caribbean;Trinidad and Tobago TTO
Country;Africa;Northern Africa;Tunisia TUN
Country;Asia;Western Asia;Turkey TUR
Country;Asia;Central Asia;Turkmenistan TKM
Country;Oceania;Polynesia;Tuvalu TUV
Country;Africa;Eastern Africa;Uganda UGA
Country;Europe;Eastern Europe;Ukraine UKR
Country;Asia;Western Asia;United Arab Emirates ARE
Country;Europe;Northern Europe;United Kingdom GBR
Country;Americas;Northern America;United States USA
Country;Americas;South America;Uruguay URY
Country;Asia;Central Asia;Uzbekistan UZB
Country;Oceania;Melanesia;Vanuatu VUT
Country;Americas;South America;Holy See VAT
Country;Americas;South America;Venezuela VEN
Country;Asia;South-estern Asia;Viet Nam VNM
Country;Asia;Western Asia;Yemen YEM
Country;Africa;Eastern Africa;Zambia ZMB
Country;Africa;Eastern Africa;Zimbabwe ZWE

