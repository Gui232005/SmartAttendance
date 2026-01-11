#!/usr/bin/env python3
import RPi.GPIO as GPIO
import time
import math
import threading

from interface import interface, change_interface_message
from read import run_face_capture   # função em read.py

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

# ==========================================
#  PINOS (BCM)
# ==========================================

MOTOR_PINS = [17, 18, 27, 22]   # IN1, IN2, IN3, IN4
TRIG_PIN = 23
ECHO_PIN = 24

for pin in MOTOR_PINS:
    GPIO.setup(pin, GPIO.OUT)
    GPIO.output(pin, 0)

GPIO.setup(TRIG_PIN, GPIO.OUT)
GPIO.setup(ECHO_PIN, GPIO.IN)

# ==========================
#  MOTOR / MECÂNICA
# ==========================
STEPS_PER_REV = 4096
TEST_RPM      = 5.0

SPEED_SPS = (TEST_RPM * STEPS_PER_REV) / 60.0
MAX_SPS   = SPEED_SPS

PITCH_MM_PER_REV = 8.0

def mm_to_steps(mm: float) -> int:
    return int(round((mm / PITCH_MM_PER_REV) * STEPS_PER_REV))

def steps_to_mm(steps: int) -> float:
    return (steps / float(STEPS_PER_REV)) * PITCH_MM_PER_REV

STEP_SEQ = [
    (1, 0, 0, 0),
    (1, 1, 0, 0),
    (0, 1, 0, 0),
    (0, 1, 1, 0),
    (0, 0, 1, 0),
    (0, 0, 1, 1),
    (0, 0, 0, 1),
    (1, 0, 0, 1),
]

class StepperMotor:
    def __init__(self, pins, max_speed_sps):
        self.pins = pins
        self.seq_idx = 0
        self.position_steps = 0
        self.speed_sps = 0.0
        self.max_speed_sps = max_speed_sps
        self.last_step_time = time.time()
        self._apply_step((0, 0, 0, 0))

    def _apply_step(self, pattern=None):
        if pattern is None:
            pattern = STEP_SEQ[self.seq_idx]
        for pin, val in zip(self.pins, pattern):
            GPIO.output(pin, val)

    def set_speed(self, speed_sps: float):
        if speed_sps > self.max_speed_sps:
            speed_sps = self.max_speed_sps
        elif speed_sps < -self.max_speed_sps:
            speed_sps = -self.max_speed_sps
        self.speed_sps = speed_sps

    def run_speed(self):
        if self.speed_sps == 0.0:
            return
        now = time.time()
        step_interval = 1.0 / abs(self.speed_sps)
        if (now - self.last_step_time) >= step_interval:
            direction = 1 if self.speed_sps > 0 else -1
            self.seq_idx = (self.seq_idx + direction) % len(STEP_SEQ)
            self._apply_step()
            self.position_steps += direction
            self.last_step_time = now

    def release(self):
        self._apply_step((0, 0, 0, 0))


# ================================
#  HC-SR04 - ULTRASSÓNICO
# ================================
PULSE_TIMEOUT = 0.03
MIN_VALID_MM  = 50.0
MAX_VALID_MM  = 800.0

def read_ultrasonic_once_mm():
    GPIO.output(TRIG_PIN, 0)
    time.sleep(0.000002)
    GPIO.output(TRIG_PIN, 1)
    time.sleep(0.000010)
    GPIO.output(TRIG_PIN, 0)

    start = time.time()
    timeout = start + PULSE_TIMEOUT
    while GPIO.input(ECHO_PIN) == 0 and time.time() < timeout:
        start = time.time()
    if time.time() >= timeout:
        return float('nan')

    stop = time.time()
    timeout = stop + PULSE_TIMEOUT
    while GPIO.input(ECHO_PIN) == 1 and time.time() < timeout:
        stop = time.time()
    if time.time() >= timeout:
        return float('nan')

    pulse = stop - start
    dist_mm = (pulse * 343.0 / 2.0) * 1000.0
    return dist_mm

def read_ultrasonic_avg_mm():
    soma = 0.0
    valid = 0
    for _ in range(5):
        d = read_ultrasonic_once_mm()
        if (not math.isnan(d)) and (MIN_VALID_MM <= d <= MAX_VALID_MM):
            soma += d
            valid += 1
        time.sleep(0.020)
    if valid == 0:
        print("[MOTOR] Nenhuma leitura válida (avg)")
        return float('nan')
    return soma / valid


# ================================
#  GEOMETRIA / ALTURAS
# ================================
CEILING_MM     = 2000.0
CAM_MIN_MM     = 1400.0
CAM_MAX_MM     = 2000.0
EYE_OFFSET_MM  = 80.0
DEADBAND_MM    = 10.0
STANDBY_MM     = 1700.0

MIN_PESSOA_MM  = 1400.0
MAX_PESSOA_MM  = 1900.0

MEASURE_INTERVAL_S = 5.0
RECON_DELAY_S = 5.0   # delay entre reconhecimentos (segundos)


