<?php
/**
 * Скрипт для отправки почты с форм сайта
 * Обрабатывает две формы:
 * 1. Форма контактов "Запросить предложение"
 * 2. Модальное окно "Запросить расчет стоимости"
 */

// Включаем обработку ошибок
error_reporting(E_ALL);
ini_set('display_errors', 0); // Не показываем ошибки на экран, будем возвращать JSON
ini_set('log_errors', 1); // Логируем ошибки

// Функция для возврата JSON ошибки
function return_error($message, $errors = [], $code = 400) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'message' => $message,
        'errors' => $errors
    ]);
    exit;
}

// Настройки для отправки почты
// ИЗМЕНИТЕ ЭТИ НАСТРОЙКИ ПОД ВАШИ ДАННЫЕ
$recipient_email = "example@example.com"; // Email получателя

// Включить логирование заявок в файл (на случай если почта не работает)
$log_requests = true; // Установите false, чтобы отключить логирование
$log_file = __DIR__ . '/requests.log'; // Файл для сохранения заявок

// Автоматическое определение названия сайта в зависимости от окружения
$host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'localhost';
$is_local = in_array($host, ['127.0.0.1', 'localhost', '127.0.0.1:5500', 'localhost:5500']) || 
            strpos($host, '127.0.0.1') !== false || 
            strpos($host, 'localhost') !== false;

// Название сайта (для локальной разработки можно указать "Локальный сервер" или оставить основное название)
$site_name = $is_local ? "art-house.world (Local Test)" : "art-house.world";

// Настройки заголовков ответа
header('Content-Type: application/json; charset=utf-8');

// Перехватываем ошибки
try {

// Функция для очистки данных от вредоносного кода
function clean_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

// Функция для валидации email
function is_valid_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Функция для валидации телефона
function is_valid_phone($phone) {
    if (empty($phone)) {
        return false;
    }
    // Удаляем все пробелы, дефисы, скобки, точки и другие символы форматирования
    $cleaned = preg_replace('/[\s\-\(\)\.]/', '', $phone);
    // Проверяем, что осталось минимум 7 цифр (минимальный формат телефона)
    // Максимум 15 цифр (международный формат)
    // Разрешаем плюс в начале (для международного формата)
    return preg_match('/^[\+]?[0-9]{7,15}$/', $cleaned);
}

// Функция для логирования заявок в файл
function log_request($form_type, $data, $log_file) {
    global $recipient_email;
    try {
        $log_entry = "\n" . str_repeat("=", 80) . "\n";
        $log_entry .= "ДАТА: " . date('Y-m-d H:i:s') . "\n";
        $log_entry .= "ТИП ФОРМЫ: " . $form_type . "\n";
        $log_entry .= "EMAIL ПОЛУЧАТЕЛЯ: " . $recipient_email . "\n";
        $log_entry .= "ДАННЫЕ:\n";
        foreach ($data as $key => $value) {
            if ($key !== 'g-recaptcha-response') { // Не логируем reCAPTCHA
                $log_entry .= "  $key: " . (is_array($value) ? json_encode($value) : $value) . "\n";
            }
        }
        $log_entry .= str_repeat("=", 80) . "\n";
        file_put_contents($log_file, $log_entry, FILE_APPEND | LOCK_EX);
    } catch (Exception $e) {
        error_log("Ошибка логирования: " . $e->getMessage());
    }
}

// Функция для отправки email
function send_email($to, $subject, $message, $headers) {
    try {
        $result = @mail($to, $subject, $message, $headers);
        if (!$result) {
            // Логируем ошибку если mail() вернула false
            $last_error = error_get_last();
            $error_msg = $last_error ? $last_error['message'] : 'Unknown error';
            error_log("Mail отправка failed: " . $error_msg);
            error_log("Attempted to send to: " . $to);
            error_log("Subject: " . $subject);
        }
        return $result;
    } catch (Exception $e) {
        error_log("Mail exception: " . $e->getMessage());
        return false;
    }
}

// Проверка метода запроса
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    return_error('Метод не разрешен', [], 405);
}

// Получение типа формы
$form_type = isset($_POST['form_type']) ? clean_input($_POST['form_type']) : '';

