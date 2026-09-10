"""Photo filenames for each seeded make/model.

The actual files live in web/public/cars/ and are served by the frontend
(Vercel's CDN), so seeded ListingImage.url values are web-relative paths like
"/cars/vw-golf-1.jpg". User-uploaded photos, by contrast, are "/uploads/..."
and served by the API — see web/lib/images.ts for how the frontend tells them
apart. Source: Wikimedia Commons (CC-licensed), downloaded once.
"""

CAR_IMAGES: dict[tuple[str, str], list[str]] = {
    ("Volkswagen", "Golf"):   ["/cars/vw-golf-1.jpg", "/cars/vw-golf-2.jpg"],
    ("Volkswagen", "Passat"): ["/cars/vw-passat-1.jpg", "/cars/vw-passat-2.jpg"],
    ("Ford", "Fiesta"):       ["/cars/ford-fiesta-1.jpg", "/cars/ford-fiesta-2.jpg"],
    ("Ford", "Focus"):        ["/cars/ford-focus-1.jpg", "/cars/ford-focus-2.jpg"],
    ("BMW", "3 Series"):      ["/cars/bmw-3series-1.jpg", "/cars/bmw-3series-2.jpg"],
    ("BMW", "X3"):            ["/cars/bmw-x3-1.jpg", "/cars/bmw-x3-2.jpg"],
    ("Toyota", "Corolla"):    ["/cars/toyota-corolla-1.jpg", "/cars/toyota-corolla-2.jpg"],
    ("Toyota", "RAV4"):       ["/cars/toyota-rav4-1.jpg", "/cars/toyota-rav4-2.jpg"],
    ("Audi", "A3"):           ["/cars/audi-a3-1.jpg", "/cars/audi-a3-2.jpg"],
    ("Nissan", "Qashqai"):    ["/cars/nissan-qashqai-1.jpg", "/cars/nissan-qashqai-2.jpg"],
    ("Vauxhall", "Corsa"):    ["/cars/vauxhall-corsa-1.jpg", "/cars/vauxhall-corsa-2.jpg"],
    ("Tesla", "Model 3"):     ["/cars/tesla-model3-1.jpg", "/cars/tesla-model3-2.jpg"],
}