def test_motor_5s_each_side(motor: StepperMotor):
    print("\n=== TESTE DE MOTOR: 5s DIREITA, 5s ESQUERDA ===")
    motor.set_speed(SPEED_SPS)
    start = time.time()
    while time.time() - start < 5.0:
        motor.run_speed()
    time.sleep(0.5)
    print("Agora ESQUERDA 5s")
    motor.set_speed(-SPEED_SPS)
    start = time.time()
    while time.time() - start < 5.0:
        motor.run_speed()
    motor.set_speed(0.0)
    print("=== FIM TESTE MOTOR ===\n")


def motor_loop():
    motor = StepperMotor(MOTOR_PINS, MAX_SPS)
    motor.position_steps = mm_to_steps(STANDBY_MM)
    print(f"[MOTOR] Posição inicial assumida: {STANDBY_MM} mm")

    test_motor_5s_each_side(motor)
    print("[MOTOR] Modo automático iniciado… (CTRL+C para parar)")

    last_measure = 0.0
    recon_done = False
    recon_done_time = 0.0

    try:
        while True:
            motor.run_speed()
            now = time.time()

            # Se já passou o delay, volta a permitir novo reconhecimento
            if recon_done and (now - recon_done_time >= RECON_DELAY_S):
                recon_done = False
                change_interface_message("Pronto para o próximo utilizador.", "black")
                print("[MOTOR] Delay após reconhecimento concluído. Sistema pronto para nova pessoa.")

            if (now - last_measure) < MEASURE_INTERVAL_S:
                continue

            last_measure = now
            dist = read_ultrasonic_avg_mm()

            if math.isnan(dist):
                motor.set_speed(0.0)
                change_interface_message("Sem pessoa detetada. Aguardando utilizador...", "black")
                continue

            altura_pessoa_mm = CEILING_MM - dist

            if altura_pessoa_mm < MIN_PESSOA_MM or altura_pessoa_mm > MAX_PESSOA_MM:
                motor.set_speed(0.0)
                print("[MOTOR] Altura fora do intervalo [1.40m, 1.90m]: "
                      f"{altura_pessoa_mm / 1000.0:.3f} m -> ignorar.")
                change_interface_message("Utilizador fora da altura válida.", "red")
                continue

            altura_olhos_mm = altura_pessoa_mm - EYE_OFFSET_MM
            altura_cam_mm = steps_to_mm(motor.position_steps)
            delta_cam_mm = altura_olhos_mm - altura_cam_mm

            print("\n--- MEDIÇÃO ---")
            print(f"Distância média (sensor -> topo da cabeça): {dist:.2f} mm")
            print(f"Altura estimada da pessoa: {altura_pessoa_mm / 1000.0:.3f} m")
            print(f"Altura alvo (olhos): {altura_olhos_mm:.2f} mm")
            print(f"Altura atual da câmara: {altura_cam_mm:.2f} mm")
            print(f"Δ câmara até objetivo (olhos): {delta_cam_mm:.2f} mm")

            if abs(delta_cam_mm) <= DEADBAND_MM:
                motor.set_speed(0.0)
                print("[MOTOR] Câmara alinhada com os olhos (zona morta) → PARADO.")
                change_interface_message("Câmara alinhada. A iniciar reconhecimento...", "orange")

                if not recon_done:
                    try:
                        success = run_face_capture()   # agora devolve True/False
                        if success:
                            recon_done = True
                            recon_done_time = time.time()
                            change_interface_message("Reconhecimento concluído. Aguarde 5 segundos...", "green")
                            print("[MOTOR] Reconhecimento concluído. A aguardar delay para próxima pessoa.")
                        else:
                            # Timeout ou falha controlada
                            recon_done = False
                            change_interface_message("Não foi possível reconhecer. Volte a posicionar-se.", "red")
                            print("[MOTOR] Reconhecimento não concluído (timeout/erro). Sistema continua à espera.")
                    except Exception as e:
                        print(f"[MOTOR][ERRO] Falha inesperada no reconhecimento facial: {e}")
                        recon_done = False
                        change_interface_message("Erro no reconhecimento facial.", "red")
                else:
                    print("[MOTOR] Reconhecimento já realizado recentemente. A aguardar delay...")
            elif delta_cam_mm > 0:
                motor.set_speed(SPEED_SPS)
                print("[MOTOR] Câmara ABAIXO dos olhos → a SUBIR.")
                change_interface_message("A ajustar altura (a subir)...", "black")
            else:
                motor.set_speed(-SPEED_SPS)
                print("[MOTOR] Câmara ACIMA dos olhos → a DESCER.")
                change_interface_message("A ajustar altura (a descer)...", "black")

    except KeyboardInterrupt:
        print("\n[MOTOR] FINALIZADO (CTRL+C)")

    finally:
        motor.set_speed(0.0)
        motor.release()
        for pin in MOTOR_PINS:
            GPIO.output(pin, 0)
        GPIO.cleanup()
        print("[MOTOR] GPIO limpo. Saída segura.")


if __name__ == "__main__":
    t = threading.Thread(target=motor_loop, daemon=True)
    t.start()
    interface("A iniciar sistema de presença inteligente...", "black")
