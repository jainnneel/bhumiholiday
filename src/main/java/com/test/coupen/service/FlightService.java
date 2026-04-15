package com.test.coupen.service;

import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.test.coupen.entity.CoupenEntity;
import com.test.coupen.entity.DiscountType;
import com.test.coupen.entity.RangeEntity;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.apache.coyote.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.Duration;
import java.time.LocalTime;
import java.util.*;
import java.util.zip.GZIPInputStream;

@Service
public class FlightService {

    @Autowired
    CoupenService coupenService;

    // ── New API integration ────────────────────────────────────────────────────
    /** Calls the new Cleartrip endpoint. */
    @Autowired
    NewApiClient newApiClient;

    /** Converts the new API response into the legacy Root1/Root model. */
    @Autowired
    FlightResponseAdapter flightResponseAdapter;
    // ──────────────────────────────────────────────────────────────────────────

    static Map<String,String> codeMap = Map.of(
            "AI","Air India",
            "IX","Air India Express",
            "I5","Air Asia",
            "QP","Akasa Air",
            "G8","Go First",
            "6E","IndiGo",
            "SG","SpiceJet",
            "UK","Vistara"
    );

    public List<ResponseDto> getData(String fromc, String toCode, String from, String to, String date, int adult, int child, int infrant, String coupen) throws IOException {
        Optional<CoupenEntity> coupenByCoupenCode = null;
        boolean isDomestic = isDomesticFlight(from, to);
        if (coupen != null && !Objects.equals("null", coupen))
        {
            coupenByCoupenCode = coupenService.getCoupenByCoupenCode(coupen);
            if (coupenByCoupenCode.isEmpty()){
                throw new BadRequestException("Coupon code is not valid.");
            }
        }

        fromc = from.substring(from.indexOf('(')+1,from.indexOf(')'));
        toCode = to.substring(to.indexOf('(')+1,to.indexOf(')'));

        from = from.substring(0, from.indexOf(","));
        to = to.substring(0, to.indexOf(","));

        from = String.join("", Arrays.asList(from.split(" ")));
        to = String.join("", Arrays.asList(to.split(" ")));

        try {
            String[] str = date.split("-");
            String[] str1 = new String[3];
            str1[0] = str[2];
            str1[1] = str[1];
            str1[2] = str[0];
            date = String.join("-",str1);
            date = date.replaceAll("-","\\/");

            // ── NEW API INTEGRATION ───────────────────────────────────────────────────
            // Calls NewApiClient (new endpoint) → FlightResponseAdapter (maps to Root1).
            // Everything below this line — the Root→ResponseDto mapping, sorting, and
            // all price/discount logic — is completely unchanged.
            //
            // To roll back to the old API temporarily: comment the next line,
            // uncomment the OLD API BLOCK below, and redeploy.
            Root1 rt = fetchRootsFromNewApi(fromc, toCode, from, to, date, adult, child, infrant);
            // ─────────────────────────────────────────────────────────────────────────

            /* ── OLD API BLOCK (preserved for rollback reference) ──────────────────────
            URL url = new URL("https://www.cleartrip.com/flight/search/v2?adults="+adult+"&childs="+child+"&infants="+infrant+"&class=Economy&airline=&carrier=&page=&sellingCountry=IN&ssfi=&flexi_search=&ssfc=&origin="+fromc+"%20-%20"+from+",%20IN&destination="+toCode+"%20-%20"+to+",%20IN&intl=n&sft=&depart_date="+date+"&return_date=&from="+fromc+"&to="+toCode);
            HttpURLConnection httpConn = (HttpURLConnection) url.openConnection();
            httpConn.setRequestMethod("GET");
            httpConn.setRequestProperty("accept", "application/json");
            // ... remaining headers: see git history for full header set ...
            InputStream responseStream = httpConn.getResponseCode() / 100 == 2
                    ? httpConn.getInputStream() : httpConn.getErrorStream();
            if ("gzip".equals(httpConn.getContentEncoding())) {
                responseStream = new GZIPInputStream(responseStream);
            }
            Scanner s = new Scanner(responseStream).useDelimiter("\\A");
            String response = s.hasNext() ? s.next() : "";
            JsonParser jsonParser = new JsonParser();
            JsonObject jsonObject = new JsonObject();
            jsonObject.add("roots", jsonParser.parse("[" + response.split(new String("\\[\\["))[1].split("\\]\\]")[0] + "]"));
            Root1 rt = new GsonBuilder().setLenient().create().fromJson(jsonObject, Root1.class);
            ── END OLD API BLOCK ──────────────────────────────────────────────────── */

            List<ResponseDto> responseDtos = new ArrayList<>();

            for (Root root : rt.roots){
                ResponseDto responseDto = new ResponseDto();
                responseDto.setAdult(adult);
                responseDto.setChild(child);
                responseDto.setInfrant(infrant);

                if (adult > 0) responseDto.setAdultPerPerson(Double.valueOf(root.priceBreakup.fare.pricingInfo.ADT.totalPrice));
                if (child > 0) responseDto.setChildPerPerson(Double.valueOf(root.priceBreakup.fare.pricingInfo.CHD.totalPrice));
                if (infrant > 0) responseDto.setInfrantPerPerson(Double.valueOf(root.priceBreakup.fare.pricingInfo.CHD.totalPrice));

                responseDto.setFlightName(codeMap.get(root.airlineCodes.get(0)));

                if(root.sectorKeys.get(0).split("\\|").length == 1) responseDto.setDuration(LocalTime.MIN.plus(Duration.ofMinutes(root.totalDurationInMinutes)).toString()+" hrs (Non stop)");
                else responseDto.setDuration(LocalTime.MIN.plus(Duration.ofMinutes(root.totalDurationInMinutes)).toString()+" hrs" + " (" + (root.sectorKeys.get(0).split("\\|").length - 1) +" stops)");

                responseDto.setStops(root.sectorKeys.get(0).split("\\|").length - 1);
                responseDto.setSectorKeys(root.sectorKeys);

                if(root.priceBreakup.fare.fk.contains("#")){
                    root.priceBreakup.fare.fk = root.priceBreakup.fare.fk.replace("#","");
                }

                double totalCombinePrice = (responseDto.getAdultPerPerson() * responseDto.getAdult()) +
                        (responseDto.getChildPerPerson() * responseDto.getChild()) + (responseDto.getInfrantPerPerson() * responseDto.getInfrant());

                responseDto.setDicPerPerson(String.valueOf(Double.valueOf(root.priceBreakup.fare.pricingInfo.ADT.totalPrice)));
                responseDto.setDiscPrice(totalCombinePrice+"");
                responseDto.setFkkey(root.priceBreakup.fare.fk);
                responseDto.setPrice(totalCombinePrice+"");
                responseDto.setFrom(fromc);
                responseDto.setTo(toCode);
                responseDto.setDate(date);
                responseDto.setPerPerson(Double.valueOf(root.priceBreakup.fare.pricingInfo.ADT.totalPrice) +"");
                responseDto.setAirCode(root.airlineCodes.toString());
                responseDto.setfTime(root.firstDeparture.time +" - " + root.lastArrival.time);
                responseDto.setTime("From: " + root.firstDeparture.date +" // "+ root.firstDeparture.time+" To: "+ root.lastArrival.date+" // "+ root.lastArrival.time);
                responseDto.setFromDate(root.firstDeparture.date.substring(0,2)+"/"+root.firstDeparture.date.substring(2,4)+"/"+root.firstDeparture.date.substring(4));
                responseDto.setToDate(root.lastArrival.date);
                responseDto.setFromTime(root.firstDeparture.time);
                responseDto.setToTime(root.lastArrival.time);
                responseDto.setSeatLeft(root.indicators.seatsLeft+"");

                responseDtos.add(responseDto);
            }
            responseDtos.sort(Comparator.comparingDouble(a -> Double.parseDouble(a.price)));
            return coupen != null && !Objects.equals("null", coupen) && isDomestic ? modifyPrices(responseDtos, coupenByCoupenCode.get()) : responseDtos;
        }catch (Exception ex){
            throw ex;
        }
    }

