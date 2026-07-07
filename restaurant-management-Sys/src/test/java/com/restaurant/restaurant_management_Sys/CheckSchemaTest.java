package com.restaurant.restaurant_management_Sys;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.List;
import java.util.Map;

@SpringBootTest
public class CheckSchemaTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    public void testSchema() {
        List<Map<String, Object>> columns = jdbcTemplate.queryForList("DESCRIBE menu_items");
        for (Map<String, Object> column : columns) {
            System.out.println("COLUMN_INFO: " + column.get("Field") + " -> " + column.get("Type"));
        }
    }
}
