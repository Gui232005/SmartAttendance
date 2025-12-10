#Here we will display when it's rejected
from tkinter import *

def reject_attendance_interface():
    root = Tk()

    root.title("Smart Attendance")

    root.attributes('-fullscreen', True)
    root.title("Smart Attendance")

    label = Label(root, text="Presença rejeitada. \nNenhuma correspondência suficiente encontrada.", font=("Helvetica", 40))
    label.pack(expand=True)
    root.after(5000, lambda: root.destroy()) #Fecha depois de 5 segundos
    root.mainloop()
