#Here we will display when it's accepted
from tkinter import *

from joblib import delayed


def register_acceptance(username):
    root = Tk()

    root.title("Smart Attendance")

    root.attributes('-fullscreen', True)
    root.title("Smart Attendance")

    label = Label(root, text=f"Registo do {username} realizado com sucesso", font=("Helvetica", 48))
    label.pack(expand=True)
    root.after(5000, lambda: root.destroy())  # Fecha depois de 5 segundos
    root.mainloop()

def attendance_accepted(username, similiaridade):
    root = Tk()

    root.title("Smart Attendance")

    root.attributes('-fullscreen', True)
    root.title("Smart Attendance")

    label = Label(root, text=f"Presença do {username} aceite com uma similaridade de {similiaridade}", font=("Helvetica", 48))
    label.pack(expand=True)
    delayed(5)(close_window)()


def close_window():
    root = Tk()
    root.destroy()