if ($form_type === 'contact') {
    // Обработка формы контактов "Запросить предложение"
    
    // Получение и очистка данных
    $lastName = isset($_POST['lastName']) ? clean_input($_POST['lastName']) : '';
    $firstName = isset($_POST['firstName']) ? clean_input($_POST['firstName']) : '';
    $houseModel = isset($_POST['houseModel']) ? clean_input($_POST['houseModel']) : '';
    $deliveryCountry = isset($_POST['deliveryCountry']) ? clean_input($_POST['deliveryCountry']) : '';
    $whatsapp = isset($_POST['whatsapp']) ? clean_input($_POST['whatsapp']) : '';
    $telegram = isset($_POST['telegram']) ? clean_input($_POST['telegram']) : '';
    $email = isset($_POST['email']) ? clean_input($_POST['email']) : '';
    $recaptcha_response = isset($_POST['g-recaptcha-response']) ? $_POST['g-recaptcha-response'] : '';
    
    // Валидация обязательных полей
    $errors = [];
    
    if (empty($lastName)) {
        $errors[] = 'Фамилия обязательна для заполнения';
    }
    
    if (empty($firstName)) {
        $errors[] = 'Имя обязательно для заполнения';
    }
    
    if (empty($houseModel)) {
        $errors[] = 'Модель дома обязательна для заполнения';
    }
    
    if (empty($deliveryCountry)) {
        $errors[] = 'Страна доставки обязательна для заполнения';
    }
    
    if (empty($whatsapp)) {
        $errors[] = 'WhatsApp обязателен для заполнения';
    } elseif (!is_valid_phone($whatsapp)) {
        $errors[] = 'Некорректный формат номера WhatsApp';
    }
    
    if (empty($telegram)) {
        $errors[] = 'Telegram обязателен для заполнения';
    }
    
    if (empty($email)) {
        $errors[] = 'Email обязателен для заполнения';
    } elseif (!is_valid_email($email)) {
        $errors[] = 'Некорректный формат email';
    }
    
    if (empty($recaptcha_response)) {
        $errors[] = 'Пожалуйста, подтвердите, что вы не робот';
    }
    
    // Проверка reCAPTCHA (опционально, если настроен секретный ключ)
    // ПРИМЕЧАНИЕ: Публичный ключ (Site Key) = 6Lf7GforAAAAAGG6IAQqsIXF2GFMTu6htVvqLWuW (используется в HTML)
    // Секретный ключ (Secret Key) нужно получить в панели Google reCAPTCHA: https://www.google.com/recaptcha/admin/
    // Найди сайт с публичным ключом 6Lf7GforAAAAAGG6IAQqsIXF2GFMTu6htVvqLWuW и скопируй Secret Key оттуда
    $recaptcha_secret = "YOUR_RECAPTCHA_SECRET_KEY"; // ВСТАВЬТЕ СЮДА СЕКРЕТНЫЙ КЛЮЧ reCAPTCHA
    if (!empty($recaptcha_response) && $recaptcha_secret !== "YOUR_RECAPTCHA_SECRET_KEY") {
        $recaptcha_url = "https://www.google.com/recaptcha/api/siteverify";
        
        $recaptcha_data = [
            'secret' => $recaptcha_secret,
            'response' => $recaptcha_response,
            'remoteip' => $_SERVER['REMOTE_ADDR']
        ];
        
        $options = [
            'http' => [
                'header' => "Content-type: application/x-www-form-urlencoded\r\n",
                'method' => 'POST',
                'content' => http_build_query($recaptcha_data)
            ]
        ];
        
        $context = stream_context_create($options);
        $recaptcha_result = @file_get_contents($recaptcha_url, false, $context);
        $recaptcha_json = json_decode($recaptcha_result, true);
        
        if (!$recaptcha_json || !isset($recaptcha_json['success']) || !$recaptcha_json['success']) {
            $errors[] = 'Ошибка проверки reCAPTCHA';
        }
    }
    
    // Если есть ошибки, возвращаем их
    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Ошибки валидации',
            'errors' => $errors
        ]);
        exit;
    }
    
    // Формирование темы письма
    $subject = "Новый запрос на предложение - $site_name";
    
    // Формирование тела письма
    $message_body = "Новый запрос на предложение\n\n";
    $message_body .= "=== Контактная информация ===\n";
    $message_body .= "Фамилия: $lastName\n";
    $message_body .= "Имя: $firstName\n";
    $message_body .= "Email: $email\n";
    $message_body .= "WhatsApp: $whatsapp\n";
    $message_body .= "Telegram: $telegram\n\n";
    $message_body .= "=== Информация о заказе ===\n";
    $message_body .= "Модель дома: $houseModel\n";
    $message_body .= "Страна доставки: $deliveryCountry\n\n";
    $message_body .= "---\n";
    $message_body .= "Дата отправки: " . date('Y-m-d H:i:s') . "\n";
    $message_body .= "IP адрес: " . $_SERVER['REMOTE_ADDR'] . "\n";
    
    // Формирование HTML версии письма
    $html_message = "<html><body>";
    $html_message .= "<h2>Новый запрос на предложение</h2>";
    $html_message .= "<h3>Контактная информация</h3>";
    $html_message .= "<p><strong>Фамилия:</strong> " . htmlspecialchars($lastName) . "</p>";
    $html_message .= "<p><strong>Имя:</strong> " . htmlspecialchars($firstName) . "</p>";
    $html_message .= "<p><strong>Email:</strong> " . htmlspecialchars($email) . "</p>";
    $html_message .= "<p><strong>WhatsApp:</strong> " . htmlspecialchars($whatsapp) . "</p>";
    $html_message .= "<p><strong>Telegram:</strong> " . htmlspecialchars($telegram) . "</p>";
    $html_message .= "<h3>Информация о заказе</h3>";
    $html_message .= "<p><strong>Модель дома:</strong> " . htmlspecialchars($houseModel) . "</p>";
    $html_message .= "<p><strong>Страна доставки:</strong> " . htmlspecialchars($deliveryCountry) . "</p>";
    $html_message .= "<hr>";
    $html_message .= "<p><small>Дата отправки: " . date('Y-m-d H:i:s') . "<br>";
    $html_message .= "IP адрес: " . $_SERVER['REMOTE_ADDR'] . "</small></p>";
    $html_message .= "</body></html>";
    
    // Настройка заголовков
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: $site_name <noreply@" . $_SERVER['HTTP_HOST'] . ">\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    
    // Логируем заявку в файл (даже если mail() не работает)
    if ($log_requests) {
        log_request('contact', [
            'lastName' => $lastName,
            'firstName' => $firstName,
            'email' => $email,
            'whatsapp' => $whatsapp,
            'telegram' => $telegram,
            'houseModel' => $houseModel,
            'deliveryCountry' => $deliveryCountry
        ], $log_file);
    }
    
    // Отправка письма
    $mail_sent = send_email($recipient_email, $subject, $html_message, $headers);
    
    if ($mail_sent) {
        echo json_encode([
            'success' => true,
            'message' => 'Ваш запрос успешно отправлен! Мы свяжемся с вами в ближайшее время.'
        ]);
    } else {
        // Даже если mail() не работает, данные сохранены в файл
        echo json_encode([
            'success' => true,
            'message' => 'Запрос получен! (Письмо может быть не отправлено, но данные сохранены в файл requests.log)'
        ]);
    }
    
} elseif ($form_type === 'quote') {
    // Обработка модального окна "Запросить расчет стоимости"
    
    // Получение и очистка данных
    $name = isset($_POST['name']) ? clean_input($_POST['name']) : '';
    $email = isset($_POST['email']) ? clean_input($_POST['email']) : '';
    $phone = isset($_POST['phone']) ? clean_input($_POST['phone']) : '';
    $message = isset($_POST['message']) ? clean_input($_POST['message']) : '';
    $recaptcha_response = isset($_POST['g-recaptcha-response']) ? $_POST['g-recaptcha-response'] : '';
    
    // Валидация обязательных полей
    $errors = [];
    
    if (empty($name)) {
        $errors[] = 'Имя обязательно для заполнения';
    }
    
    if (empty($email)) {
        $errors[] = 'Email обязателен для заполнения';
    } elseif (!is_valid_email($email)) {
        $errors[] = 'Некорректный формат email: ' . $email;
    }
    
    if (empty($phone)) {
        $errors[] = 'Телефон обязателен для заполнения';
    } else {
        // Отладка: показываем, что пришло и что осталось после очистки
        $cleaned_phone = preg_replace('/[\s\-\(\)\.]/', '', $phone);
        if (!is_valid_phone($phone)) {
            $errors[] = 'Некорректный формат телефона. Введено: "' . $phone . '", очищено: "' . $cleaned_phone . '". Введите номер в формате +7XXXXXXXXXX или любом другом международном формате (минимум 7 цифр)';
        }
    }
    
    if (empty($recaptcha_response)) {
        $errors[] = 'Пожалуйста, подтвердите, что вы не робот';
    }
    
    // Проверка reCAPTCHA (опционально, если настроен секретный ключ)
    // ПРИМЕЧАНИЕ: Публичный ключ (Site Key) = 6Lf7GforAAAAAGG6IAQqsIXF2GFMTu6htVvqLWuW (используется в HTML)
    // Секретный ключ (Secret Key) нужно получить в панели Google reCAPTCHA: https://www.google.com/recaptcha/admin/
    // Найди сайт с публичным ключом 6Lf7GforAAAAAGG6IAQqsIXF2GFMTu6htVvqLWuW и скопируй Secret Key оттуда
    $recaptcha_secret = "YOUR_RECAPTCHA_SECRET_KEY"; // ВСТАВЬТЕ СЮДА СЕКРЕТНЫЙ КЛЮЧ reCAPTCHA
    if (!empty($recaptcha_response) && $recaptcha_secret !== "YOUR_RECAPTCHA_SECRET_KEY") {
        $recaptcha_url = "https://www.google.com/recaptcha/api/siteverify";
        
        $recaptcha_data = [
            'secret' => $recaptcha_secret,
            'response' => $recaptcha_response,
            'remoteip' => $_SERVER['REMOTE_ADDR']
        ];
        
        $options = [
            'http' => [
                'header' => "Content-type: application/x-www-form-urlencoded\r\n",
                'method' => 'POST',
                'content' => http_build_query($recaptcha_data)
            ]
        ];
        
        $context = stream_context_create($options);
        $recaptcha_result = @file_get_contents($recaptcha_url, false, $context);
        $recaptcha_json = json_decode($recaptcha_result, true);
        
        if (!$recaptcha_json || !isset($recaptcha_json['success']) || !$recaptcha_json['success']) {
            $errors[] = 'Ошибка проверки reCAPTCHA';
        }
    }
    
    // Если есть ошибки, возвращаем их
    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Ошибки валидации',
            'errors' => $errors
        ]);
        exit;
    }
    
    // Формирование темы письма
    $subject = "Запрос на расчет стоимости - $site_name";
    
    // Формирование тела письма
    $message_body = "Запрос на расчет стоимости\n\n";
    $message_body .= "=== Контактная информация ===\n";
    $message_body .= "Имя: $name\n";
    $message_body .= "Email: $email\n";
    $message_body .= "Телефон: $phone\n\n";
    
    if (!empty($message)) {
        $message_body .= "=== Сообщение ===\n";
        $message_body .= "$message\n\n";
    }
    
    $message_body .= "---\n";
    $message_body .= "Дата отправки: " . date('Y-m-d H:i:s') . "\n";
    $message_body .= "IP адрес: " . $_SERVER['REMOTE_ADDR'] . "\n";
    
    // Формирование HTML версии письма
    $html_message = "<html><body>";
    $html_message .= "<h2>Запрос на расчет стоимости</h2>";
    $html_message .= "<h3>Контактная информация</h3>";
    $html_message .= "<p><strong>Имя:</strong> " . htmlspecialchars($name) . "</p>";
    $html_message .= "<p><strong>Email:</strong> " . htmlspecialchars($email) . "</p>";
    $html_message .= "<p><strong>Телефон:</strong> " . htmlspecialchars($phone) . "</p>";
    
    if (!empty($message)) {
        $html_message .= "<h3>Сообщение</h3>";
        $html_message .= "<p>" . nl2br(htmlspecialchars($message)) . "</p>";
    }
    
    $html_message .= "<hr>";
    $html_message .= "<p><small>Дата отправки: " . date('Y-m-d H:i:s') . "<br>";
    $html_message .= "IP адрес: " . $_SERVER['REMOTE_ADDR'] . "</small></p>";
    $html_message .= "</body></html>";
    
    // Настройка заголовков
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: $site_name <noreply@" . $_SERVER['HTTP_HOST'] . ">\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    
    // Логируем заявку в файл (даже если mail() не работает)
    if ($log_requests) {
        log_request('quote', [
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'message' => $message
        ], $log_file);
    }
    
    // Отправка письма
    $mail_sent = send_email($recipient_email, $subject, $html_message, $headers);
    
    if ($mail_sent) {
        echo json_encode([
            'success' => true,
            'message' => 'Ваш запрос успешно отправлен! Мы свяжемся с вами в ближайшее время.'
        ]);
    } else {
        // Даже если mail() не работает, данные сохранены в файл
        echo json_encode([
            'success' => true,
            'message' => 'Запрос получен! (Письмо может быть не отправлено, но данные сохранены в файл requests.log)'
        ]);
    }
    
} else {
    return_error('Неверный тип формы', [], 400);
}

} catch (Exception $e) {
    // Перехватываем все исключения и возвращаем JSON ошибку
    error_log("PHP Exception: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine());
    return_error('Внутренняя ошибка сервера: ' . $e->getMessage(), [], 500);
} catch (Error $e) {
    // Перехватываем PHP ошибки (Parse errors, etc)
    error_log("PHP Error: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine());
    return_error('Ошибка выполнения: ' . $e->getMessage(), [], 500);
}

