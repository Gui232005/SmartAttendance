#include <WiFi.h>
#include <HTTPClient.h>

#define USE_CAMERA 0  // <<--- quando tiveres a câmara, muda para 1

#if USE_CAMERA
  #include "esp_camera.h"
  // Pines AI Thinker
  #define PWDN_GPIO_NUM     32
  #define RESET_GPIO_NUM    -1
  #define XCLK_GPIO_NUM      0
  #define SIOD_GPIO_NUM     26
  #define SIOC_GPIO_NUM     27
  #define Y9_GPIO_NUM       35
  #define Y8_GPIO_NUM       34
  #define Y7_GPIO_NUM       39
  #define Y6_GPIO_NUM       36
  #define Y5_GPIO_NUM       21
  #define Y4_GPIO_NUM       19
  #define Y3_GPIO_NUM       18
  #define Y2_GPIO_NUM        5
  #define VSYNC_GPIO_NUM    25
  #define HREF_GPIO_NUM     23
  #define PCLK_GPIO_NUM     22
#endif

const char* ssid = "SSID";
const char* pass = "PASS";
const char* server = "http://IP_DO_PC:3001/api/eventos";

void setup(){
  Serial.begin(115200);
  WiFi.begin(ssid, pass);
  Serial.print("WiFi...");
  while(WiFi.status()!=WL_CONNECTED){ delay(500); Serial.print("."); }
  Serial.printf("\nOK IP:%s\n", WiFi.localIP().toString().c_str());

#if USE_CAMERA
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;   config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;   config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;   config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;   config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM; config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM; config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM; config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM; config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size = FRAMESIZE_QVGA;
  config.jpeg_quality = 12; // 10-20
  config.fb_count = 1;

  if (esp_camera_init(&config) != ESP_OK) {
    Serial.println("ERRO: camera init");
  } else {
    Serial.println("Camera OK");
  }
#endif
}

void loop(){
  // Para já simulamos sempre um evento
  if(WiFi.status()==WL_CONNECTED){
    HTTPClient http; http.begin(server);
    http.addHeader("Content-Type","application/json");
    // mais tarde podes acrescentar mini-thumbnail base64 num campo "thumb"
    String body = "{\"funcionario_id\":1,\"tipo\":\"entrada\",\"conf\":0.92,\"origem\":\"esp32-cam\"}";
    int code = http.POST(body);
    Serial.printf("HTTP %d\n", code);
    http.end();
  }
  delay(10000);
}
