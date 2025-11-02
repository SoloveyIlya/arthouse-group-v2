<?php
/**
 * Скрипт для отправки заявок в Telegram бот
 * Обрабатывает две формы:
 * 1. Форма контактов "Запросить предложение"
 * 2. Модальное окно "Запросить расчет стоимости"
 */

// Настройка часового пояса
date_default_timezone_set('Europe/Minsk'); // Установите нужный часовой пояс

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

// Настройки Telegram бота
$telegram_bot_token = "8575062080:AAFvL4QynoQx8d_-iCyFLwLmYN2fVnwnueE"; // Токен бота
// ВНИМАНИЕ: Нужно указать chat_id группы или канала, куда будут отправляться заявки
// Чтобы получить chat_id:
// 1. Добавьте бота в группу/канал
// 2. Отправьте сообщение в группу/канал
// 3. Перейдите по ссылке: https://api.telegram.org/bot{TOKEN}/getUpdates
// 4. Найдите "chat":{"id":XXXXX} в ответе - это и есть chat_id
// Пример: -1001234567890 (для группы) или 123456789 (для личного чата)
// Можно указать несколько chat_id - сообщения будут отправлены во все указанные чаты
$telegram_chat_ids = [
    "6142958528", // Получатель заявок
    // Добавьте еще chat_id через запятую, если нужно больше получателей
];

// Включить логирование заявок в файл
$log_requests = true; // Установите false, чтобы отключить логирование
$log_file = __DIR__ . '/requests.log'; // Файл для сохранения заявок

// Автоматическое определение названия сайта в зависимости от окружения
$host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'localhost';
$local_hosts = array('127.0.0.1', 'localhost', '127.0.0.1:5500', 'localhost:5500');
$is_local = in_array($host, $local_hosts) || 
            strpos($host, '127.0.0.1') !== false || 
            strpos($host, 'localhost') !== false;

// Название сайта
$site_name = $is_local ? "art-house.world (Local Test)" : "art-house.world";

// Настройки CORS заголовков (должны быть установлены ДО любых других заголовков)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS, GET');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Access-Control-Max-Age: 86400'); // 24 часа

