from pathlib import Path

import pandas as pd

from sdmetrics.single_column import (
    KSComplement,
    TVComplement,
)


# ============================================================
# ORIGINX - SYNTHETIC DATA AUDIT
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_FOLDER = BASE_DIR / "data"

SYNTHETIC_FOLDER = DATA_FOLDER / "synthetic"


def audit_synthetic_data(
    original_filename: str,
    synthetic_filename: str,
):
    # --------------------------------------------------------
    # 1. Locate files
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # 2. Load datasets
    # --------------------------------------------------------

    original = pd.read_csv(original_path)

    synthetic = pd.read_csv(synthetic_path)

    # --------------------------------------------------------
    # 3. Check columns
    # --------------------------------------------------------

    common_columns = [
        column
        for column in original.columns
        if column in synthetic.columns
    ]

    if not common_columns:
        raise ValueError(
            "No common columns found between datasets."
        )

    # --------------------------------------------------------
    # 4. Separate column types
    # --------------------------------------------------------

    numerical_columns = []

    categorical_columns = []

    for column in common_columns:

        if pd.api.types.is_numeric_dtype(
            original[column]
        ):

            numerical_columns.append(column)

        else:

            categorical_columns.append(column)

    # --------------------------------------------------------
    # 5. Calculate column-level quality
    # --------------------------------------------------------

    column_scores = {}

    # Numerical columns
    for column in numerical_columns:

        try:

            score = KSComplement.compute(
                real_data=original[column],
                synthetic_data=synthetic[column]
            )

            column_scores[column] = round(
                float(score) * 100,
                2
            )

        except Exception:

            column_scores[column] = None

    # Categorical columns
    for column in categorical_columns:

        try:

            score = TVComplement.compute(
                real_data=original[column],
                synthetic_data=synthetic[column]
            )

            column_scores[column] = round(
                float(score) * 100,
                2
            )

        except Exception:

            column_scores[column] = None

    # --------------------------------------------------------
    # 6. Remove failed metrics
    # --------------------------------------------------------

    valid_scores = [
        score
        for score in column_scores.values()
        if score is not None
    ]

    if valid_scores:

        overall_quality = sum(
            valid_scores
        ) / len(valid_scores)

    else:

        overall_quality = 0

    # --------------------------------------------------------
    # 7. Calculate basic record matching
    # --------------------------------------------------------

    original_records = set(
        tuple(row)
        for row in original[common_columns]
        .astype(str)
        .values
    )

    synthetic_records = set(
        tuple(row)
        for row in synthetic[common_columns]
        .astype(str)
        .values
    )

    matching_records = len(
        original_records.intersection(
            synthetic_records
        )
    )

    # --------------------------------------------------------
    # 8. Privacy indicator
    # --------------------------------------------------------

    if matching_records == 0:

        record_match_status = "NO_DIRECT_MATCH"

    else:

        record_match_status = "MATCHES_DETECTED"

    # --------------------------------------------------------
    # 9. Final audit result
    # --------------------------------------------------------

    return {

        "success": True,

        "audit": {

            "original_records": len(
                original
            ),

            "synthetic_records": len(
                synthetic
            ),

            "common_columns": common_columns,

            "numerical_columns": numerical_columns,

            "categorical_columns": categorical_columns,

            "overall_quality_score": round(
                overall_quality,
                2
            ),

            "column_scores": column_scores,

            "direct_record_matches": matching_records,

            "record_match_status": record_match_status

        }

    }