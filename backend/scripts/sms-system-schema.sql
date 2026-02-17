-- SMS System Schema (REFINED)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS sms_templates;
DROP TABLE IF EXISTS sms_messages;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE sms_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_id VARCHAR(50) NOT NULL UNIQUE,
    template_name VARCHAR(100) NOT NULL,
    template_content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE sms_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipient VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    sender_id INT,
    status ENUM('pending', 'sent', 'failed', 'delivered') DEFAULT 'pending',
    provider VARCHAR(50) DEFAULT 'africastalking',
    metadata JSON,
    response JSON,
    error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default templates in Kinyarwanda
INSERT INTO sms_templates (template_id, template_name, template_content, type, is_active, display_order) VALUES
('TPL-ATTENDANCE-RW', 'Incamake y\'Ubuhumbure', 'Mubyeyi, {{student}} ntiyabonetse ku ishuri uyu munsi tariki {{date}}. Mwaduhamagara kuri {{school_phone}}.', 'attendance', true, 1),
('TPL-PAYMENT-RW', 'Kwibutsa Kwishyura', 'Mubyeyi, amashuri ya {{student}} yageze igihe cyo kwishyurwa ({{amount}}). Ndagusaba kwishyura bitarenze tariki {{due_date}}.', 'payment', true, 2),
('TPL-MARKS-RW', 'Amanota Mashya', 'Mubyeyi, amanota ya {{student}} mu isomo rya {{subject}} yamaze gushyirwaho. Kanda hano uyarebe: {{link}}', 'marks', true, 3),
('TPL-GENERAL-RW', 'Itangazo rusange', '{{message}}', 'announcement', true, 4);
