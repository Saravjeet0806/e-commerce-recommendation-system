from pathlib import Path
from flask import Flask, jsonify, request, send_from_directory
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from auth import auth_bp
from database import init_db
import base64
import hashlib
import hmac
import json
import os
import uuid


PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = PROJECT_ROOT / "data" / "products.json"
RAZORPAY_KEY_ID = os.environ.get("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET", "")
RAZORPAY_ORDERS_URL = "https://api.razorpay.com/v1/orders"

app = Flask(__name__, static_folder=None)

app.secret_key = "ecommerce_secret_key"
init_db()

app.register_blueprint(auth_bp)
pending_orders = {}


@app.after_request
def allow_local_frontend(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


def load_products():
    with open(DATA_FILE, encoding="utf-8") as file:
        return json.load(file)


def find_product(product_id):
    for product in load_products():
        if int(product["id"]) == int(product_id):
            return product
    return None


def recommend_products(product_id, limit=4):
    products = load_products()
    current = find_product(product_id)

    if not current:
        return []

    ranked = []

    for product in products:
        if int(product["id"]) == int(product_id):
            continue

        score = float(product.get("rating", 0)) * 10

        if product["category"] == current["category"]:
            score += 60

        price_gap = abs(float(product.get("price", 0)) - float(current.get("price", 0)))
        score += max(0, 25 - int(price_gap // 150))

        ranked.append((score, product))

    ranked.sort(key=lambda item: item[0], reverse=True)
    return [product for _, product in ranked[:limit]]


def calculate_cart_total(cart):
    products_by_id = {int(product["id"]): product for product in load_products()}
    total = 0

    for product_id in cart:
        try:
            product = products_by_id[int(product_id)]
        except (KeyError, TypeError, ValueError):
            raise ValueError("Cart contains an invalid product.")

        total += int(product["price"])

    return total


def create_razorpay_order(amount):
    credentials = base64.b64encode(f"{RAZORPAY_KEY_ID}:{RAZORPAY_KEY_SECRET}".encode()).decode()
    payload = json.dumps(
        {
            "amount": amount,
            "currency": "INR",
            "receipt": f"eshop_{uuid.uuid4().hex[:20]}",
        }
    ).encode()
    razorpay_request = Request(
        RAZORPAY_ORDERS_URL,
        data=payload,
        headers={
            "Authorization": f"Basic {credentials}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    with urlopen(razorpay_request, timeout=10) as response:
        return json.loads(response.read().decode())


@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/api/products")
def get_products():
    return jsonify(load_products())


@app.route("/api/products/<int:product_id>")
def get_product(product_id):
    product = find_product(product_id)

    if not product:
        return jsonify({"error": "Product not found"}), 404

    return jsonify(product)


@app.route("/api/recommend")
def get_recommendations():
    product_id = request.args.get("id", type=int)

    if product_id is None:
        return jsonify({"error": "Product id is required"}), 400

    return jsonify(recommend_products(product_id))


@app.route("/api/payments/create-order", methods=["POST"])
def create_payment_order():
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        return jsonify({"error": "Razorpay is not configured. Add the Razorpay API keys and restart the backend."}), 503

    payload = request.get_json(silent=True) or {}
    cart = payload.get("cart") or []

    if not isinstance(cart, list) or not cart:
        return jsonify({"error": "Add at least one product before checkout."}), 400

    try:
        amount = calculate_cart_total(cart) * 100
        order = create_razorpay_order(amount)
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    except (HTTPError, URLError, TimeoutError):
        return jsonify({"error": "Unable to create a Razorpay order. Please try again."}), 502

    pending_orders[order["id"]] = {"amount": amount}

    return jsonify(
        {
            "key_id": RAZORPAY_KEY_ID,
            "order_id": order["id"],
            "amount": amount,
            "currency": "INR",
        }
    )


@app.route("/api/payments/verify", methods=["POST"])
def verify_payment():
    payload = request.get_json(silent=True) or {}
    order_id = payload.get("razorpay_order_id") or ""
    payment_id = payload.get("razorpay_payment_id") or ""
    supplied_signature = payload.get("razorpay_signature") or ""

    if order_id not in pending_orders or not payment_id or not supplied_signature:
        return jsonify({"error": "Payment verification details are invalid."}), 400

    expected_signature = hmac.new(
        RAZORPAY_KEY_SECRET.encode(),
        f"{order_id}|{payment_id}".encode(),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected_signature, supplied_signature):
        return jsonify({"error": "Payment signature verification failed."}), 400

    pending_orders.pop(order_id, None)
    return jsonify({"success": True, "message": "Payment verified successfully."})


@app.route("/")
def home():
    return send_from_directory(PROJECT_ROOT, "index.html")


@app.route("/<path:filename>")
def serve_project_file(filename):
    return send_from_directory(PROJECT_ROOT, filename)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True, use_reloader=False)
