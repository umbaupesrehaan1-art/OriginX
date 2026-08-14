from pathlib import Path

import pandas as pd


# ============================================================
# ORIGINX - PRIVACY ANALYSIS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_FOLDER = BASE_DIR / "data"

SYNTHETIC_FOLDER = DATA_FOLDER / "synthetic"


def privacy_audit(
    original_filename: str,
    synthetic_filename: str
):

    original_path = DATA_FOLDER / original_filename

    synthetic_path = (
        SYNTHETIC_FOLDER / synthetic_filename
    )

    if not original_path.exists():
        raise FileNotFoundError(
            f"Original dataset not found: {original_path}"
        )

    if not synthetic_path.exists():
        raise FileNotFoundError(
            f"Synthetic dataset not found: {synthetic_path}"
        )

    original = pd.read_csv(
        original_path
    )

    synthetic = pd.read_csv(
        synthetic_path
    )

    common_columns = [
        column
        for column in original.columns
        if column in synthetic.columns
    ]

    # --------------------------------------------------------
    # Exact record matching
    # --------------------------------------------------------

    original_records = set(
        tuple(row)
        for row in original[
            common_columns
        ].astype(str).values
    )

    synthetic_records = set(
        tuple(row)
        for row in synthetic[
            common_columns
        ].astype(str).values
    )

    exact_matches = len(
        original_records.intersection(
            synthetic_records
        )
    )

    # --------------------------------------------------------
    # Sensitive column detection
    # --------------------------------------------------------

    sensitive_keywords = [

        "name",
        "email",
        "phone",
        "mobile",
        "address",
        "aadhaar",
        "aadhar",
        "pan",
        "account",
        "income",
        "salary",
        "credit_score",
        "patient",
        "diagnosis",
        "medical"

    ]

    sensitive_columns = []

    for column in common_columns:

        column_name = column.lower()

        for keyword in sensitive_keywords:

            if keyword in column_name:

                sensitive_columns.append(
                    column
                )

                break

    # --------------------------------------------------------
    # Privacy risk indicator
    # --------------------------------------------------------

    if exact_matches > 0:

        privacy_risk = "HIGH"

    elif len(sensitive_columns) >= 4:

        privacy_risk = "MEDIUM"

    else:

        privacy_risk = "LOW"

    # --------------------------------------------------------
    # Return result
    # --------------------------------------------------------

    return {

        "success": True,

        "privacy_audit": {

            "original_records": len(
                original
            ),

            "synthetic_records": len(
                synthetic
            ),

            "sensitive_columns": (
                sensitive_columns
            ),

            "exact_record_matches": (
                exact_matches
            ),

            "privacy_risk_indicator": (
                privacy_risk
            ),

            "note": (
                "This is a privacy-risk indicator "
                "and does not by itself establish "
                "Differential Privacy or DPDP compliance."
            )

        }

    }