    /**
     * Calls the new Cleartrip API and adapts its response into the legacy Root1 model.
     * This is the only integration point for the new API — all downstream logic is unchanged.
     *
     * @param fromCode IATA origin code extracted from the request (e.g. "AMD")
     * @param toCode   IATA destination code (e.g. "BOM")
     * @param fromCity City name of origin, spaces removed (e.g. "Ahmedabad")
     * @param toCity   City name of destination (e.g. "Mumbai")
     * @param date     Formatted date "DD/MM/YYYY" — already processed by getData()
     */
    private Root1 fetchRootsFromNewApi(String fromCode, String toCode,
                                       String fromCity, String toCity,
                                       String date, int adult, int child, int infrant) throws IOException {
        NewCleartripResponse newResponse = newApiClient.fetchFlights(
                fromCode, toCode, fromCity, toCity, date, adult, child, infrant);
        return flightResponseAdapter.adapt(newResponse);
    }

    private boolean isDomesticFlight(String from, String to) {
        return from.contains(", IN - ") && to.contains(", IN - ");
    }

    private List<ResponseDto> modifyPrices(List<ResponseDto> responseDtos, CoupenEntity coupenEntity) {
        if (DiscountType.FLAT.equals(coupenEntity.getDiscountType()))
        {
            return responseDtos.stream()
                    .peek(responseDto -> {
                        if (responseDto.getAdultPerPerson() >= coupenEntity.getMinAmount()) {
                            double totalCombinePrice = (responseDto.getAdultPerPerson() * responseDto.getAdult()) +
                                    (responseDto.getChildPerPerson() * responseDto.getChild());

                            double discountedPrice = Math.ceil(totalCombinePrice - Math.min(totalCombinePrice * (coupenEntity.getFixPercentage() / 100), coupenEntity.getMaxDiscount()));

                            responseDto.setDiscPrice(String.valueOf(
                                    Math.max(Math.ceil(discountedPrice + (responseDto.getInfrantPerPerson() * responseDto.getInfrant())),0)
                            ));
                            responseDto.setDicPerPerson(String.valueOf(
                                    Math.max(Math.ceil(Double.parseDouble(responseDto.getPerPerson()) - (Math.min(Double.parseDouble(responseDto.getPerPerson()) * (coupenEntity.getFixPercentage() / 100), coupenEntity.getMaxDiscount()))), 0)
                            ));
                        } else {
                            double totalCombinePrice = (responseDto.getAdultPerPerson() * responseDto.getAdult()) +
                                    (responseDto.getChildPerPerson() * responseDto.getChild());

                            double discountedPrice = Math.ceil(totalCombinePrice - 0);

                            responseDto.setDiscPrice(String.valueOf(
                                    Math.max(Math.ceil(discountedPrice + (responseDto.getInfrantPerPerson() * responseDto.getInfrant())),0)
                            ));
                            responseDto.setDicPerPerson(String.valueOf(
                                    Math.max(Math.ceil(Double.parseDouble(responseDto.getPerPerson())), 0)
                            ));
                        }
                    })
                    .toList();
        }
        else if (DiscountType.CONVENANCE_FEE.equals(coupenEntity.getDiscountType()))
        {
            return responseDtos.stream()
                    .peek(responseDto -> {
                        if (responseDto.getAdultPerPerson() >= coupenEntity.getMinAmount()) {
                            double totalCombinePrice = (responseDto.getAdultPerPerson() * responseDto.getAdult()) +
                                    (responseDto.getChildPerPerson() * responseDto.getChild());

                            double flatDiscountAmount = Math.min(totalCombinePrice * (coupenEntity.getFixPercentage() / 100), coupenEntity.getMaxDiscount());
                            double effectiveDiscountAmount = Math.max(flatDiscountAmount - (coupenEntity.getConvenanceFee() != null ? coupenEntity.getConvenanceFee() : 0), 0);

                            double discountedPrice = Math.ceil(totalCombinePrice - effectiveDiscountAmount);

                            responseDto.setDiscPrice(String.valueOf(
                                    Math.max(Math.ceil(discountedPrice + (responseDto.getInfrantPerPerson() * responseDto.getInfrant())),0)
                            ));
                            
                            double perPersonDiscount = Math.max(Math.min(Double.parseDouble(responseDto.getPerPerson()) * (coupenEntity.getFixPercentage() / 100), coupenEntity.getMaxDiscount()) - (coupenEntity.getConvenanceFee() != null ? coupenEntity.getConvenanceFee() : 0), 0);
                            
                            responseDto.setDicPerPerson(String.valueOf(
                                    Math.max(Math.ceil(Double.parseDouble(responseDto.getPerPerson()) - perPersonDiscount), 0)
                            ));
                        } else {
                            double totalCombinePrice = (responseDto.getAdultPerPerson() * responseDto.getAdult()) +
                                    (responseDto.getChildPerPerson() * responseDto.getChild());

                            double discountedPrice = Math.ceil(totalCombinePrice - 0);

                            responseDto.setDiscPrice(String.valueOf(
                                    Math.max(Math.ceil(discountedPrice + (responseDto.getInfrantPerPerson() * responseDto.getInfrant())),0)
                            ));
                            responseDto.setDicPerPerson(String.valueOf(
                                    Math.max(Math.ceil(Double.parseDouble(responseDto.getPerPerson())), 0)
                            ));
                        }
                    })
                    .toList();
        }
        else
        {
            List<RangeEntity> rangeEntities = coupenEntity.getRangeDiscounts();

            return responseDtos.stream()
                    .map(responseDto -> applyDiscounts(responseDto, rangeEntities))
                    .peek(responseDto -> {
                        if (Objects.isNull(responseDto.getDiscPrice())) {
                            responseDto.setDiscPrice(responseDto.getPrice());
                            responseDto.setDicPerPerson(responseDto.getPerPerson());
                        }
                    })
                    .toList();
        }
    }

