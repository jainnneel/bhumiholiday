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
            URL url = new URL("https://www.cleartrip.com/node/flight/search?adults="+adult+"&childs="+child+"&infants="+infrant+"&class=Economy&airline=&carrier=&page=&sellingCountry=IN&ssfi=&flexi_search=&ssfc=&origin="+fromc+"%20-%20"+from+",%20IN&destination="+toCode+"%20-%20"+to+",%20IN&intl=n&sft=&depart_date="+date+"&return_date=&from="+fromc+"&to="+toCode);
            HttpURLConnection httpConn = (HttpURLConnection) url.openConnection();
            httpConn.setRequestMethod("GET");

            httpConn.setRequestProperty("accept", "application/json");
            httpConn.setRequestProperty("accept-language", "en-IN,en;q=0.9,gu-IN;q=0.8,gu;q=0.7,hi-IN;q=0.6,hi;q=0.5,ur-IN;q=0.4,ur;q=0.3,en-GB;q=0.2,en-US;q=0.1");
            httpConn.setRequestProperty("app-agent", "DESKTOP");
            httpConn.setRequestProperty("cache-control", "no-cache");
            httpConn.setRequestProperty("cookie", "_ga=GA1.1.1690200214.1690282582; WZRK_G=a587db6bc7f64b8199a44fd9bb283fa8; __rtbh.uid=%7B%22eventType%22%3A%22uid%22%2C%22id%22%3A%22unknown%22%7D; statsig-stableid=44dee381-c87a-4468-a5cd-fac935dd461c; ct-dvId=Fq2w7ZJKU6XYdrycw3MKOm6gte43OxV0KLQW3%2FPjbG%2BPFI77mtjknhgn18KRcF%2FRssOLSlftn9UZ5AztA7wU4JOfhXGZvNBQOSbCFNSJE2Q%3D; _ga_N9K6RL6ZY1=GS1.1.1719084496.4.0.1719084496.60.0.0; Apache=cd27987c.61bcf7cecd5b0; _gcl_au=1.1.636020875.1729358804; 35BS11281-ref=organic|search|google|google.com|1729358803935; mfKey=1150uu7.1729358804411; _fbp=fb.1.1729359119306.809219395138046; utm_source=google; utm_medium=cpc; utm_campaign=BR_Cleartrip-Desktab; utm_term=; utm_content=; utm_source_platform=; utm_creative_format=; utm_marketing_tactic=; ct_statsig_experiments={\"search_v3\":\"b\"}; rbzid=kdb84Q7e/O/lPTHLmMC37b/H1bZxEKlweeTiL6uEs15oKpv1n9JYbIr/vlB6YxPxrnGi3Elh/Vfozg+TnGiRzK6cfsaEw3diY6s7HPPcl/a+wxAUy7mnQArsmuPWfHLXJLGoiObIFyxukqtG1C43t3f7VojLu2Q/0APsAif/YYrlHC3zNisRiFflz1zVKWXPncddwbK7MUkM2FiX1AaeWAJyn96nCQDr36CHxl565dg=; rbzsessionid=3cc6383e2a032ad60ba4210e155f1a40; source_affiliatefirstsource=google; source_Meta=google; campaign_affiliatefirstsource=BR_Cleartrip-Desktab; medium_affiliatefirstsource=cpc; affiliate_expdate=Mon Oct 21 2024; source_firstsource=google; campaign_firstsource=BR_Cleartrip-Desktab; medium_firstsource=cpc; source_firstpaidsource=google; medium_firstpaidsource=cpc; campaign_firstpaidsource=BR_Cleartrip-Desktab; noncleartrip=true; _gcl_gs=2.1.k1$i1729454572$u135491363; 35BS11281=CjwKCAjw1NK4BhAwEiwAVUHPUEjd9v_-bMtYDBGHkZIG5y0UE9-HoDIw8GWGgHGFXTkBZ2kXiw3PtBoC8GsQAvD_BwE; 35BS11281-cp=df97269fc0-1719064989433,8014957622-1719427880301,5759fb62d4-1729358803936,CjwKCAjw1NK4BhAwEiwAVUHPUEjd9v_-bMtYDBGHkZIG5y0UE9-HoDIw8GWGgHGFXTkBZ2kXiw3PtBoC8GsQAvD_BwE; 35BS11281-gclid=CjwKCAjw1NK4BhAwEiwAVUHPUEjd9v_-bMtYDBGHkZIG5y0UE9-HoDIw8GWGgHGFXTkBZ2kXiw3PtBoC8GsQAvD_BwE|1729454573; cto_bundle=_iX3MV9aa3dXZXFkaHNBQnJUZWpjQ1lEUDZvMHdQVUdZJTJCSTN5N1N6MFFFY1dWTGRlU2FFclh3YVZtWDVXSWRmZ0dGSXo4c0ZSemJ6alA2aWphcHJhREZWWjl4b2xvV1pZOEloY0RESlNWcUFIeUVzNnhZbnVyZHcwY2RycXpNUjlaemQ5QjR1RXlHQ0xqRFB5OGQlMkZ1MkM2a0FKM1BDQWY2ODZNdUpwSmg4OSUyQjRMJTJGOGhGRGpXM2xlSlUxNWElMkY2NXAzMG5RREt4MmZjd1ZzZyUyRmtzVE1jTDdON1VBJTNEJTNE; _ga_M9WKWY8MDB=GS1.1.1729454573.7.1.1729454584.49.0.0; _ga_5CWGPF7QB9=GS1.1.1729454573.7.1.1729454584.49.0.0; _gcl_aw=GCL.1729454585.CjwKCAjw1NK4BhAwEiwAVUHPUEjd9v_-bMtYDBGHkZIG5y0UE9-HoDIw8GWGgHGFXTkBZ2kXiw3PtBoC8GsQAvD_BwE; mf_visitid=vwbg7q.1729454584713; mf_utms=%7B%22adults%22%3A%221%22%2C%22childs%22%3A%220%22%2C%22infants%22%3A%220%22%2C%22class%22%3A%22Economy%22%2C%22depart_date%22%3A%2220%2F11%2F2024%22%2C%22from%22%3A%22AMD%22%2C%22to%22%3A%22CCU%22%2C%22intl%22%3A%22n%22%2C%22origin%22%3A%22AMD%2520-%2520Ahmedabad%2C%2520IN%22%2C%22destination%22%3A%22CCU%2520-%2520Kolkata%2C%2520IN%22%2C%22sft%22%3A%22%22%2C%22sd%22%3A%221729454584174%22%2C%22rnd_one%22%3A%22O%22%2C%22sourceCountry%22%3A%22Ahmedabad%22%2C%22destinationCountry%22%3A%22Kolkata%22%2C%22isCfw%22%3A%22false%22%2C%22utm_source%22%3A%22google%22%2C%22utm_medium%22%3A%22cpc%22%2C%22utm_campaign%22%3A%22BR_Cleartrip-Desktab%22%7D; _uetsid=4ae4a1408f1e11ef9c089bd7abe3aff7; _uetvid=e45fd9302ad911ee843af9c5efb8acc7; WZRK_S_W8R-KK8-W74Z=%7B%22p%22%3A2%2C%22s%22%3A1729454573%2C%22t%22%3A1729454584%7D");
            httpConn.setRequestProperty("expires", "0");
            httpConn.setRequestProperty("newrelic", "eyJ2IjpbMCwxXSwiZCI6eyJ0eSI6IkJyb3dzZXIiLCJhYyI6IjE4MzU4NjEiLCJhcCI6IjExMDMyMDc4MzkiLCJpZCI6ImE0NTgyYTc4NTdmYjI3YzkiLCJ0ciI6ImMwODM2YTUyNjZkZDhkNWM5ZDhkMzgxYzU3ZWZmMDIwIiwidGkiOjE3Mjk0NTQ1ODUzNzZ9fQ==");
            httpConn.setRequestProperty("pragma", "no-cache");
            httpConn.setRequestProperty("preferred-language", "");
            httpConn.setRequestProperty("priority", "u=1, i");
            httpConn.setRequestProperty("r_lang", "");
            httpConn.setRequestProperty("referer", "https://www.cleartrip.com/flights/results?adults=1&childs=0&infants=0&class=Economy&depart_date=20/11/2024&from=AMD&to=CCU&intl=n&origin=AMD%20-%20Ahmedabad,%20IN&destination=CCU%20-%20Kolkata,%20IN&sft=&sd=1729454584174&rnd_one=O&sourceCountry=Ahmedabad&destinationCountry=Kolkata&isCfw=false&utm_source=google&utm_medium=cpc&utm_campaign=BR_Cleartrip-Desktab");
            httpConn.setRequestProperty("sec-ch-ua", "\"Google Chrome\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\"");
            httpConn.setRequestProperty("sec-ch-ua-mobile", "?0");
            httpConn.setRequestProperty("sec-ch-ua-platform", "\"Windows\"");
            httpConn.setRequestProperty("sec-fetch-dest", "empty");
            httpConn.setRequestProperty("sec-fetch-mode", "cors");
            httpConn.setRequestProperty("sec-fetch-site", "same-origin");
            httpConn.setRequestProperty("traceparent", "00-c0836a5266dd8d5c9d8d381c57eff020-a4582a7857fb27c9-01, 00-93508c02c92e0fc0b5a54402138c62a0-23b90f150c4a2caa-01");
            httpConn.setRequestProperty("tracestate", "1835861@nr=0-1-1835861-1103207839-a4582a7857fb27c9----1729454585376");
            httpConn.setRequestProperty("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36");
            httpConn.setRequestProperty("x-newrelic-id", "undefined");

            InputStream responseStream = httpConn.getResponseCode() / 100 == 2
                    ? httpConn.getInputStream()
                    : httpConn.getErrorStream();
            if ("gzip".equals(httpConn.getContentEncoding())) {
                responseStream = new GZIPInputStream(responseStream);
            }
            Scanner s = new Scanner(responseStream).useDelimiter("\\A");
            String response = s.hasNext() ? s.next() : "";
            JsonParser jsonParser = new JsonParser();
            JsonObject jsonObject = new JsonObject();
            jsonObject.add("roots", jsonParser.parse("[" + response.split(new String("\\[\\["))[1].split("\\]\\]")[0] + "]"));
            Root1 rt = new GsonBuilder()
                    .setLenient()
                    .create().fromJson(jsonObject, Root1.class);

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
