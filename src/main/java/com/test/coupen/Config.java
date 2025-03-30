package com.test.coupen;

import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.boot.actuate.autoconfigure.metrics.MeterRegistryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class Config {
    @Bean
    MeterRegistryCustomizer<MeterRegistry> configureMetrics() {
        return registry -> registry.config()
                .commonTags("pod_name", "DSAD");
    }
}