    private ResponseDto applyDiscounts(ResponseDto responseDto, List<RangeEntity> rangeEntities) {
        rangeEntities
                .forEach(rangeEntity -> {
                    Double price = Double.parseDouble(responseDto.getPerPerson());
                    if (price > rangeEntity.getFrom() && price < rangeEntity.getTo())
                    {
                        double totalCombinePrice = (responseDto.getAdultPerPerson() * responseDto.getAdult()) +
                                (responseDto.getChildPerPerson() * responseDto.getChild());

                        double discountedPrice = Math.ceil(totalCombinePrice - (rangeEntity.getValue() * (responseDto.getAdult() + responseDto.getChild())));

                        responseDto.setDiscPrice(String.valueOf(Math.max(discountedPrice + (responseDto.getInfrantPerPerson() * responseDto.getInfrant()), 0)));
                        responseDto.setDicPerPerson(String.valueOf(Math.max(price - rangeEntity.getValue(), 0)));
                    }
                });
        return responseDto;
    }

    public String  getFlightResult(String keyword) throws IOException {
        OkHttpClient client = new OkHttpClient();
        Request request = new Request.Builder()
                .url("https://www.cleartrip.com/places/airports/search?string="+keyword)
                .header("accept", "*/*")
                .header("accept-language", "en-IN,en;q=0.9,gu-IN;q=0.8,gu;q=0.7,hi-IN;q=0.6,hi;q=0.5,ur-IN;q=0.4,ur;q=0.3,en-GB;q=0.2,en-US;q=0.1")
                .header("app-agent", "DESKTOP")
                .header("channel", "desktop")
                .header("content-type", "application/json")
                .header("cookie", "_ga=GA1.1.1690200214.1690282582; WZRK_G=a587db6bc7f64b8199a44fd9bb283fa8; __rtbh.uid=%7B%22eventType%22%3A%22uid%22%2C%22id%22%3A%22unknown%22%7D; statsig-stableid=44dee381-c87a-4468-a5cd-fac935dd461c; ct-dvId=Fq2w7ZJKU6XYdrycw3MKOm6gte43OxV0KLQW3%2FPjbG%2BPFI77mtjknhgn18KRcF%2FRssOLSlftn9UZ5AztA7wU4JOfhXGZvNBQOSbCFNSJE2Q%3D; _ga_N9K6RL6ZY1=GS1.1.1719084496.4.0.1719084496.60.0.0; Apache=cd27987c.61bcf7cecd5b0; ct_statsig_experiments={\"search_v3\":\"b\"}; rbzid=SpGP2wxtgCs/MhJvoidvvJ0e3YtPyhHpPwC59TRHEH6PmVDwJJ8eeZFlpFPavJXi1DK4oFCDG73Znlc55uPd53EHK3XtYTKcWmqGhAWL7G1H21b6MIvBtpTZqqwUYfsMM1rJBxP4oUY3RI6y8lAXAfX8y4rsKZbkZZyX6WjAEFlW4PgOHBeuCB45eSRmyt0GtvoxD/Yikiszhj5pKSVINfAJOhaTop5eCJbCDSI9MOY=; rbzsessionid=1bf4bf74e39afe4793f70d8eb9e101ce; noncleartrip=false; _gcl_au=1.1.636020875.1729358804; 35BS11281-ref=organic|search|google|google.com|1729358803935; 35BS11281=5759fb62d4-1729358803936; 35BS11281-cp=df97269fc0-1719064989433,8014957622-1719427880301,5759fb62d4-1729358803936; _uetsid=4fbdce508e3f11efb0f3411f609b30a0; _uetvid=e45fd9302ad911ee843af9c5efb8acc7; mfKey=1150uu7.1729358804411; cto_bundle=gZ3fS19aa3dXZXFkaHNBQnJUZWpjQ1lEUDZxVmhuWmFjRnJCc3dWRSUyQlVFbWwwY2pwZXFRWnZxNFNSZDdjakRST1oxTUIxMVlaV2tiWWhEaGV4Z1BRTWdiQlBvUU4lMkYlMkZrS0xkJTJCMTVTN2ZnSzBxUm91UWtvZVR6TkhuMFM2VUJRTSUyRk1jS2owWVhNbUNsNGRUJTJCR1haNllZRlBvSDBrQlMxNSUyQmJFakxMY2VCUkVZRUZOSlBFbVNWQ3ZzNERxRzB6UzNoUDMlMkJZQ054ZkJudGRJbDZTSFElMkJQdkNOVUJ3JTNEJTNE; _ga_5CWGPF7QB9=GS1.1.1729358804.5.0.1729358805.59.0.0; _ga_M9WKWY8MDB=GS1.1.1729358804.5.0.1729358805.59.0.0; WZRK_S_W8R-KK8-W74Z=%7B%22p%22%3A1%2C%22s%22%3A1729358803%2C%22t%22%3A1729358811%7D")
                .header("priority", "u=1, i")
                .header("referer", "https://www.cleartrip.com/flights")
                .header("sec-ch-ua", "\"Google Chrome\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\"")
                .header("sec-ch-ua-mobile", "?0")
                .header("sec-ch-ua-platform", "\"Windows\"")
                .header("sec-fetch-dest", "empty")
                .header("sec-fetch-mode", "cors")
                .header("sec-fetch-site", "same-origin")
                .header("traceparent", "00-f27788e661c4065677d23601459235d8-66da325c9d86c3e9-01")
                .header("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36")
                .header("x-client-id", "cleartrip")
                .header("x-source-type", "Desktop")
                .header("x-unified-header", "{\"platform\":\"desktop\",\"trackingId\":\"77d68793-7127-441c-98a2-8f44b5118aa8\",\"source\":\"CLEARTRIP\"}")
                .build();

        Response response = client.newCall(request).execute();
        Scanner s = new Scanner(response.body().byteStream()).useDelimiter("\\A");
        String responsea = s.hasNext() ? s.next() : "";
//        ObjectMapper om = new ObjectMapper();
//        SearchResult[] root = om.readValue(responsea, SearchResult[].class);
//        List<SearchResult> searchResults = new ArrayList<>();
//
//        Arrays.stream(root).forEach(sr -> {
//            searchResults.add(new SearchResult(sr.k,sr.v.substring(0,sr.v.indexOf(','))));
//        });7891602274

//        System.out.println(responsea);
        return responsea;
    }
}
