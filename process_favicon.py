from PIL import Image

def create_favicon(in_path, out_path):
    img = Image.open(in_path).convert("RGBA")
    
    # Get bounding box of all non-transparent pixels!
    bbox = img.getbbox()
    if bbox:
        # crop to the exact logo
        img = img.crop(bbox)
        
        # Add a tiny 4% padding so it has a tiny bit of breathing room
        padding = int(max(img.width, img.height) * 0.04)
        new_size = (img.width + padding*2, img.height + padding*2)
        padded_img = Image.new("RGBA", new_size, (0, 0, 0, 0))
        
        # Paste neatly into the center
        paste_x = padding + (max(img.width, img.height) - img.width) // 2
        paste_y = padding + (max(img.width, img.height) - img.height) // 2
        padded_img.paste(img, (paste_x, paste_y))
        
        # It's best if favicons are perfectly square, so max() handles that.
        padded_img.save(out_path, "PNG")
        print("Cropped smoothly!")
    else:
        img.save(out_path, "PNG")
        print("No bounding box found.")

create_favicon("public/logo-nobg.png", "public/favicon.png")
