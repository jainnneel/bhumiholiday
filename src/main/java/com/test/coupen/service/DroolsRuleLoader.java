package com.test.coupen.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.test.coupen.entity.RuleEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DroolsRuleLoader {

    private static final String RULE_TEMPLATE =
            "rule \"%s\"\n" +
                    "when\n" +
                    "    $transaction: Transaction(%s)\n" +
                    "then\n" +
                    "    rewardService.%s;\n" +  // Injected global variable
                    "    System.out.println(\"Rule executed: %s\");\n" +
                    "end\n\n";

    @Autowired
    private RuleService ruleService;

    public String generateDRL() {
        StringBuilder drlBuilder = new StringBuilder();
        drlBuilder.append("package com.test.coupen.rules;\n\n");
        drlBuilder.append("import com.test.coupen.Transaction;\n"); // ✅ Ensure Transaction is imported
        drlBuilder.append("import com.test.coupen.service.RewardService;\n\n"); // ✅ Import RewardService

        drlBuilder.append("global RewardService rewardService;\n\n");  // Declare global service

        List<RuleEntity> rules = ruleService.getAllRules();

        for (RuleEntity rule : rules) {
            String conditionString = convertJsonToDroolsCondition(rule.getConditions());
            String ruleContent = String.format(RULE_TEMPLATE,
                    rule.getRuleName(),
                    conditionString,
                    rule.getActions(),
                    rule.getRuleName()
            );
            drlBuilder.append(ruleContent);
        }
        return drlBuilder.toString();
    }

    private String convertJsonToDroolsCondition(String jsonCondition) {
        // Convert JSON condition to valid Drools syntax
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode conditionNode = objectMapper.readTree(jsonCondition);
            String field = conditionNode.get("field").asText();
            String operator = conditionNode.get("operator").asText();
            String value = conditionNode.get("value").asText();
            String transactionType = conditionNode.has("transactionType") ?
                    " && transactionType == \"" + conditionNode.get("transactionType").asText() + "\"" : "";

            return field + " " + operator + " " + value + transactionType;
        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }
}
