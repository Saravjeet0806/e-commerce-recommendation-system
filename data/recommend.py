import json

# load data
with open("data/products.json") as f:
    products = json.load(f)

# simple recommendation
def recommend(product_id):
    current = next((p for p in products if p["id"] == product_id), None)

    if not current:
        return []

    ranked = []

    for p in products:
        if p["id"] == product_id:
            continue

        score = p.get("rating", 0) * 10

        if p["category"] == current["category"]:
            score += 60

        price_gap = abs(p.get("price", 0) - current.get("price", 0))
        score += max(0, 25 - int(price_gap // 150))
        ranked.append((score, p["id"]))

    ranked.sort(reverse=True)
    return [product_id for _, product_id in ranked[:4]]


# test
print(recommend(1))
