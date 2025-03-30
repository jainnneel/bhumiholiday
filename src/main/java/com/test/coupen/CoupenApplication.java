package com.test.coupen;

import com.test.coupen.service.DroolsExecutor;
import com.test.coupen.service.KafkaProducer;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Lazy;

@SpringBootApplication
public class CoupenApplication {

	@Autowired
	KafkaProducer kafkaProducer;

	public static void main(String[] args) {
		SpringApplication.run(CoupenApplication.class, args);
	}

	@Bean
	CommandLineRunner run(DroolsExecutor executor) {
		return args -> {
			Transaction transaction = new Transaction(6000, "PURCHASE");
			executor.evaluateTransaction(transaction);
		};
	}

	@PostConstruct
	public void publishMessage(){
//		for (int i = 0; i < 10000; i++){
//			kafkaProducer.sendMessage("upi-1", "UPI-"+i);
//		}
//		for (int i = 0; i < 1000; i++){
//			kafkaProducer.sendMessage("bill-1", "BILL-"+i);
//		}
//		for (int i = 0; i < 1000; i++){
//			kafkaProducer.sendMessage("recharge-1", "RECHARGE-"+i);
//		}
	}

// docker run -d --name mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=secret -e MYSQL_DATABASE=mySchema mysql
}
