package com.test.coupen.service;

import com.test.coupen.Transaction;
import jakarta.annotation.PostConstruct;
import org.kie.api.KieServices;
import org.kie.api.builder.KieBuilder;
import org.kie.api.builder.KieFileSystem;
import org.kie.api.builder.KieRepository;
import org.kie.api.runtime.KieContainer;
import org.kie.api.runtime.KieSession;
import org.kie.api.runtime.rule.AgendaFilter;
import org.kie.api.runtime.rule.Match;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DroolsExecutor {

    private KieSession kieSession;

    @Autowired
    private RewardService rewardService;  // Inject the service

    @Autowired
    private DroolsRuleLoader droolsRuleLoader;

    @PostConstruct
    public void init() {
        reloadDroolsRules();
    }

    public void reloadDroolsRules() {
        try {
            String drlContent = droolsRuleLoader.generateDRL();

            KieServices kieServices = KieServices.Factory.get();
            KieFileSystem kieFileSystem = kieServices.newKieFileSystem();
            kieFileSystem.write("src/main/resources/rules/dynamic-rules.drl", drlContent);
            KieBuilder kieBuilder = kieServices.newKieBuilder(kieFileSystem);
            kieBuilder.buildAll();
            KieRepository kieRepository = kieServices.getRepository();
            KieContainer kieContainer = kieServices.newKieContainer(kieRepository.getDefaultReleaseId());
            kieSession = kieContainer.newKieSession();
            kieSession.setGlobal("rewardService", rewardService);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void evaluateTransaction(Transaction transaction) {
        kieSession.insert(transaction);
        kieSession.fireAllRules();
        kieSession.fireAllRules(new AgendaFilter() {
            @Override
            public boolean accept(Match match) {
                return false;
            }
        });
    }
}
