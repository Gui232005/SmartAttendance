from tkinter import *

msg = "A processar..."
color = "black"

# Guardar referência global ao label
label_ref = None  

def change_interface_message(new_msg, new_color):
    global msg, color, label_ref
    
    msg = new_msg
    color = new_color

    # Atualiza apenas se a interface já estiver aberta
    if label_ref is not None:
        label_ref.config(text=new_msg, fg=new_color)


def interface(initial_msg, initial_color):
    global label_ref

    root = Tk()
    root.title("Smart Attendance")
    root.attributes('-fullscreen', True)

    label_ref = Label(root, text=initial_msg, font=("Helvetica", 48), fg=initial_color)
    label_ref.pack(expand=True)

    root.mainloop()

