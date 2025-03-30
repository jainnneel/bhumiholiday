package com.test.coupen.service;

import org.apache.kafka.clients.producer.ProducerRecord;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

//@EnableKafka
@Service
public class KafkaProducer {

//    private final KafkaTemplate<String, String> kafkaTemplate;
//
//    public KafkaProducer(KafkaTemplate<String, String> kafkaTemplate) {
//        this.kafkaTemplate = kafkaTemplate;
//    }
//
//    public void sendMessage(String topicName, String message) {
//        kafkaTemplate.send(new ProducerRecord<>(topicName, message));
//    }
}
