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

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

@SpringBootApplication
public class CoupenApplication {

//	@Autowired
//	KafkaProducer kafkaProducer;

	public static void main(String[] args) throws IOException {
		SpringApplication.run(CoupenApplication.class, args);
//		new CoupenApplication().test();

//		System.out.println(new BigDecimal(62255L).multiply(new BigDecimal("0.01")).toString());

//		List<LocalDate> localDates = List.of(LocalDate.now(), LocalDate.now().plus(1, ChronoUnit.DAYS), LocalDate.now().plus(2, ChronoUnit.DAYS));
//
//		List<LocalDate> list = localDates.stream().sorted(Comparator.reverseOrder()).toList();
//		System.out.println(list);

	}

//	void test() throws IOException {
//		InputStream keystoreStream = getClass().getClassLoader().getResourceAsStream("keystore/baeldung.p12");
//		System.out.println(Arrays.toString(keystoreStream.readAllBytes()));;
//	}

//	@Bean
//	CommandLineRunner run(DroolsExecutor executor) {
//		return args -> {
//			Transaction transaction = new Transaction(6000, "PURCHASE");
//			executor.evaluateTransaction(transaction);
//		};
//	}

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
