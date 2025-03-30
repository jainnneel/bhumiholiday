package com.test.coupen.service;

import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
//@EnableKafka
public class KafkaConsumer {

//    @KafkaListener(topics = "upi-1", groupId = "your-group", concurrency = "4")
//    public void listenUPI(String message) {
//        System.out.println(Thread.currentThread().getName() + " :: " + "Received message: " + message);
//    }
//
//    @KafkaListener(topics = "bill-1", groupId = "your-group", concurrency = "1")
//    public void listenBill(String message) {
//        System.out.println(Thread.currentThread().getName() + " :: " + "Received message: " + message);
//    }
//
//    @KafkaListener(topics = "recharge-1", groupId = "your-group", concurrency = "1")
//    public void listenRecharge(String message) {
//        System.out.println(Thread.currentThread().getName() + " :: " + "Received message: " + message);
//    }
}
