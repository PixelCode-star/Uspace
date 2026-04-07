from PIL import Image, ImageDraw

def process_android_icon(in_path, out_path):
    img = Image.open(in_path).convert("RGBA")
    
    bg_color = (10, 10, 10, 255) # Deep black/navy base theme
    
    try:
        ImageDraw.floodfill(img, xy=(0, 0), value=bg_color, thresh=50)
        ImageDraw.floodfill(img, xy=(img.width-1, 0), value=bg_color, thresh=50)
        ImageDraw.floodfill(img, xy=(0, img.height-1), value=bg_color, thresh=50)
        ImageDraw.floodfill(img, xy=(img.width-1, img.height-1), value=bg_color, thresh=50)
    except Exception as e:
        pass
        
    datas = img.getdata()
    newData = []
    for item in datas:
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            newData.append(bg_color)
        else:
            newData.append(item)
    img.putdata(newData)
    
    img.save(out_path, "PNG")

process_android_icon("assets/icon.png", "assets/icon.png")
process_android_icon("public/logo.png", "public/logo.png") # Just in case we want the old one black too

print("Done")
