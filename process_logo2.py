from PIL import Image, ImageDraw
import os

def check_color_distance(c1, c2):
    return abs(c1[0]-c2[0]) + abs(c1[1]-c2[1]) + abs(c1[2]-c2[2])

def process_logo(in_path, out_path):
    img = Image.open(in_path).convert("RGBA")
    
    # Floodfill uses the color of the target pixel. 
    # White background removal
    try:
        ImageDraw.floodfill(img, xy=(0, 0), value=(0, 0, 0, 0), thresh=50)
        ImageDraw.floodfill(img, xy=(img.width-1, 0), value=(0, 0, 0, 0), thresh=50)
        ImageDraw.floodfill(img, xy=(0, img.height-1), value=(0, 0, 0, 0), thresh=50)
        ImageDraw.floodfill(img, xy=(img.width-1, img.height-1), value=(0, 0, 0, 0), thresh=50)
    except Exception as e:
        print("Floodfill error:", e)
        # fallback
        datas = img.getdata()
        newData = []
        for item in datas:
            if item[0] > 220 and item[1] > 220 and item[2] > 220:
                newData.append((0, 0, 0, 0))
            else:
                newData.append(item)
        img.putdata(newData)

    # Secondary sweep for left-over white halos
    datas = img.getdata()
    newData = []
    for item in datas:
        if item[3] > 0 and item[0] > 240 and item[1] > 240 and item[2] > 240:
            newData.append((0, 0, 0, 0))
        else:
            newData.append(item)
    img.putdata(newData)
    
    img.save(out_path, "PNG")

process_logo("assets/icon.png", "public/logo-nobg.png")
print("Saved to public/logo-nobg.png")
