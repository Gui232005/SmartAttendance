#define TRIG 4
#define ECHO 5

const int N=5; float buf[N]; int iBuf=0; int filled=0;
float media(float v){ buf[iBuf]=v; iBuf=(iBuf+1)%N; if(filled<N) filled++; float s=0; for(int i=0;i<filled;i++) s+=buf[i]; return s/filled; }

void setup(){
  Serial.begin(115200);
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  Serial.println("Ultrassons pronto");
}

void loop(){
  digitalWrite(TRIG, LOW); delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);

  long dur = pulseIn(ECHO, HIGH, 25000);
  if(dur==0){ Serial.println("timeout"); delay(200); return; }

  float dist = dur/58.0;
  dist = media(dist);
  Serial.print("dist_cm="); Serial.println(dist, 1);
  delay(200);
}
