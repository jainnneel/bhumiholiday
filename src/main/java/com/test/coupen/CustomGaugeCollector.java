package com.test.coupen;


import io.prometheus.metrics.model.registry.Collector;
import io.prometheus.metrics.model.registry.PrometheusScrapeRequest;
import io.prometheus.metrics.model.snapshots.MetricSnapshot;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Predicate;

@Component
public class CustomGaugeCollector implements Collector {

    private final List<Double> recordedValues = new ArrayList<>();

    @Override
    public MetricSnapshot collect() {
        return null;
    }

    @Override
    public MetricSnapshot collect(PrometheusScrapeRequest scrapeRequest) {
        return Collector.super.collect(scrapeRequest);
    }

    @Override
    public MetricSnapshot collect(Predicate<String> includedNames) {
        return Collector.super.collect(includedNames);
    }

    @Override
    public MetricSnapshot collect(Predicate<String> includedNames, PrometheusScrapeRequest scrapeRequest) {
        return Collector.super.collect(includedNames, scrapeRequest);
    }

    @Override
    public String getPrometheusName() {
        return Collector.super.getPrometheusName();
    }

//    public void recordValue(double value) {
//        synchronized (recordedValues) {
//            recordedValues.add(value);
//        }
//    }
//
//    @Override
//    public List<MetricFamilySamples> collect() {
//        List<MetricFamilySamples> metrics = new ArrayList<>();
//
//        synchronized (recordedValues) {
//            GaugeMetricFamily gaugeMetricFamily =
//                    new GaugeMetricFamily("custom_gauge_values",
//                            "Tracks all recorded values before scrape",
//                            recordedValues);
//            metrics.add(gaugeMetricFamily);
//            recordedValues.clear(); // Clear values after scraping
//        }
//
//        return metrics;
//    }
}