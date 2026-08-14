import csv
import random
from pathlib import Path


# ============================================================
# ORIGINX - LARGE FICTIONAL BFSI DATASET GENERATOR
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

DATA_FOLDER = BASE_DIR / "data"

DATA_FOLDER.mkdir(
    parents=True,
    exist_ok=True
)

OUTPUT_FILE = DATA_FOLDER / "bfsi_demo_5000.csv"


# Fixed seed = same demo dataset every time
random.seed(42)


# ============================================================
# DATA OPTIONS
# ============================================================

FIRST_NAMES = [
    "Rahul",
    "Aisha",
    "Arjun",
    "Sara",
    "Kabir",
    "Neha",
    "Imran",
    "Priya",
    "Aditya",
    "Zoya",
    "Aman",
    "Riya",
    "Karan",
    "Fatima",
    "Rohan",
    "Ananya"
]


CITIES = [
    "Mumbai",
    "Pune",
    "Delhi",
    "Bangalore",
    "Hyderabad",
    "Chennai",
    "Ahmedabad",
    "Kolkata"
]


EMPLOYMENT_TYPES = [
    "Salaried",
    "Self-Employed",
    "Business"
]


LOAN_STATUSES = [
    "Approved",
    "Rejected"
]


# ============================================================
# GENERATE ONE RECORD
# ============================================================

def generate_record():

    age = random.randint(21, 65)

    income = random.randint(
        25000,
        150000
    )

    credit_score = random.randint(
        450,
        850
    )

    loan_amount = random.randint(
        50000,
        1000000
    )

    employment_type = random.choice(
        EMPLOYMENT_TYPES
    )

    city = random.choice(
        CITIES
    )

    # Simple realistic relationship:
    # Higher credit score generally increases
    # approval probability.
    approval_probability = (
        0.20
        + (credit_score - 450) / 500 * 0.65
    )

    if random.random() < approval_probability:

        loan_status = "Approved"

    else:

        loan_status = "Rejected"

    name = random.choice(
        FIRST_NAMES
    )

    return [
        name,
        age,
        income,
        credit_score,
        loan_amount,
        employment_type,
        loan_status,
        city
    ]


# ============================================================
# CREATE DATASET
# ============================================================

def create_dataset():

    headers = [
        "name",
        "age",
        "income",
        "credit_score",
        "loan_amount",
        "employment_type",
        "loan_status",
        "city"
    ]

    print("Generating 5,000 fictional BFSI records...")

    with open(
        OUTPUT_FILE,
        "w",
        newline="",
        encoding="utf-8"
    ) as file:

        writer = csv.writer(file)

        writer.writerow(headers)

        for _ in range(5000):

            writer.writerow(
                generate_record()
            )

    print()
    print("==========================================")
    print("       ORIGINX DATASET READY")
    print("==========================================")
    print(f"Records : 5000")
    print(f"File    : {OUTPUT_FILE}")
    print("==========================================")


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":

    create_dataset()