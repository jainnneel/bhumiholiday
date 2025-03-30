package com.test.coupen.resources;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import org.apache.catalina.util.StringUtil;
import org.apache.commons.lang3.RandomStringUtils;
import org.apache.commons.lang3.RandomUtils;
import org.springframework.boot.actuate.autoconfigure.metrics.MeterRegistryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;

@RestController
public class CounterController {

    private final Counter requestCounter;
    private final AtomicLong jriSuccessfulCountTotal = new AtomicLong(0);

    public CounterController(MeterRegistry meterRegistry) {
        this.requestCounter = Counter.builder("transaction_amount_bar_chart_increase")
                .description("Total points issued")
                .tag("pod_id", RandomStringUtils.random(10))
                .register(meterRegistry);

        Gauge.builder("transaction_amount_cumulative_add", jriSuccessfulCountTotal, AtomicLong::get).tag("pod_id", RandomStringUtils.random(10)).register(meterRegistry);
    }

    @GetMapping("/increment/{value}")
    public String incrementCounter(@PathVariable(value = "value") Integer value) {
        requestCounter.increment(value);
        jriSuccessfulCountTotal.addAndGet(value);
        return "Transaction amount incremented by " + requestCounter.count();
    }
}
