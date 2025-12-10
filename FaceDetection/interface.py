#Here we will display while the process is ongoing
from tkinter import *

def change_interface_message(new_msg, new_color):
    global msg, color
    msg = new_msg
    color = new_color

def interface(mensage, color):

    root = Tk()

    root.title("Smart Attendance")

    root.attributes('-fullscreen', True)
    root.title("Smart Attendance")

    label = Label(root, text=f"{mensage}", font=("Helvetica", 48), fg=color)
    label.pack(expand=True)
    root.mainloop()