// Обработка OPTIONS запроса (CORS preflight)
$request_method = $_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN';
if ($request_method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Тест для диагностики - отвечаем на GET запрос информацией о файле
if ($request_method === 'GET' && isset($_GET['test'])) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => true,
        'message' => 'PHP файл работает!',
        'method' => $request_method,
        'post_data' => $_POST,
        'server' => [
            'REQUEST_METHOD' => $_SERVER['REQUEST_METHOD'] ?? 'N/A',
            'REQUEST_URI' => $_SERVER['REQUEST_URI'] ?? 'N/A',
            'CONTENT_TYPE' => $_SERVER['CONTENT_TYPE'] ?? 'N/A',
        ]
    ]);
    exit;
}

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
    try {
        $log_entry = "\n" . str_repeat("=", 80) . "\n";
        $log_entry .= "ДАТА: " . date('Y-m-d H:i:s') . "\n";
        $log_entry .= "ТИП ФОРМЫ: " . $form_type . "\n";
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

// Функция для отправки сообщения в Telegram (один чат)
function send_telegram_message($bot_token, $chat_id, $message) {
    if (empty($chat_id)) {
        error_log("Telegram: chat_id не указан");
        return false;
    }
    
    $url = "https://api.telegram.org/bot{$bot_token}/sendMessage";
    
    $data = [
        'chat_id' => $chat_id,
        'text' => $message,
        'parse_mode' => 'HTML' // Используем HTML для форматирования
    ];
    
    $options = [
        'http' => [
            'header' => "Content-type: application/x-www-form-urlencoded\r\n",
            'method' => 'POST',
            'content' => http_build_query($data)
        ]
    ];
    
    $context = stream_context_create($options);
    $result = @file_get_contents($url, false, $context);
    
    if ($result === false) {
        error_log("Telegram: ошибка отправки сообщения в chat_id: " . $chat_id);
        return false;
    }
    
    $response = json_decode($result, true);
    
    if (isset($response['ok']) && $response['ok'] === true) {
        return true;
    } else {
        $error_msg = isset($response['description']) ? $response['description'] : 'Unknown error';
        error_log("Telegram API error для chat_id {$chat_id}: " . $error_msg);
        return false;
    }
}

// Функция для отправки сообщения в несколько Telegram чатов
function send_telegram_messages($bot_token, $chat_ids, $message) {
    if (empty($chat_ids) || !is_array($chat_ids)) {
        error_log("Telegram: chat_ids не указаны или не является массивом");
        return false;
    }
    
    $success_count = 0;
    $failed_count = 0;
    
    foreach ($chat_ids as $chat_id) {
        // Пропускаем пустые значения
        if (empty($chat_id) || trim($chat_id) === '') {
            continue;
        }
        
        if (send_telegram_message($bot_token, trim($chat_id), $message)) {
            $success_count++;
        } else {
            $failed_count++;
        }
    }
    
    // Возвращаем true, если хотя бы одно сообщение отправлено успешно
    return $success_count > 0;
}

// Проверка метода запроса
// $request_method уже объявлен выше

// Диагностика для отладки
if ($request_method !== 'POST' && $request_method !== 'OPTIONS') {
    // Логируем информацию о запросе
    error_log("Request method: " . $request_method);
    error_log("Request URI: " . ($_SERVER['REQUEST_URI'] ?? 'N/A'));
    error_log("Content-Type: " . ($_SERVER['CONTENT_TYPE'] ?? 'N/A'));
    return_error('Метод не разрешен. Получен: ' . $request_method . ', ожидается: POST', [], 405);
}

// Для обработки FormData может понадобиться чтение из php://input
// Если $_POST пуст, но есть multipart/form-data, PHP должен автоматически парсить
// Но иногда нужно подождать или данные могут приходить позже

// Логирование для диагностики
if ($request_method === 'POST') {
    error_log("POST request received");
    error_log("POST data: " . print_r($_POST, true));
    error_log("Content-Type: " . ($_SERVER['CONTENT_TYPE'] ?? 'N/A'));
    error_log("Content-Length: " . ($_SERVER['CONTENT_LENGTH'] ?? 'N/A'));
}

// Получение типа формы
$form_type = isset($_POST['form_type']) ? clean_input($_POST['form_type']) : '';

// Если form_type не найден в POST, попробуем GET (для отладки)
if (empty($form_type) && isset($_GET['form_type'])) {
    $form_type = clean_input($_GET['form_type']);
}

// Если form_type все еще пуст, это ошибка
if (empty($form_type) && $request_method === 'POST') {
    error_log("Form type not found. POST keys: " . implode(', ', array_keys($_POST)));
    return_error('Тип формы не указан. Убедитесь, что форма содержит поле form_type.', [], 400);
}

// Защита от двойной отправки - проверяем по IP, времени и данным
// Упрощаем: проверяем только очень похожие запросы (в течение 5 секунд)
$request_id = md5($_SERVER['REMOTE_ADDR'] . date('Y-m-d H:i:s') . serialize(array_intersect_key($_POST, array_flip(['form_type', 'lastName', 'firstName', 'name', 'email']))));
$lock_file = sys_get_temp_dir() . '/telegram_send_' . $request_id . '.lock';

// Проверяем, не был ли уже обработан этот запрос
if (file_exists($lock_file)) {
    // Если файл блокировки существует и был создан менее 5 секунд назад, игнорируем запрос
    $lock_time = filemtime($lock_file);
    if ((time() - $lock_time) < 5) {
        error_log("Дубликат запроса обнаружен, игнорируем: " . $request_id);
        // Возвращаем успешный ответ, но не отправляем сообщение
        echo json_encode([
            'success' => true,
            'message' => 'Запрос уже обработан'
        ]);
        exit;
    } else {
        // Файл блокировки старый, удаляем его
        @unlink($lock_file);
    }
}

// Создаем файл блокировки
@file_put_contents($lock_file, time());

// Удаляем файл блокировки после выполнения
register_shutdown_function(function() use ($lock_file) {
    // Удаляем через небольшую задержку, чтобы точно не пропустить дубликат
    if (file_exists($lock_file)) {
        @unlink($lock_file);
    }
});

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
    
    // Проверка reCAPTCHA
    // Выбор ключа в зависимости от окружения
    // Тестовые ключи Google (для localhost) - всегда проходят проверку
    $test_secret = "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe";
    // Рабочие ключи (для продакшена)
    $prod_secret = "6LczLv4rAAAAAAMYl3Pb3G5qUH9li35b685Be9nx";
    
    // Используем тестовый ключ для localhost, рабочий для продакшена
    $recaptcha_secret = $is_local ? $test_secret : $prod_secret;
    if (!empty($recaptcha_response)) {
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
    
    // Формирование сообщения для Telegram
    $telegram_message = "<b>🔔 Новая заявка на предложение</b>\n\n";
    $telegram_message .= "<b>👤 Контактная информация:</b>\n";
    $telegram_message .= "Фамилия: " . htmlspecialchars($lastName, ENT_QUOTES, 'UTF-8') . "\n";
    $telegram_message .= "Имя: " . htmlspecialchars($firstName, ENT_QUOTES, 'UTF-8') . "\n";
    $telegram_message .= "Email: " . htmlspecialchars($email, ENT_QUOTES, 'UTF-8') . "\n";
    $telegram_message .= "WhatsApp: " . htmlspecialchars($whatsapp, ENT_QUOTES, 'UTF-8') . "\n";
    $telegram_message .= "Telegram: " . htmlspecialchars($telegram, ENT_QUOTES, 'UTF-8') . "\n\n";
    $telegram_message .= "<b>📦 Информация о заказе:</b>\n";
    $telegram_message .= "Модель дома: " . htmlspecialchars($houseModel, ENT_QUOTES, 'UTF-8') . "\n";
    $telegram_message .= "Страна доставки: " . htmlspecialchars($deliveryCountry, ENT_QUOTES, 'UTF-8') . "\n\n";
    $telegram_message .= "---\n";
    $telegram_message .= "📅 Дата: " . date('d.m.Y H:i') . "\n";
    $telegram_message .= "🌐 IP: " . $_SERVER['REMOTE_ADDR'] . "\n";
    
    // Логируем заявку в файл
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
    
    // Отправка сообщения в Telegram (во все указанные чаты)
    $telegram_sent = send_telegram_messages($telegram_bot_token, $telegram_chat_ids, $telegram_message);
    
    if ($telegram_sent) {
        echo json_encode([
            'success' => true,
            'message' => 'Ваш запрос успешно отправлен! Мы свяжемся с вами в ближайшее время.'
        ]);
    } else {
        // Даже если Telegram не отправился, данные сохранены в файл
        echo json_encode([
            'success' => true,
            'message' => 'Запрос получен! (Сообщение может быть не отправлено в Telegram, но данные сохранены в файл requests.log)'
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
    
    // Проверка reCAPTCHA
    // Выбор ключа в зависимости от окружения
    // Тестовые ключи Google (для localhost) - всегда проходят проверку
    $test_secret = "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe";
    // Рабочие ключи (для продакшена)
    $prod_secret = "6LczLv4rAAAAAAMYl3Pb3G5qUH9li35b685Be9nx";
    
    // Используем тестовый ключ для localhost, рабочий для продакшена
    $recaptcha_secret = $is_local ? $test_secret : $prod_secret;
    if (!empty($recaptcha_response)) {
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
    
    // Формирование сообщения для Telegram
    $telegram_message = "<b>💰 Запрос на расчет стоимости</b>\n\n";
    $telegram_message .= "<b>👤 Контактная информация:</b>\n";
    $telegram_message .= "Имя: " . htmlspecialchars($name, ENT_QUOTES, 'UTF-8') . "\n";
    $telegram_message .= "Email: " . htmlspecialchars($email, ENT_QUOTES, 'UTF-8') . "\n";
    $telegram_message .= "Телефон: " . htmlspecialchars($phone, ENT_QUOTES, 'UTF-8') . "\n";
    
    if (!empty($message)) {
        $telegram_message .= "\n<b>💬 Сообщение:</b>\n";
        $telegram_message .= htmlspecialchars($message, ENT_QUOTES, 'UTF-8') . "\n";
    }
    
    $telegram_message .= "\n---\n";
    $telegram_message .= "📅 Дата: " . date('d.m.Y H:i') . "\n";
    $telegram_message .= "🌐 IP: " . $_SERVER['REMOTE_ADDR'] . "\n";
    
    // Логируем заявку в файл
    if ($log_requests) {
        log_request('quote', [
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'message' => $message
        ], $log_file);
    }
    
    // Отправка сообщения в Telegram (во все указанные чаты)
    $telegram_sent = send_telegram_messages($telegram_bot_token, $telegram_chat_ids, $telegram_message);
    
    if ($telegram_sent) {
        echo json_encode([
            'success' => true,
            'message' => 'Ваш запрос успешно отправлен! Мы свяжемся с вами в ближайшее время.'
        ]);
    } else {
        // Даже если Telegram не отправился, данные сохранены в файл
        echo json_encode([
            'success' => true,
            'message' => 'Запрос получен! (Сообщение может быть не отправлено в Telegram, но данные сохранены в файл requests.log)'
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

