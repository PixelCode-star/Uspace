from PIL import Image
import os

def process_logo(img_path, out_path):
    if not os.path.exists(img_path):
        return
        
    img = Image.open(img_path).convert("RGBA")
    datas = img.getdata()

    newData = []
    # If pixel is close to white, make it transparent
    for item in datas:
        # Check if R, G, B are all high (white background)
        if item[0] > 230 and item[1] > 230 and item[2] > 230:
            # Change to black as requested, or transparent. 
            # The prompt says "turned it black", let's turn it black
            newData.append((0, 0, 0, 255))
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(out_path, "PNG")

process_logo("public/logo.png", "public/logo.png")
process_logo("assets/icon.png", "assets/icon.png")
print("Done")
