package com.test.coupen.service;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.List;

// import com.fasterxml.jackson.databind.ObjectMapper; // version 2.11.1
// import com.fasterxml.jackson.annotation.JsonProperty; // version 2.11.1
/* ObjectMapper om = new ObjectMapper();
Root root = om.readValue(myJsonString, Root.class); */
class ADT{
    public Integer baseFare;
    public Integer yq;
    public Integer totalTax;
    public Integer totalServiceCharge;
    public Integer cute;
    public Integer rcf;
    public Integer totalPrice;
    public Integer totalDiscount;
    public Integer totalFeeGw;
    public Integer totalFeeMeal;
    public Integer totalFeeSeat;
    public Integer totalFeeBaggage;
    public Integer totalFeeEzCancel;
    public Integer totalFeeFlexifly;
}

public class Root1{
    List<Root> roots;
}
class CORPObj{
}

class FAMILYFARE{
}

class Fare{
    public FareGroupInformation fareGroupInformation;
    public PricingInfo pricingInfo;
    public String fareHash;
    public Integer nf;
    public Integer pc;
    public Integer pr;
    public String fb;
    public String fk;
    public Integer st;
    public Integer t;
    public boolean kiwiIntegerlrout;
    public boolean kiwibagrecheck;
    public boolean ctbagrecheck;
    public Integer bp;
    public Integer abp;
    public Integer fs;
    public Integer ds;
    public Integer agc;
    public Integer agt;
    public Integer agc_gst;
    public Integer agm;
    public Integer adtbp;
    public Integer cf;
    public Integer psf;
    public Integer adf;
    public Integer ctf;
    public Integer ttf;
    public Integer sf;
    public Integer jnf;
    public Integer oc;
    public Integer agtf;
    public String bc;
    public Integer otd;
    public Integer rtd;
    public String ft;
    public boolean ncib;
    public Integer sbc;
    public Integer gst;
    public Integer sbct;
    public Integer agtft;
    public Integer oct;
    public Integer udf_dep;
    public Integer udf_arr;
    public Integer adfee;
    public Integer pv;
}

class FareGroupInformation{
    public String fareGroup;
    public String fareGroupName;
    public String productClass;
    public String fareGroupDisplayName;
}

class FirstDeparture{
    public String time;
    public String date;
    public long timestamp;
}

class Indicators{
    public boolean noBaggage;
    public boolean noMealFare;
    public boolean nonRefundable;
    public Integer seatsLeft;
    public boolean changeAirport;
    public boolean shortLayover;
    public boolean longLayover;
}

class LastArrival{
    public String time;
    public String date;
    public long timestamp;
}

class PriceBreakup{
    public Integer pr;
    public Integer ds;
    @JsonProperty("CORP")
    public Integer cORP;
    @JsonProperty("LITE")
    public Integer lITE;
    @JsonProperty("FAMILY_FARE")
    public FAMILYFARE fAMILY_FARE;
    public boolean isFamilyFare;
    public Fare fare;
    @JsonProperty("SPLRT")
    public SPLRT sPLRT;
    @JsonProperty("CORPObj")
    public CORPObj cORPObj;
}

class PricingInfo{
    @JsonProperty("ADT")
    public ADT aDT;
}

class Root{
    public String id;
    public ArrayList<String> sectorKeys;
    public ArrayList<String> airlineCodes;
    public String splRtFn;
    public Integer maxStopsInSectors;
    public Integer totalDurationInMinutes;
    public ArrayList<Integer> tripDurationMapBySector;
    public Integer totalLayoverDurationInMinutes;
    public ArrayList<Integer> layoverDurationMapBySector;
    public ArrayList<String> samePriceCards;
    public Integer totalDuration;
    public SortMap sortMap;
    public String dfd;
    public PriceBreakup priceBreakup;
    public Indicators indicators;
    public ArrayList<Object> promos;
    public FirstDeparture firstDeparture;
    public LastArrival lastArrival;

    @Override
    public String toString() {
        return "Root{" +
                "id='" + id + '\'' +
                ", sectorKeys=" + sectorKeys +
                ", airlineCodes=" + airlineCodes +
                ", splRtFn='" + splRtFn + '\'' +
                ", maxStopsInSectors=" + maxStopsInSectors +
                ", totalDurationInMinutes=" + totalDurationInMinutes +
                ", tripDurationMapBySector=" + tripDurationMapBySector +
                ", totalLayoverDurationInMinutes=" + totalLayoverDurationInMinutes +
                ", layoverDurationMapBySector=" + layoverDurationMapBySector +
                ", samePriceCards=" + samePriceCards +
                ", totalDuration=" + totalDuration +
                ", sortMap=" + sortMap +
                ", dfd='" + dfd + '\'' +
                ", priceBreakup=" + priceBreakup +
                ", indicators=" + indicators +
                ", promos=" + promos +
                ", firstDeparture=" + firstDeparture +
                ", lastArrival=" + lastArrival +
                '}';
    }
}

class SortMap{
    public Integer arrival_up;
    public Integer arrival_down;
    public Integer departure_up;
    public Integer departure_down;
    public Integer price_up;
    public Integer price_down;
    public Integer duration_up;
    public Integer duration_down;
    public Integer airline_up;
    public Integer airline_down;
}

class SPLRT{
}