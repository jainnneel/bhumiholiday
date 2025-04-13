package com.test.coupen.service;

import java.util.ArrayList;

public class ResponseDto {
    String flightName;

    ArrayList<String> sectorKeys;

    String fkkey;

    String price;

    String discPrice;

    String perPerson;

    String dicPerPerson;

    String from;

    String to;

    String date;

    String time;

    String airCode;

    String fTime;

    String duration;

    int stops;

    String fromDate;

    String fromTime;

    String toDate;

    String toTime;

    String seatLeft;
    String fromCode;
    String toCode;

    Double adultPerPerson = 0.0;
    Double childPerPerson = 0.0;
    Double infrantPerPerson = 0.0;

    Integer adult;
    Integer child;
    Integer infrant;

    public String getDiscPrice() {
        return discPrice;
    }

    public void setDiscPrice(String discPrice) {
        this.discPrice = discPrice;
    }

    public String getDicPerPerson() {
        return dicPerPerson;
    }

    public void setDicPerPerson(String dicPerPerson) {
        this.dicPerPerson = dicPerPerson;
    }

    public Integer getAdult() {
        return adult;
    }

    public void setAdult(Integer adult) {
        this.adult = adult;
    }

    public Integer getChild() {
        return child;
    }

    public void setChild(Integer child) {
        this.child = child;
    }

    public Integer getInfrant() {
        return infrant;
    }

    public void setInfrant(Integer infrant) {
        this.infrant = infrant;
    }

    public Double getAdultPerPerson() {
        return adultPerPerson;
    }

    public void setAdultPerPerson(Double adultPerPerson) {
        this.adultPerPerson = adultPerPerson;
    }

    public Double getChildPerPerson() {
        return childPerPerson;
    }

    public void setChildPerPerson(Double childPerPerson) {
        this.childPerPerson = childPerPerson;
    }

    public Double getInfrantPerPerson() {
        return infrantPerPerson;
    }

    public void setInfrantPerPerson(Double infrantPerPerson) {
        this.infrantPerPerson = infrantPerPerson;
    }

    public String getToCode() {
        return toCode;
    }

    public void setToCode(String toCode) {
        this.toCode = toCode;
    }

    public String getFromCode() {
        return fromCode;
    }

    public void setFromCode(String fromCode) {
        this.fromCode = fromCode;
    }

    public String getSeatLeft() {
        return seatLeft;
    }

    public void setSeatLeft(String seatLeft) {
        this.seatLeft = seatLeft;
    }

    public String getFromDate() {
        return fromDate;
    }

    public void setFromDate(String fromDate) {
        this.fromDate = fromDate;
    }

    public String getFromTime() {
        return fromTime;
    }

    public void setFromTime(String fromTime) {
        this.fromTime = fromTime;
    }

    public String getToDate() {
        return toDate;
    }

    public void setToDate(String toDate) {
        this.toDate = toDate;
    }

    public String getToTime() {
        return toTime;
    }

    public void setToTime(String toTime) {
        this.toTime = toTime;
    }

    public int getStops() {
        return stops;
    }

    public void setStops(int stops) {
        this.stops = stops;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getfTime() {
        return fTime;
    }

    public void setfTime(String fTime) {
        this.fTime = fTime;
    }

    public ResponseDto() {
    }

    @Override
    public String toString() {
        return "ResponseDto{" +
                "sectorKeys=" + sectorKeys +
                ", fkkey='" + fkkey + '\'' +
                ", price='" + price + '\'' +
                '}';
    }

    public ArrayList<String> getSectorKeys() {
        return sectorKeys;
    }

    public void setSectorKeys(ArrayList<String> sectorKeys) {
        this.sectorKeys = sectorKeys;
    }

    public String getFkkey() {
        return fkkey;
    }

    public void setFkkey(String fkkey) {
        this.fkkey = fkkey;
    }

    public String getPrice() {
        return price;
    }

    public void setPrice(String price) {
        this.price = price;
    }

    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
    }

    public String getDate() {
        return date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getAirCode() {
        return airCode;
    }

    public void setAirCode(String airCode) {
        this.airCode = airCode;
    }

    public String getPerPerson() {
        return perPerson;
    }

    public void setPerPerson(String perPerson) {
        this.perPerson = perPerson;
    }

    public String getFlightName() {
        return flightName;
    }

    public void setFlightName(String flightName) {
        this.flightName = flightName;
    }

}
