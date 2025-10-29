#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "SSID";
const char* pass = "PASS";
const char* server = "http://IP_DO_PC:3001/api/eventos"; // ex: http://192.168.1.50:3001/api/eventos

uint32_t lastMs = 0;
const uint32_t periodMs = 10000;

void setup(){
  Serial.begin(115200);
  WiFi.begin(ssid, pass);
  Serial.print("A ligar ao WiFi");
  while(WiFi.status()!=WL_CONNECTED){ delay(500); Serial.print("."); }
  Serial.printf("\nWiFi OK  IP:%s\n", WiFi.localIP().toString().c_str());
}

void loop(){
  if (millis() - lastMs >= periodMs){
    lastMs = millis();
    if(WiFi.status()==WL_CONNECTED){
      HTTPClient http;
      http.begin(server);
      http.addHeader("Content-Type","application/json");

      // alterna tipo para ver entradas/saídas
      static bool flag=false; flag=!flag;
      String body = String("{\"funcionario_id\":1,")
                  + "\"tipo\":\"" + (flag ? "entrada" : "saida") + "\","
                  + "\"conf\":0.91,"
                  + "\"origem\":\"esp32-dev\"}";

      int code = http.POST(body);
      String resp = http.getString();
      Serial.printf("[POST] code=%d resp=%s\n", code, resp.c_str());
      http.end();
    } else {
      Serial.println("WiFi OFF");
    }
  }
}
